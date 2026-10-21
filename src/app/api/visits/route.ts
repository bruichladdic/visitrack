import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, ensureDb } from '@/lib/db'

export async function GET() {
  try {
    await ensureDb()
    const visits = await db.visit.findMany({
      orderBy: [{ day: 'asc' }, { slot: 'asc' }],
    })
    return NextResponse.json({ visits })
  } catch (err) {
    console.error('GET /api/visits failed:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

const createSchema = z.object({
  client: z.string().min(2, 'Nom du client requis'),
  type: z.enum(['MEDECIN', 'PHARMACIE', 'CLINIQUE', 'HOPITAL']),
  quartier: z.string().min(2, 'Quartier requis'),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
  slot: z.string().min(4, 'Créneau requis'),
  objective: z.string().min(3, 'Objectif requis'),
})

export async function POST(req: NextRequest) {
  try {
    await ensureDb()
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
        { status: 400 }
      )
    }
    const visit = await db.visit.create({ data: parsed.data })
    return NextResponse.json({ visit }, { status: 201 })
  } catch (err) {
    console.error('POST /api/visits failed:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
