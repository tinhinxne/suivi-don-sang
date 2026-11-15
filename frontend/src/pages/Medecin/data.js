export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// En dessous de ce nombre de poches, le stock est signalé comme faible
export const LOW_STOCK = 5

export const stock = [
  { group: 'A+', count: 12 },
  { group: 'A-', count: 6 },
  { group: 'B+', count: 8 },
  { group: 'B-', count: 3 },
  { group: 'AB+', count: 4 },
  { group: 'AB-', count: 2 },
  { group: 'O+', count: 16 },
  { group: 'O-', count: 7 },
]

// À adapter à tes établissements
export const HOSPITALS = ['CHU de Béjaïa', "EPH d'Akbou", 'EPH de Sidi Aïch']

export const URGENCIES = ['Normale', 'Urgente', 'Critique']

export const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Approuvée',
  distributed: 'Distribuée',
}

export const initialRequests = [
  { id: 1, date: "Aujourd'hui, 09:20", hospital: 'CHU de Béjaïa', group: 'O+', quantity: 2, urgency: 'Urgente', status: 'pending' },
  { id: 2, date: 'Hier, 14:05', hospital: 'CHU de Béjaïa', group: 'A+', quantity: 3, urgency: 'Normale', status: 'distributed' },
  { id: 3, date: 'Il y a 3 jours', hospital: "EPH d'Akbou", group: 'B-', quantity: 1, urgency: 'Critique', status: 'approved' },
]