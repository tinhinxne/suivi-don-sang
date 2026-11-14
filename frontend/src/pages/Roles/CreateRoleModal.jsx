import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import styles from '../../components/ui/Modal.module.css'
import { PERMISSIONS } from './permissions'


function normalize(value) {
  return value
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
}

export default function CreateRoleModal({ existingCodes, onClose, onCreate }) {
  const [code, setCode] = useState('')
  const [actions, setActions] = useState([])
  const [full, setFull] = useState(false)
  const [errors, setErrors] = useState({})

  function toggle(action) {
    setActions((list) =>
      list.includes(action) ? list.filter((a) => a !== action) : [...list, action],
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!code) next.code = 'Saisissez un nom de rôle.'
    else if (existingCodes.includes(code)) next.code = 'Ce rôle existe déjà.'
    if (actions.length === 0) next.actions = 'Cochez au moins une action.'
    setErrors(next)
    if (Object.keys(next).length) return

    // On garde l'ordre de la liste, pas celui des clics
    const ordered = PERMISSIONS.filter((p) => actions.includes(p))
    onCreate({ code, actions: ordered, full })
  }

  return (
    <Modal
      onClose={onClose}
      icon={ShieldCheck}
      title="Ajouter un rôle"
      subtitle="Choisissez les actions que ce rôle pourra effectuer dans l'application."
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Nom du rôle"
          placeholder="LABORATOIRE"
          value={code}
          onChange={(e) => setCode(normalize(e.target.value))}
          error={errors.code}
          autoFocus
        />

        <div className={styles.group}>
          <span className={styles.groupLabel}>Actions autorisées</span>
          <div className={`${styles.checks} ${errors.actions ? styles.checksInvalid : ''}`}>
            {PERMISSIONS.map((p) => (
              <label key={p} className={styles.check}>
                <input
                  type="checkbox"
                  checked={actions.includes(p)}
                  onChange={() => toggle(p)}
                />
                {p}
              </label>
            ))}
          </div>
          {errors.actions && <span className={styles.error}>{errors.actions}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="access">Niveau d'accès</label>
          <select
            id="access"
            className="field__input"
            value={full ? 'full' : 'limited'}
            onChange={(e) => setFull(e.target.value === 'full')}
          >
            <option value="limited">Accès limité</option>
            <option value="full">Accès complet</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={styles.confirm}>
            Créer le rôle
          </button>
        </div>
      </form>
    </Modal>
  )
}