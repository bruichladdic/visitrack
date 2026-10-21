// Seed VisiTrack — semaine de démonstration (semaine du 19 au 24 octobre 2026)
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const DEMO: Array<[string, string, string, string, string, string, string]> = [
  // [day, slot, client, type, quartier, objective, status]
  ['2026-10-19', '09:00 - 10:00', 'Dr. Awa Ndiaye', 'MEDECIN', 'Point E', 'Présentation nouvelle gamme antalgiques', 'TERMINEE'],
  ['2026-10-19', '10:30 - 11:30', 'Pharmacie Point E', 'PHARMACIE', 'Point E', 'Prise de commande + pose PLV', 'TERMINEE'],
  ['2026-10-19', '15:00 - 16:00', 'Dr. Ibrahima Fall', 'MEDECIN', 'Fann', 'Relance prescriptions', 'TERMINEE'],
  ['2026-10-20', '09:00 - 10:00', 'Clinique Fann', 'CLINIQUE', 'Fann', 'Rencontre équipe + dépôt échantillons', 'TERMINEE'],
  ['2026-10-20', '11:00 - 12:00', 'Pharmacie Sacré-Cœur', 'PHARMACIE', 'Sacré-Cœur', "Formation de l'équipe officinale", 'TERMINEE'],
  ['2026-10-20', '16:00 - 17:00', 'Dr. Mor Sow', 'MEDECIN', 'Mermoz', 'Suivi prescriptions — replanifier', 'REPORTEE'],
  ['2026-10-21', '09:00 - 10:00', 'Pharmacie Médina', 'PHARMACIE', 'Médina', 'Commande + suivi des stocks', 'TERMINEE'],
  ['2026-10-21', '10:30 - 11:30', 'Dr. Fatou Gueye', 'MEDECIN', 'Médina', 'Présentation gamme pédiatrique', 'PLANIFIEE'],
  ['2026-10-21', '14:30 - 15:30', 'Hôpital Idrissa Pouye', 'HOPITAL', 'Grand Yoff', 'Visite de service + RDV chef de service', 'PLANIFIEE'],
  ['2026-10-21', '16:30 - 17:30', 'Pharmacie Liberté 6', 'PHARMACIE', 'Liberté 6', 'Nouveautés + reprise PLV', 'PLANIFIEE'],
  ['2026-10-22', '09:30 - 10:30', 'Dr. Cheikh Diop', 'MEDECIN', 'Plateau', 'Information sur nouveau dosage', 'PLANIFIEE'],
  ['2026-10-22', '11:30 - 12:30', 'Pharmacie Ouakam', 'PHARMACIE', 'Ouakam', 'Commande mensuelle', 'PLANIFIEE'],
  ['2026-10-23', '10:00 - 11:00', 'Clinique de la Corniche', 'CLINIQUE', 'Ouakam', 'Démo dispositifs + échantillons', 'PLANIFIEE'],
  ['2026-10-23', '15:00 - 16:00', 'Dr. Aminata Ba', 'MEDECIN', 'Mermoz', 'Fidélisation — retour sur essai produit', 'PLANIFIEE'],
  ['2026-10-24', '10:00 - 11:00', 'Pharmacie Mermoz', 'PHARMACIE', 'Mermoz', 'Bilan hebdo commandes', 'PLANIFIEE'],
]

async function main() {
  await db.visit.deleteMany()
  for (const [day, slot, client, type, quartier, objective, status] of DEMO) {
    await db.visit.create({
      data: { day, slot, client, type, quartier, objective, status },
    })
  }
  const count = await db.visit.count()
  console.log(`Seed OK — ${count} visites`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
