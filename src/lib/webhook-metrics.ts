/**
 * Webhook Metrics - Compteurs et analytics événements
 * 
 * Système simple de métriques pour monitoring webhook Stripe
 */

import { db } from './db'

interface WebhookEventSummary {
  eventType: string
  count: number
  successCount: number
  failedCount: string
  avgRetryCount: number
  lastProcessed: Date | null
}

/**
 * Met à jour les métriques d'un type d'événement
 */
export async function incrementEventTypeMetric(
  eventType: string,
  success: boolean = true
): Promise<void> {
  try {
    // Pour l'instant, utilisation simple via logs
    // En production, on pourrait utiliser Redis ou une table dédiée
    
    console.log('📊 Event metrics:', {
      eventType,
      success,
      timestamp: new Date().toISOString()
    })
    
    // TODO: Implémenter avec Redis ou table metrics
    // await redis.incr(`webhook:events:${eventType}:${success ? 'success' : 'failed'}`)
    
  } catch (error) {
    console.error('Error updating event metrics:', error)
  }
}

/**
 * Obtient le résumé des événements webhook par type
 */
export async function getWebhookEventSummary(): Promise<WebhookEventSummary[]> {
  try {
    // Agrégation depuis la table webhook_events
    const summary = await db.webhookEvent.groupBy({
      by: ['eventType'],
      _count: {
        id: true,
      },
      _avg: {
        retryCount: true
      },
      _max: {
        processedAt: true
      },
      orderBy: {
        eventType: 'asc'
      }
    })

    // Compter séparément les succès et échecs
    const detailedSummary = await Promise.all(
      summary.map(async (item) => {
        const successCount = await db.webhookEvent.count({
          where: {
            eventType: item.eventType,
            processed: true
          }
        })

        const failedCount = await db.webhookEvent.count({
          where: {
            eventType: item.eventType,
            processed: false,
            retryCount: { gt: 0 }
          }
        })

        return {
          eventType: item.eventType,
          count: item._count.id,
          successCount,
          failedCount: failedCount.toString(),
          avgRetryCount: Number((item._avg.retryCount || 0).toFixed(2)),
          lastProcessed: item._max.processedAt
        }
      })
    )

    return detailedSummary

  } catch (error) {
    console.error('Error getting webhook event summary:', error)
    return []
  }
}

/**
 * Log récapitulatif des métriques webhook
 */
export async function logWebhookMetricsSummary(): Promise<void> {
  try {
    const summary = await getWebhookEventSummary()
    
    if (summary.length === 0) {
      console.log('📊 Webhook metrics: No events processed yet')
      return
    }

    console.log('📊 WEBHOOK EVENTS SUMMARY')
    console.log('========================')
    
    summary.forEach(item => {
      const successRate = item.count > 0 ? ((item.successCount / item.count) * 100).toFixed(1) : '0'
      
      console.log(`📈 ${item.eventType}:`, {
        total: item.count,
        success: item.successCount,
        failed: item.failedCount,
        successRate: `${successRate}%`,
        avgRetries: item.avgRetryCount,
        lastProcessed: item.lastProcessed?.toISOString() || 'never'
      })
    })
    
    const totalEvents = summary.reduce((sum, item) => sum + item.count, 0)
    const totalSuccess = summary.reduce((sum, item) => sum + item.successCount, 0)
    const overallSuccessRate = totalEvents > 0 ? ((totalSuccess / totalEvents) * 100).toFixed(1) : '0'
    
    console.log('📊 OVERALL:', {
      totalEvents,
      totalSuccess,
      overallSuccessRate: `${overallSuccessRate}%`
    })
    
  } catch (error) {
    console.error('Error logging webhook metrics summary:', error)
  }
}

/**
 * Événements critiques qui nécessitent un traitement
 */
export const CRITICAL_EVENT_TYPES = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.dispute.created'
] as const

/**
 * Événements informationnels (pas d'action requise)
 */
export const INFORMATIONAL_EVENT_TYPES = [
  'payment_intent.created',
  'payment_intent.canceled',
  'customer.created',
  'invoice.created'
] as const

/**
 * Détermine si un type d'événement est critique
 */
export function isCriticalEventType(eventType: string): boolean {
  return CRITICAL_EVENT_TYPES.includes(eventType as any)
}

/**
 * Détermine si un type d'événement est informationnel
 */
export function isInformationalEventType(eventType: string): boolean {
  return INFORMATIONAL_EVENT_TYPES.includes(eventType as any)
}
