import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Checkbox from '../../components/ui/Checkbox'
import Button from '../../components/ui/Button'
import styles from './LoginPage.module.css'

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)

  function handleSubmit(e) {
    e.preventDefault()
    // TODO : appeler services/api.js avant de rediriger
    navigate('/dashboard')
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

      <Button type="submit" withArrow>Se connecter</Button>
    </form>
  )
}