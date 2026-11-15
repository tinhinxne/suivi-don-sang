import { useState } from 'react'
import { FlaskConical, Check, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import styles from './AnalysisModal.module.css'

export default function AnalysisModal({ poche, onClose, onSave }) {
  const [result, setResult] = useState(null) // 'accepted' | 'rejected'
  const [note, setNote] = useState('')

  const handleSave = () => {
    if (!result) return
    onSave({ id: poche.id, result, note: note.trim() })
  }

  return (
    <Modal
      onClose={onClose}
      icon={FlaskConical}
      title="Résultat d'analyse"
      subtitle={poche.id}
    >
      <div className={styles.choices}>
        <button
          type="button"
          className={`${styles.choice} ${styles.accepted} ${
            result === 'accepted' ? styles.selected : ''
          }`}
          onClick={() => setResult('accepted')}
        >
          <Check size={14} strokeWidth={2} />
          Accepté
        </button>

        <button
          type="button"
          className={`${styles.choice} ${styles.rejected} ${
            result === 'rejected' ? styles.selected : ''
          }`}
          onClick={() => setResult('rejected')}
        >
          <X size={14} strokeWidth={2} />
          Rejeté
        </button>
      </div>

      <label className={styles.label} htmlFor="analysis-note">
        Remarque facultative
      </label>
      <textarea
        id="analysis-note"
        className={styles.textarea}
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className={styles.footer}>
        <button type="button" className={styles.cancel} onClick={onClose}>
          Annuler
        </button>
        <button
          type="button"
          className={styles.save}
          onClick={handleSave}
          disabled={!result}
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  )
}