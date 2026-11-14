export const stats = {
  total: 9,
  active: 8,
  disabled: 1,
  loginsToday: 5,
  lastLogin: '09:42',
}

export const roles = [
  { label: 'Donneurs', count: 4 },
  { label: 'Médecins', count: 2 },
  { label: 'Agents du centre', count: 2 },
  { label: 'Administrateurs', count: 1 },
]

export const activity = [
  { icon: 'add', tone: 'blue', title: 'Nouveau donneur inscrit', time: "Aujourd'hui, 09:42" },
  { icon: 'shield', tone: 'rose', title: "Permissions d'un médecin modifiées", time: 'Hier, 16:30' },
  { icon: 'ban', tone: 'orange', title: "Compte d'un agent désactivé", time: 'Hier, 11:25' },
  { icon: 'check', tone: 'green', title: "Compte d'un médecin activé", time: 'Il y a 3 jours' },
]