import { NextRequest, NextResponse } from 'next/server'
import { getCategories } from '../../../lib/categories'
import { Language } from '../../../generated/prisma'

// GET /api/categories - Liste des catégories
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const language = (searchParams.get('language') as Language) || Language.EN

  try {
    const result = await getCategories(language)
    
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
