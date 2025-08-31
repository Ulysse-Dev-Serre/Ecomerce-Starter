import { NextRequest, NextResponse } from 'next/server'
import { getProducts, searchProducts } from '../../../lib/products'
import { Language } from '../../../generated/prisma'

// GET /api/products - Liste des produits avec support multilingue et recherche
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const language = (searchParams.get('language') as Language) || Language.EN
  const search = searchParams.get('search')

  try {
    const result = search 
      ? await searchProducts(search, language)
      : await getProducts(language)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      data: result.data, 
      count: result.data?.length || 0 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
