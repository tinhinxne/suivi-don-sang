import { useEffect } from 'react'
import { X } from 'lucide-react'
import styles from './Modal.module.css'

export default function Modal({ onClose, icon: Icon, title, subtitle, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className={styles.close} onClick={onClose} aria-label="Fermer">
          <X size={16} />
        </button>

        {Icon && (
          <div className={styles.iconBox}><Icon size={18} strokeWidth={1.8} /></div>
        )}
        <h2 id="modal-title" className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.sub}>{subtitle}</p>}

        {children}
      </div>
    </div>
  )
}