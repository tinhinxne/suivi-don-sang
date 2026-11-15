import styles from './ModalFooter.module.css'

export default function ModalFooter({
  onCancel,
  onConfirm,
  cancelLabel = 'Annuler',
  confirmLabel = 'Enregistrer',
  confirmDisabled = false,
}) {
  return (
    <div className={styles.footer}>
      <button type="button" className={styles.cancel} onClick={onCancel}>
        {cancelLabel}
      </button>
      <button
        type="button"
        className={styles.confirm}
        onClick={onConfirm}
        disabled={confirmDisabled}
      >
        {confirmLabel}
      </button>
    </div>
  )
}