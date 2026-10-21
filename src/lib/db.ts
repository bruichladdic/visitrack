import { PrismaClient } from '@prisma/client'
import { DEMO_VISITS } from './demo-data'

// ── Auto-provisioning de la base ────────────────────────────────────────────
// En déploiement serverless (Vercel), il n'existe ni variable DATABASE_URL ni
// fichier SQLite : on fournit donc un chemin par défaut inscriptible (/tmp) et
// on crée le schéma au premier appel via ensureDb(). Les données de
// démonstration se régénèrent automatiquement si la base est vide — le
// stockage /tmp est éphémère par instance, comportement acceptable pour une
// démo. En local, la variable DATABASE_URL du fichier .env reste prioritaire.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:/tmp/visitrack.db'
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  visitrackBoot: Promise<void> | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS "Visit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "client" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "quartier" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "slot" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLANIFIEE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
)`

/**
 * Garantit que le schéma existe et que les données de démonstration sont
 * chargées. Le résultat est mis en cache par instance : l'opération n'est
 * effectuée qu'une seule fois, au premier appel API.
 */
export function ensureDb(): Promise<void> {
  if (!globalForPrisma.visitrackBoot) {
    globalForPrisma.visitrackBoot = (async () => {
      await db.$executeRawUnsafe(CREATE_TABLE_SQL)
      const count = await db.visit.count()
      if (count === 0) {
        await db.visit.createMany({ data: DEMO_VISITS })
      }
    })().catch((err) => {
      // Réinitialise le cache en cas d'échec pour permettre une nouvelle tentative
      globalForPrisma.visitrackBoot = undefined
      throw err
    })
  }
  return globalForPrisma.visitrackBoot
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
