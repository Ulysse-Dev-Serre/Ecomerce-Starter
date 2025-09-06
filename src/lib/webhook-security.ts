/**
 * Webhook Security - Anti-rejeu et idempotence
 * 
 * CRITIQUE: Éviter le double traitement d'événements Stripe
 * Protection contre attaques replay et retry storms
 */

import { db } from './db'
import { createHash } from 'crypto'

interface WebhookEventRecord {
  id: string
  eventId: string
  eventType: string
  processed: boolean
  processedAt: Date | null
  payloadHash: string | null
  retryCount: number
  lastError: string | null
  createdAt: Date
}

/**
 * Vérifie si un événement a déjà été traité (idempotence)
 * Enregistre l'événement pour éviter le rejeu
 * 
 * SÉCURITÉ: Utilise une approche "INSERT OR CONFLICT" pour éviter les race conditions
 * En cas de workers parallèles, un seul réussira le CREATE, l'autre récupèrera l'existant
 */
export async function ensureEventIdempotence(
  eventId: string,
  eventType: string,
  payload?: any
): Promise<{ shouldProcess: boolean; isRetry: boolean; eventRecord?: WebhookEventRecord }> {
  try {
    // Calculer hash du payload pour vérification d'intégrité
    const payloadHash = payload ? createPayloadHash(payload) : null

    // APPROCHE SÉCURISÉE: Tenter de créer d'abord (atomic operation)
    // En cas de conflit (event déjà existant), récupérer l'existant
    try {
      const eventRecord = await db.webhookEvent.create({
        data: {
          eventId,
          eventType,
          processed: false,
          payloadHash,
          retryCount: 0
        }
      })
      
      console.log('📝 New webhook event registered:', {
        eventId,
        eventType,
        recordId: eventRecord.id
      })
      
      return { 
        shouldProcess: true, 
        isRetry: false, 
        eventRecord 
      }
      
    } catch (createError: any) {
      // CONFLIT DÉTECTÉ: L'eventId existe déjà (contrainte unique)
      // Cela peut arriver avec des workers parallèles ou des retries Stripe
      
      if (createError?.code === 'P2002' || createError?.message?.includes('Unique constraint')) {
        console.log('🔍 Event conflict detected, fetching existing record:', { eventId })
        
        // Récupérer l'enregistrement existant
        const existingRecord = await db.webhookEvent.findUnique({
          where: { eventId }
        })
        
        if (!existingRecord) {
          // Race condition étrange - l'enregistrement a disparu entre temps
          console.error('⚠️ Race condition: record disappeared after conflict!')
          return { 
            shouldProcess: true, 
            isRetry: false 
          }
        }
        
        console.log('Existing webhook event found:', {
          eventId,
          eventType,
          processed: existingRecord.processed,
          retryCount: existingRecord.retryCount,
          processedAt: existingRecord.processedAt,
        })

        if (existingRecord.processed) {
          // Déjà traité avec succès - ignorer (idempotence)
          console.log('✅ Event already processed successfully - ignoring replay/duplicate')
          return { 
            shouldProcess: false, 
            isRetry: true, 
            eventRecord: existingRecord 
          }
        } else {
          // Échec précédent ou traitement en cours - autoriser retry
          console.log('🔄 Retrying previously failed/pending event')
          
          const updatedRecord = await db.webhookEvent.update({
            where: { eventId },
            data: { 
              retryCount: { increment: 1 },
              payloadHash: payloadHash || existingRecord.payloadHash
            }
          })
          
          return { 
            shouldProcess: true, 
            isRetry: true, 
            eventRecord: updatedRecord 
          }
        }
        
      } else {
        // Erreur différente (problème DB, network, etc.)
        console.error('Unexpected database error during event creation:', createError)
        throw createError
      }
    }

  } catch (error) {
    console.error('Critical error in event idempotence check:', error)
    
    // En cas d'erreur critique, être conservateur et traiter l'événement
    // (mieux traiter en doublon qu'ignorer un vrai événement)
    console.warn('⚠️  Idempotence check failed - processing event (conservative approach)')
    
    return { 
      shouldProcess: true, 
      isRetry: false 
    }
  }
}

/**
 * Marque un événement comme traité avec succès
 */
export async function markEventProcessed(
  eventId: string,
  success: boolean = true,
  error?: string
): Promise<void> {
  try {
    await db.webhookEvent.update({
      where: { eventId },
      data: {
        processed: success,
        processedAt: success ? new Date() : null,
        lastError: error || null
      }
    })
    
    console.log(`Event marked as ${success ? 'processed' : 'failed'}:`, {
      eventId,
      success,
      error: error || null
    })
    
  } catch (updateError) {
    console.error('Failed to update event status:', {
      eventId,
      success,
      error: updateError
    })
  }
}

/**
 * Crée un hash SHA256 du payload pour vérification d'intégrité
 */
function createPayloadHash(payload: any): string {
  return createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
}

/**
 * Nettoie les anciens événements (maintenance)
 * À exécuter périodiquement via cron ou tâche
 */
export async function cleanupOldWebhookEvents(olderThanDays: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
    
    const result = await db.webhookEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        processed: true // Seulement les événements traités avec succès
      }
    })
    
    console.log(`Cleaned up ${result.count} old webhook events older than ${olderThanDays} days`)
    return result.count
    
  } catch (error) {
    console.error('Error cleaning up webhook events:', error)
    return 0
  }
}

/**
 * Obtient les statistiques des événements webhook
 */
export async function getWebhookStats(): Promise<{
  total: number
  processed: number
  failed: number
  pending: number
  avgRetryCount: number
}> {
  try {
    const [total, processed, failed] = await Promise.all([
      db.webhookEvent.count(),
      db.webhookEvent.count({ where: { processed: true } }),
      db.webhookEvent.count({ 
        where: { 
          processed: false, 
          retryCount: { gt: 0 } 
        } 
      })
    ])
    
    const pending = total - processed - failed
    
    const avgRetryCountResult = await db.webhookEvent.aggregate({
      _avg: { retryCount: true }
    })
    
    const avgRetryCount = avgRetryCountResult._avg.retryCount || 0
    
    return {
      total,
      processed,
      failed,
      pending,
      avgRetryCount: Number(avgRetryCount.toFixed(2))
    }
    
  } catch (error) {
    console.error('Error getting webhook stats:', error)
    return {
      total: 0,
      processed: 0,
      failed: 0,
      pending: 0,
      avgRetryCount: 0
    }
  }
}
