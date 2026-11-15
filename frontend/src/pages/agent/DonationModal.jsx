import { useState } from 'react'
import { Droplet, ChevronDown } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ModalFooter from '../../components/ui/ModalFooter'
import { donors, bloodGroups, places } from './mockData'
import styles from './DonationModal.module.css'

export default function DonationModal({ onClose, onSave }) {
  const [donorId, setDonorId] = useState(donors[0].id)
  const [group, setGroup] = useState('A+')
  const [date, setDate] = useState('')
  const [place, setPlace] = useState(places[0])

  const handleSave = () => {
    const donor = donors.find((d) => d.id === donorId)
    onSave({ donorCode: donor.id, donor: donor.name, group, date, place })
  }

  return (
    <Modal onClose={onClose} icon={Droplet} title="Enregistrer un don">
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="don-donor">
            Donneur
          </label>
          <div className={styles.selectWrap}>
            <select
              id="don-donor"
              className={styles.input}
              value={donorId}
              onChange={(e) => setDonorId(e.target.value)}
            >
              {donors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} · {d.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.chevron} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="don-group">
            Groupe sanguin
          </label>
          <div className={styles.selectWrap}>
            <select
              id="don-group"
              className={styles.input}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {bloodGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.chevron} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="don-date">
            Date
          </label>
          <input
            id="don-date"
            type="date"
            className={styles.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="don-place">
            Lieu de prélèvement
          </label>
          <div className={styles.selectWrap}>
            <select
              id="don-place"
              className={styles.input}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            >
              {places.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.chevron} />
          </div>
        </div>
      </div>

      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSave}
        confirmDisabled={!date}
      />
    </Modal>
  )
}