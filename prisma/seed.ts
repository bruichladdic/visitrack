// Seed VisiTrack — semaine de démonstration (semaine du 19 au 24 octobre 2026)
// Usage local : bun prisma/seed.ts   (ou : bunx prisma db seed)
import { PrismaClient } from '@prisma/client'
import { DEMO_VISITS } from '../src/lib/demo-data'

const db = new PrismaClient()

async function main() {
  await db.visit.deleteMany()
  await db.visit.createMany({ data: DEMO_VISITS })
  const count = await db.visit.count()
  console.log(`Seed OK — ${count} visites`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
