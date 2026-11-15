// import {
//   LayoutGrid,
//   Users,
//   ShieldCheck,
//   Settings,
//   Droplets,
//   Plus,
//   Calendar,
// } from 'lucide-react'

import {
  LayoutGrid,
  Users,
  ShieldCheck,
  Settings,
  Droplets,
  Plus,
  Calendar,
  Droplet,
  FlaskConical,
  Package,
  Truck,
  Link2,
} from 'lucide-react'

export const adminNav = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutGrid },
  { to: '/personnel', label: 'Personnel', icon: Users },
  { to: '/roles', label: 'Rôles et permissions', icon: ShieldCheck },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
]

export const doctorNav = [
  { to: '/medecin/dashboard', label: 'Tableau de bord', icon: LayoutGrid },
  { to: '/medecin/poches', label: 'Poches disponibles', icon: Droplets },
  { to: '/medecin/nouvelle-demande', label: 'Nouvelle demande', icon: Plus },
  { to: '/medecin/mes-demandes', label: 'Mes demandes', icon: Calendar },
]

export const agentNav = [
  { to: '/agent/dashboard', label: 'Tableau de bord', icon: LayoutGrid },
  { to: '/agent/dons', label: 'Dons', icon: Droplet },
  { to: '/agent/analyses', label: 'Analyses', icon: FlaskConical },
  { to: '/agent/stock', label: 'Stock', icon: Package },
  { to: '/agent/demandes', label: 'Demandes reçues', icon: Calendar },
  { to: '/agent/distribution', label: 'Distribution', icon: Truck },
  { to: '/agent/tracabilite', label: 'Traçabilité', icon: Link2 },
]

export const agentUser = {
  name: 'Nadia Bensalem',
  initials: 'NB',
  roleLabel: 'Agent du centre',
}

// Données de démonstration, à remplacer par l'utilisateur connecté (API)
export const adminUser = {
  name: 'tinhinane belarbi',
  initials: 'TB',
  roleLabel: 'Administrateur',
}

export const doctorUser = {
  name: 'Dr Rania Belarbi',
  initials: 'RB',
  roleLabel: 'Médecin',
}