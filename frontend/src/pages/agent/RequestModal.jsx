import { useState } from 'react'
import { Calendar, Check, X, TriangleAlert } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ModalFooter from '../../components/ui/ModalFooter'
import BloodTag from '../../components/ui/BloodTag'
import { stockCounts } from './mockData'
import styles from './RequestModal.module.css'

const URGENCY_LABEL = {
  critical: 'Critique',
  urgent: 'Urgente',
  normal: 'Normale',
}

export default function RequestModal({ request, onClose, onSave }) {
  const [decision, setDecision] = useState(null) // 'accepted' | 'rejected'
  const [note, setNote] = useState('')

  const readOnly = request.status !== 'pending'
  const available = stockCounts[request.group] ?? 0
  const insufficient = available < request.quantity

  const needsReason = decision === 'rejected' && !note.trim()
  const canSave = Boolean(decision) && !needsReason

  const handleSave = () => {
    if (!canSave) return
    onSave({ id: request.id, decision, note: note.trim() })
  }

  return (
    <Modal
      onClose={onClose}
      icon={Calendar}
      title="Détail de la demande"
      subtitle={request.id}
    >
      <dl className={styles.details}>
        <div>
          <dt>Hôpital</dt>
          <dd>{request.hospital}</dd>
        </div>
        <div>
          <dt>Médecin</dt>
          <dd>{request.doctor}</dd>
        </div>
        <div>
          <dt>Groupe</dt>
          <dd>
            <BloodTag group={request.group} />
          </dd>
        </div>
        <div>
          <dt>Quantité</dt>
          <dd>{request.quantity}</dd>
        </div>
        <div>
          <dt>Urgence</dt>
          <dd>{URGENCY_LABEL[request.urgency]}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{request.date}</dd>
        </div>
      </dl>

      <div className={`${styles.stock} ${insufficient ? styles.stockLow : styles.stockOk}`}>
        {insufficient && <TriangleAlert size={13} />}
        <span>
          {available} poche(s) {request.group} en stock
          {insufficient && ` : insuffisant pour ${request.quantity} demandée(s)`}
        </span>
      </div>

      {readOnly ? (
        <div className={styles.footer}>
          <button type="button" className={styles.close} onClick={onClose}>
            Fermer
          </button>
        </div>
      ) : (
        <>
          <div className={styles.choices}>
            <button
              type="button"
              className={`${styles.choice} ${styles.accept} ${
                decision === 'accepted' ? styles.selected : ''
              }`}
              onClick={() => setDecision('accepted')}
            >
              <Check size={14} strokeWidth={2} />
              Accepter
            </button>
            <button
              type="button"
              className={`${styles.choice} ${styles.reject} ${
                decision === 'rejected' ? styles.selected : ''
              }`}
              onClick={() => setDecision('rejected')}
            >
              <X size={14} strokeWidth={2} />
              Refuser
            </button>
          </div>

          {decision === 'rejected' && (
            <>
              <label className={styles.label} htmlFor="request-note">
                Motif du refus
              </label>
              <textarea
                id="request-note"
                className={styles.textarea}
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </>
          )}

          <ModalFooter
            onCancel={onClose}
            onConfirm={handleSave}
            confirmDisabled={!canSave}
          />
        </>
      )}
    </Modal>
  )
}