import { useState } from 'react'
import { Users } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import styles from '../../components/ui/Modal.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CreateAccountModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'Qatra@2026',
    role: 'MEDECIN',
  })
  const [errors, setErrors] = useState({})

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Saisissez le nom complet.'
    if (!EMAIL_RE.test(form.email)) next.email = 'Saisissez une adresse e-mail valide.'
    if (form.password.length < 8) next.password = '8 caractères minimum.'
    setErrors(next)
    if (Object.keys(next).length) return
    onCreate({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role })
  }

  return (
    <Modal
      onClose={onClose}
      icon={Users}
      title="Créer un compte personnel"
      subtitle="Le mot de passe temporaire devra être changé à la première connexion."
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Nom complet"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          autoFocus
        />
        <Input
          label="Adresse e-mail"
          type="email"
          placeholder="nom@bloodtrace.dz"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Input
          label="Mot de passe temporaire"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
        />

        <div className="field">
          <label className="field__label" htmlFor="role">Rôle</label>
          <select id="role" className="field__input" value={form.role} onChange={set('role')}>
            <option value="MEDECIN">MEDECIN</option>
            <option value="AGENT_CENTRE">AGENT_CENTRE</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={styles.confirm}>
            Créer le compte
          </button>
        </div>
      </form>
    </Modal>
  )
}