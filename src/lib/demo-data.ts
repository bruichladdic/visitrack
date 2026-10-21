// Données de démonstration VisiTrack — semaine du 19 au 24 octobre 2026, Dakar
// Partagées entre le seed local (prisma/seed.ts) et l'auto-provisioning
// au premier démarrage (src/lib/db.ts).

export interface DemoVisit {
  day: string
  slot: string
  client: string
  type: 'MEDECIN' | 'PHARMACIE' | 'CLINIQUE' | 'HOPITAL'
  quartier: string
  objective: string
  status: 'PLANIFIEE' | 'TERMINEE' | 'REPORTEE'
}

export const DEMO_VISITS: DemoVisit[] = [
  { day: '2026-10-19', slot: '09:00 - 10:00', client: 'Dr. Awa Ndiaye', type: 'MEDECIN', quartier: 'Point E', objective: 'Présentation nouvelle gamme antalgiques', status: 'TERMINEE' },
  { day: '2026-10-19', slot: '10:30 - 11:30', client: 'Pharmacie Point E', type: 'PHARMACIE', quartier: 'Point E', objective: 'Prise de commande + pose PLV', status: 'TERMINEE' },
  { day: '2026-10-19', slot: '15:00 - 16:00', client: 'Dr. Ibrahima Fall', type: 'MEDECIN', quartier: 'Fann', objective: 'Relance prescriptions', status: 'TERMINEE' },
  { day: '2026-10-20', slot: '09:00 - 10:00', client: 'Clinique Fann', type: 'CLINIQUE', quartier: 'Fann', objective: 'Rencontre équipe + dépôt échantillons', status: 'TERMINEE' },
  { day: '2026-10-20', slot: '11:00 - 12:00', client: 'Pharmacie Sacré-Cœur', type: 'PHARMACIE', quartier: 'Sacré-Cœur', objective: "Formation de l'équipe officinale", status: 'TERMINEE' },
  { day: '2026-10-20', slot: '16:00 - 17:00', client: 'Dr. Mor Sow', type: 'MEDECIN', quartier: 'Mermoz', objective: 'Suivi prescriptions — replanifier', status: 'REPORTEE' },
  { day: '2026-10-21', slot: '09:00 - 10:00', client: 'Pharmacie Médina', type: 'PHARMACIE', quartier: 'Médina', objective: 'Commande + suivi des stocks', status: 'TERMINEE' },
  { day: '2026-10-21', slot: '10:30 - 11:30', client: 'Dr. Fatou Gueye', type: 'MEDECIN', quartier: 'Médina', objective: 'Présentation gamme pédiatrique', status: 'PLANIFIEE' },
  { day: '2026-10-21', slot: '14:30 - 15:30', client: 'Hôpital Idrissa Pouye', type: 'HOPITAL', quartier: 'Grand Yoff', objective: 'Visite de service + RDV chef de service', status: 'PLANIFIEE' },
  { day: '2026-10-21', slot: '16:30 - 17:30', client: 'Pharmacie Liberté 6', type: 'PHARMACIE', quartier: 'Liberté 6', objective: 'Nouveautés + reprise PLV', status: 'PLANIFIEE' },
  { day: '2026-10-22', slot: '09:30 - 10:30', client: 'Dr. Cheikh Diop', type: 'MEDECIN', quartier: 'Plateau', objective: 'Information sur nouveau dosage', status: 'PLANIFIEE' },
  { day: '2026-10-22', slot: '11:30 - 12:30', client: 'Pharmacie Ouakam', type: 'PHARMACIE', quartier: 'Ouakam', objective: 'Commande mensuelle', status: 'PLANIFIEE' },
  { day: '2026-10-23', slot: '10:00 - 11:00', client: 'Clinique de la Corniche', type: 'CLINIQUE', quartier: 'Ouakam', objective: 'Démo dispositifs + échantillons', status: 'PLANIFIEE' },
  { day: '2026-10-23', slot: '15:00 - 16:00', client: 'Dr. Aminata Ba', type: 'MEDECIN', quartier: 'Mermoz', objective: 'Fidélisation — retour sur essai produit', status: 'PLANIFIEE' },
  { day: '2026-10-24', slot: '10:00 - 11:00', client: 'Pharmacie Mermoz', type: 'PHARMACIE', quartier: 'Mermoz', objective: 'Bilan hebdo commandes', status: 'PLANIFIEE' },
]
