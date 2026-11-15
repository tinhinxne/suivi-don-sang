import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Droplet, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { UserContext } from '../../components/layout/UserContext'
import BloodTag from '../../components/ui/BloodTag'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import DonationModal from './DonationModal'
import { formatDate } from './formatDate'
import { donations as mockDonations } from './mockData'
import styles from './AgentDonations.module.css'

export default function AgentDonations() {
  const user = useContext(UserContext)
  const navigate = useNavigate()
  const [donations, setDonations] = useState(mockDonations)
  const [showModal, setShowModal] = useState(false)

  const handleSave = ({ donorCode, donor, group, date, place }) => {
    // À remplacer par l'appel API : l'identifiant sera fourni par le backend
    const last = Math.max(...donations.map((d) => Number(d.id.slice(-4))))
    const donation = {
      id: `POCHE-${date.slice(0, 4)}-${String(last + 1).padStart(4, '0')}`,
      donorCode,
      donor,
      date: formatDate(date),
      time: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      place,
      group,
      status: 'pending',
      collector: user.name,
    }

    setDonations((prev) => [donation, ...prev])
    setShowModal(false)
  }

  return (
    <>
      <PageHeader
        title="Dons"
        subtitle="Enregistrez et consultez les dons"
      />

      <div className={styles.content}>
        <div className={styles.head}>
          <div>
            <h2 className={styles.title}>Registre des dons</h2>
            <p className={styles.sub}>
              Identifiants et état courant des poches.
            </p>
          </div>
          <Button
            icon={Plus}
            className={styles.addBtn}
            onClick={() => setShowModal(true)}
          >
            Enregistrer un don
          </Button>
        </div>

        <div className={styles.table}>
          <div className={`${styles.row} ${styles.thead}`}>
            <span>Identifiant</span>
            <span>Donneur</span>
            <span>Date</span>
            <span>Lieu</span>
            <span>Groupe</span>
            <span>État</span>
            <span />
          </div>

          {donations.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`${styles.row} ${styles.item}`}
              onClick={() => navigate(`/agent/dons/${d.id}`, { state: { donation: d } })}
            >
              <span className={styles.idCell}>
                <Droplet size={12} className={styles.drop} />
                {d.id}
              </span>
              <span className={styles.cell}>{d.donor}</span>
              <span className={styles.cell}>{d.date}</span>
              <span className={styles.cell}>{d.place}</span>
              <span>
                <BloodTag group={d.group} />
              </span>
              <span>
                <StatusBadge status={d.status} />
              </span>
              <ChevronRight size={14} className={styles.chevron} />
            </button>
          ))}
        </div>
      </div>

      {showModal && (
        <DonationModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  )
}