import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Checkbox from '../../components/ui/Checkbox'
import Button from '../../components/ui/Button'
import styles from './LoginPage.module.css'

const API_URL = 'http://localhost:3000/api'

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        return
      }
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('token', data.token)
      storage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch {
      setError('Serveur injoignable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <header>
        <p className={styles.eyebrow}>BIENVENUE SUR QATRA</p>
        <h2 className={styles.heading}>Connectez-vous</h2>
        <p className={styles.subtitle}>
          Accédez à votre espace de gestion sécurisé.
        </p>
      </header>

      <Input
        label="Adresse e-mail"
        type="email"
        name="email"
        placeholder="utilisateur@bloodtrace.dz"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        label="Mot de passe"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Checkbox
        label="Se souvenir de moi"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
      />

     {error && <p className="field__error" role="alert">{error}</p>}
      <Button type="submit" withArrow disabled={loading}>
        {loading ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  )
}