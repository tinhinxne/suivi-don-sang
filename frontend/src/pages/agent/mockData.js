// Données de démonstration de l'espace agent.
// À remplacer par des appels API quand le backend sera prêt.

// Tableau de bord
export const dashboardStats = {
  pendingAnalysis: 1,
  availableBags: 1,
  pendingRequests: 1,
}

export const dashboardStocks = [
  { group: 'O+', count: 1 },
  { group: 'A+', count: 0 },
  { group: 'B+', count: 0 },
  { group: 'AB+', count: 0 },
  { group: 'O-', count: 0 },
  { group: 'A-', count: 0 },
  { group: 'B-', count: 0 },
  { group: 'AB-', count: 0 },
]

// Analyses : poches en attente de résultat
export const analysisPoches = [
  {
    id: 'POCHE-2026-0007',
    group: 'A-',
    date: '10 mars 2026',
    place: 'Université de Béjaïa',
  },
]

// Stock
export const stockCounts = {
  'A+': 12,
  'A-': 5,
  'B+': 8,
  'B-': 3,
  'AB+': 4,
  'AB-': 2,
  'O+': 16,
  'O-': 7,
}

export const stockPoches = [
  { id: 'POCHE-2026-0008', group: 'O+', date: '12 mars 2026', status: 'available' },
  { id: 'POCHE-2026-0006', group: 'B+', date: '8 mars 2026', status: 'reserved' },
  { id: 'POCHE-2026-0005', group: 'AB+', date: '4 mars 2026', status: 'distributed' },
]

// Poches acceptées en analyse, en attente d'entrer au stock
export const stockPending = [
  { id: 'POCHE-2026-0007', group: 'A-', date: '10 mars 2026', status: 'available' },
]

// Demandes reçues des médecins
export const receivedRequests = [
  {
    id: 'DEM-2026-0032',
    hospital: 'CHU de Béjaïa',
    doctor: 'Dr. Samir Khelifi',
    group: 'O+',
    quantity: 3,
    urgency: 'critical',
    date: '13 mars 2026',
    status: 'pending',
  },
  {
    id: 'DEM-2026-0031',
    hospital: 'EPH Akbou',
    doctor: 'Dr. Nawel Benyahia',
    group: 'B+',
    quantity: 2,
    urgency: 'urgent',
    date: '12 mars 2026',
    status: 'partial',
  },
  {
    id: 'DEM-2026-0030',
    hospital: "Clinique Rameau d'Olivier",
    doctor: 'Dr. Samir Khelifi',
    group: 'A-',
    quantity: 1,
    urgency: 'normal',
    date: '11 mars 2026',
    status: 'accepted',
  },
  {
    id: 'DEM-2026-0029',
    hospital: 'CHU de Béjaïa',
    doctor: 'Dr. Samir Khelifi',
    group: 'AB+',
    quantity: 1,
    urgency: 'urgent',
    date: '8 mars 2026',
    status: 'distributed',
  },



  
]

// Distribution : demandes acceptées (ou partiellement satisfaites)
export const distributionRequests = receivedRequests.filter(
  (r) => r.status === 'accepted' || r.status === 'partial'
)

// Poches disponibles pouvant être affectées à une demande
export const distributionBags = [
  { id: 'POCHE-2026-0010', group: 'B+', date: '9 mars 2026' },
  { id: 'POCHE-2026-0011', group: 'B+', date: '10 mars 2026' },
  { id: 'POCHE-2026-0012', group: 'O+', date: '12 mars 2026' },
]

// Traçabilité : historique des opérations d'une poche, indexé par référence
// export const traceRecords = {
//   'POCHE-2026-0005': {
//     id: 'POCHE-2026-0005',
//     group: 'AB+',
//     status: 'distributed',
//     events: [
//       {
//         type: 'Collecte',
//         actor: 'Karim Azzoug',
//         date: '4 mars 2026 · 09:14',
//         hash: '0x71b4e9c2a85d3f06b1e7d94a2c58f03e6a1b97d4c05e82f3a6d19b7c4e308f2c',
//       },
//       {
//         type: "Résultat d'analyse",
//         actor: 'Dr. Leila Merabet',
//         date: '4 mars 2026 · 15:42',
//         hash: '0xa3f0129e47bc58d1f6a02c93e7b4d81a5f60c27e9b3d4a18c6f5e0b2d7a944be',
//       },
//       {
//         type: 'Entrée en stock',
//         actor: 'Nadia Bensalem',
//         date: '12 mars 2026 · 17:05',
//         hash: '0x8cd741a2f69e03b5d8c17a4e92f0b6d35a8e1c47f20d9b63e5a7c18f4d0b12aa',
//       },
//       {
//         type: 'Distribution',
//         actor: 'Karim Azzoug',
//         date: '13 mars 2026 · 11:30',
//         hash: '0xf4170b83d5a29c6e1f07b4d8a3c92e65b0d1f748a6c3e92d5b8071fa4c6ec838',
//       },
//     ],

    
//   },
  

  
// }
export const traceRecords = {
  'POCHE-2026-0005': {
    id: 'POCHE-2026-0005',
    group: 'AB+',
    status: 'distributed',
    events: [
      {
        type: 'Collecte',
        actor: 'Karim Azzoug',
        date: '4 mars 2026 · 09:14',
        hash: '0x71b4e9c2a85d3f06b1e7d94a2c58f03e6a1b97d4c05e82f3a6d19b7c4e308f2c',
        txHash: '0x3e91c7a04b5d28f6e1a7c093d4b85f2a61e0c9d7a3b48f5e2d160c7b9a4e83f1',
        block: 12,
      },
      {
        type: "Résultat d'analyse",
        actor: 'Dr. Leila Merabet',
        date: '4 mars 2026 · 15:42',
        hash: '0xa3f0129e47bc58d1f6a02c93e7b4d81a5f60c27e9b3d4a18c6f5e0b2d7a944be',
        txHash: '0xb82f40d1e6a9375c0d8e2b61f4a7c935e1d05a8b3c7f4296a0e5d1b8c3f7a264',
        block: 14,
      },
      {
        type: 'Entrée en stock',
        actor: 'Nadia Bensalem',
        date: '12 mars 2026 · 17:05',
        hash: '0x8cd741a2f69e03b5d8c17a4e92f0b6d35a8e1c47f20d9b63e5a7c18f4d0b12aa',
        txHash: '0x5a07d9e3c1b48f62a3e7051d9c4b8f207e6a1d3b5c92f084d1a8e47b0c356f9e',
        block: 19,
      },
      {
        type: 'Distribution',
        actor: 'Karim Azzoug',
        date: '13 mars 2026 · 11:30',
        hash: '0xf4170b83d5a29c6e1f07b4d8a3c92e65b0d1f748a6c3e92d5b8071fa4c6ec838',
        txHash: '0xc4d2186fa0e5b9371f8a3c6d0b52e749a96e1c0d7b4f3825e0b7d3a1f6c94858',
        block: 23,
      },
    ],
  },
}

// Dons : registre des poches
export const donations = [
  {
    id: 'POCHE-2026-0008',
    donorCode: 'DON-2026-0142',
    donor: 'Lina Aït Ahmed',
    date: '12 mars 2026',
    time: '10:05',
    place: 'Centre de transfusion de Béjaïa',
    group: 'O+',
    status: 'available',
    collector: 'Karim Azzoug',
  },
  {
    id: 'POCHE-2026-0007',
    donorCode: 'DON-2026-0139',
    donor: 'Yacine Boukhalfa',
    date: '10 mars 2026',
    time: '09:14',
    place: 'Université de Béjaïa',
    group: 'A-',
    status: 'pending',
    collector: 'Karim Azzoug',
  },
  {
    id: 'POCHE-2026-0006',
    donorCode: 'DON-2026-0137',
    donor: 'Sofia Mebarki',
    date: '8 mars 2026',
    time: '11:20',
    place: 'Centre de transfusion de Béjaïa',
    group: 'B+',
    status: 'reserved',
    collector: 'Karim Azzoug',
  },
  {
    id: 'POCHE-2026-0005',
    donorCode: 'DON-2026-0131',
    donor: 'Amine Haddad',
    date: '4 mars 2026',
    time: '09:14',
    place: 'EPH Akbou',
    group: 'AB+',
    status: 'distributed',
    collector: 'Karim Azzoug',
  },
  {
    id: 'POCHE-2026-0004',
    donorCode: 'DON-2026-0142',
    donor: 'Lina Aït Ahmed',
    date: '2 mars 2026',
    time: '14:40',
    place: 'Clinique Les Oliviers, Béjaïa',
    group: 'O+',
    status: 'rejected',
    collector: 'Karim Azzoug',
  },
  {
    id: 'POCHE-2026-0003',
    donorCode: 'DON-2026-0139',
    donor: 'Yacine Boukhalfa',
    date: '28 février 2026',
    time: '08:55',
    place: 'Centre de transfusion de Béjaïa',
    group: 'A-',
    status: 'accepted',
    collector: 'Karim Azzoug',
  },
]

// Listes du formulaire « Enregistrer un don »
export const donors = [
  { id: 'DON-2026-0142', name: 'Lina Aït Ahmed' },
  { id: 'DON-2026-0139', name: 'Yacine Boukhalfa' },
  { id: 'DON-2026-0137', name: 'Sofia Mebarki' },
  { id: 'DON-2026-0131', name: 'Amine Haddad' },
]

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const places = [
  'Centre de transfusion de Béjaïa',
  'Université de Béjaïa',
  'EPH Akbou',
  'Clinique Les Oliviers, Béjaïa',
]