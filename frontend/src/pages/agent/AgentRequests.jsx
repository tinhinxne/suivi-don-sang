// import { ChevronRight } from 'lucide-react'
// import PageHeader from '../../components/layout/PageHeader'
// import BloodTag from '../../components/ui/BloodTag'
// import { receivedRequests } from './mockData'
// import styles from './AgentRequests.module.css'

// const URGENCY = {
//   critical: { label: 'Critique', className: styles.critical },
//   urgent: { label: 'Urgente', className: styles.urgent },
//   normal: { label: 'Normale', className: styles.normal },
// }

// const STATUS = {
//   pending: { label: 'En attente', className: styles.pending },
//   partial: { label: 'Partiellement satisfaite', className: styles.pending },
//   accepted: { label: 'Acceptée', className: styles.accepted },
//   rejected: { label: 'Refusée', className: styles.rejected },
//   distributed: { label: 'Distribuée', className: styles.distributed },
// }

// export default function AgentRequests() {
//   const handleOpen = (request) => {
//     // Le détail de la demande sera branché plus tard
//     console.log('Ouvrir la demande', request.id)
//   }

//   return (
//     <>
//       <PageHeader
//         title="Demandes reçues"
//         subtitle="Traitez les demandes hospitalières"
//       />

//       <div className={styles.content}>
//         <div className={styles.table}>
//           <div className={`${styles.row} ${styles.head}`}>
//             <span>Référence</span>
//             <span>Hôpital</span>
//             <span>Médecin</span>
//             <span>Groupe</span>
//             <span>Quantité</span>
//             <span>Urgence</span>
//             <span>Date</span>
//             <span>Statut</span>
//             <span />
//           </div>

//           {receivedRequests.map((r) => (
//             <button
//               key={r.id}
//               type="button"
//               className={`${styles.row} ${styles.item}`}
//               onClick={() => handleOpen(r)}
//             >
//               <span className={styles.id}>{r.id}</span>
//               <span className={styles.cell}>{r.hospital}</span>
//               <span className={styles.cell}>{r.doctor}</span>
//               <span>
//                 <BloodTag group={r.group} />
//               </span>
//               <span className={styles.cell}>{r.quantity}</span>
//               <span>
//                 <span className={`${styles.pill} ${URGENCY[r.urgency].className}`}>
//                   {URGENCY[r.urgency].label}
//                 </span>
//               </span>
//               <span className={styles.cell}>{r.date}</span>
//               <span>
//                 <span className={`${styles.pill} ${STATUS[r.status].className}`}>
//                   {STATUS[r.status].label}
//                 </span>
//               </span>
//               <ChevronRight size={14} className={styles.chevron} />
//             </button>
//           ))}
//         </div>
//       </div>
//     </>
//   )
// }

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import BloodTag from '../../components/ui/BloodTag'
import RequestModal from './RequestModal'
import { receivedRequests } from './mockData'
import styles from './AgentRequests.module.css'

const URGENCY = {
  critical: { label: 'Critique', className: styles.critical },
  urgent: { label: 'Urgente', className: styles.urgent },
  normal: { label: 'Normale', className: styles.normal },
}

const STATUS = {
  pending: { label: 'En attente', className: styles.pending },
  partial: { label: 'Partiellement satisfaite', className: styles.pending },
  accepted: { label: 'Acceptée', className: styles.accepted },
  rejected: { label: 'Refusée', className: styles.rejected },
  distributed: { label: 'Distribuée', className: styles.distributed },
}

export default function AgentRequests() {
  const [requests, setRequests] = useState(receivedRequests)
  const [selected, setSelected] = useState(null)

  const handleSave = ({ id, decision, note }) => {
    // À remplacer par l'appel API : { id, decision, note }
    console.log('Demande traitée', { id, decision, note })

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: decision } : r))
    )
    setSelected(null)
  }

  return (
    <>
      <PageHeader
        title="Demandes reçues"
        subtitle="Traitez les demandes hospitalières"
      />

      <div className={styles.content}>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <span>Référence</span>
            <span>Hôpital</span>
            <span>Médecin</span>
            <span>Groupe</span>
            <span>Quantité</span>
            <span>Urgence</span>
            <span>Date</span>
            <span>Statut</span>
            <span />
          </div>

          {requests.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`${styles.row} ${styles.item}`}
              onClick={() => setSelected(r)}
            >
              <span className={styles.id}>{r.id}</span>
              <span className={styles.cell}>{r.hospital}</span>
              <span className={styles.cell}>{r.doctor}</span>
              <span>
                <BloodTag group={r.group} />
              </span>
              <span className={styles.cell}>{r.quantity}</span>
              <span>
                <span className={`${styles.pill} ${URGENCY[r.urgency].className}`}>
                  {URGENCY[r.urgency].label}
                </span>
              </span>
              <span className={styles.cell}>{r.date}</span>
              <span>
                <span className={`${styles.pill} ${STATUS[r.status].className}`}>
                  {STATUS[r.status].label}
                </span>
              </span>
              <ChevronRight size={14} className={styles.chevron} />
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <RequestModal
          request={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}