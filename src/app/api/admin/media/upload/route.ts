import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-session"
import { isUserAdmin } from "@/lib/auth-admin"
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_WIDTH = 2000
const MAX_HEIGHT = 2000

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: "Type de fichier non supporté. Seuls les fichiers JPG et PNG sont autorisés." 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux. Taille maximum autorisée: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name) || (file.type === 'image/png' ? '.png' : '.jpg')
    const filename = `${timestamp}-${randomString}${extension}`
    const filepath = path.join(uploadDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Optional: Validate image dimensions (requires sharp package)
    // For now, we'll just save the file
    await writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/products/${filename}`

    return NextResponse.json({
      message: "Fichier uploadé avec succès",
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: "Erreur lors de l'upload du fichier" 
    }, { status: 500 })
  }
}
