import styles from './StatusBadge.module.css'

const STATUS = {
  pending: { label: "En attente d'analyse", className: styles.pending },
  accepted: { label: 'Acceptée', className: styles.accepted },
  rejected: { label: 'Rejetée', className: styles.rejected },
  available: { label: 'Disponible', className: styles.available },
  reserved: { label: 'Réservée', className: styles.reserved },
  distributed: { label: 'Distribuée', className: styles.distributed },
}

export default function StatusBadge({ status }) {
  const { label, className } = STATUS[status]
  return <span className={`${styles.badge} ${className}`}>{label}</span>
}