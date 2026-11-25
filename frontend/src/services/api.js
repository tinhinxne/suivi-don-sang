const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const getToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token')

export function getUser() {
  const texte = localStorage.getItem('user') || sessionStorage.getItem('user')
  try { return texte ? JSON.parse(texte) : null } catch { return null }
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
}

export async function api(chemin, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}${chemin}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 401) {
    clearSession()
    window.location.href = '/'
    throw new Error('Session expirée')
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || data?.errors?.[0]?.msg || 'Erreur serveur')
  return data
}