const CLE = 'suivi-don-lieux'

export function lireLieux() {
  try {
    return JSON.parse(localStorage.getItem(CLE) || '{}')
  } catch {
    return {}
  }
}

export function sauverLieu(donId, lieu) {
  try {
    localStorage.setItem(CLE, JSON.stringify({ ...lireLieux(), [donId]: lieu }))
  } catch { /* stockage indisponible */ }
}