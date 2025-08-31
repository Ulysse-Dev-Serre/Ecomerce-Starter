export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug } from '../../../../lib/products'
import { Language } from '../../../../generated/prisma'

// GET /api/products/[slug] - Produit par slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const language = (searchParams.get('language') as Language) || Language.EN

  try {
    const result = await getProductBySlug(slug, language)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (!result.data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
