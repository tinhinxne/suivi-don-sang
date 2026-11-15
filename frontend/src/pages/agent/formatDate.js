// '2026-03-12' -> '12 mars 2026'
export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}