import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import layout from '../../components/layout/Layout.module.css'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import panel from '../../components/ui/DataPanel.module.css'
import styles from './Medecin.module.css'
import { useRequests } from './useRequests'
import { BLOOD_GROUPS, URGENCIES } from './data'
import { api } from '../../services/api'

export default function NewRequestPage() {
  const navigate = useNavigate()
  const { addRequest } = useRequests()

  const [hospitals, setHospitals] = useState([])
  const [form, setForm] = useState({
    hospital: '',
    group: BLOOD_GROUPS[0],
    quantity: '1',
    urgency: URGENCIES[0],
  })
  const [error, setError] = useState('')

  useEffect(() => {
    api('/hopitaux')
      .then((rows) => {
        setHospitals(rows)
        setForm((f) => ({ ...f, hospital: rows[0]?.nom || '' }))
      })
      .catch(() => {})
  }, [])

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const quantity = Number(form.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Saisissez un nombre entier supérieur ou égal à 1.')
      return
    }
    const hospital = hospitals.find((h) => h.nom === form.hospital)
    if (!hospital) {
      alert('Choisissez un hôpital.')
      return
    }
    try {
      await addRequest({
        hopitalId: hospital.id,
        group: form.group,
        quantity,
        urgency: form.urgency,
      })
      navigate('/medecin/mes-demandes')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <PageHeader title="Nouvelle demande" subtitle="Soumettez un besoin au centre" />

      <div className={layout.content}>
        <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
          <div className={styles.formHead}>
            <span className={styles.step}>1</span>
            <div>
              <h2 className={styles.formTitle}>Nouvelle demande de sang</h2>
              <p className={styles.formSub}>Transmise au centre de transfusion.</p>
            </div>
          </div>

          <div className={styles.formBody}>
            <Select
              label="Hôpital"
              options={hospitals.map((h) => h.nom)}
              value={form.hospital}
              onChange={set('hospital')}
            />

            <div className={styles.row2}>
              <Select
                label="Groupe sanguin"
                options={BLOOD_GROUPS}
                value={form.group}
                onChange={set('group')}
              />
              <Input
                label="Quantité souhaitée"
                type="number"
                min="1"
                value={form.quantity}
                onChange={set('quantity')}
                error={error}
              />
            </div>

            <Select
              label="Niveau d'urgence"
              options={URGENCIES}
              value={form.urgency}
              onChange={set('urgency')}
            />
          </div>

          <div className={styles.formFooter}>
            <button type="submit" className={panel.add}>
              <Check size={15} strokeWidth={2.2} />
              Soumettre la demande
            </button>
          </div>
        </form>
      </div>
    </>
  )
}