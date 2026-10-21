import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, ensureDb } from '@/lib/db'

const patchSchema = z.object({
  status: z.enum(['PLANIFIEE', 'TERMINEE', 'REPORTEE']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb()
    const { id } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }
    const visit = await db.visit.update({
      where: { id },
      data: { status: parsed.data.status },
    })
    return NextResponse.json({ visit })
  } catch (err) {
    console.error('PATCH /api/visits/[id] failed:', err)
    return NextResponse.json({ error: 'Visite introuvable' }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb()
    const { id } = await params
    await db.visit.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/visits/[id] failed:', err)
    return NextResponse.json({ error: 'Visite introuvable' }, { status: 404 })
  }
}
