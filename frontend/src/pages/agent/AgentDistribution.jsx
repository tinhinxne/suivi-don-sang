import { useState } from 'react'
import { Truck, ChevronDown } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import BloodTag from '../../components/ui/BloodTag'
import Button from '../../components/ui/Button'
import { distributionRequests, distributionBags } from './mockData'
import styles from './AgentDistribution.module.css'

export default function AgentDistribution() {
  const [requests, setRequests] = useState(distributionRequests)
  const [bags, setBags] = useState(distributionBags)
  const [requestId, setRequestId] = useState(distributionRequests[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [selected, setSelected] = useState([])

  const request = requests.find((r) => r.id === requestId)
  const compatible = request ? bags.filter((b) => b.group === request.group) : []
  const limit = request?.quantity ?? 0
  const canConfirm = Boolean(request && date && selected.length > 0)

  const handleRequestChange = (e) => {
    setRequestId(e.target.value)
    setSelected([])
  }

  // On ne peut pas sélectionner plus de poches que la quantité demandée
  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      return prev.length < limit ? [...prev, id] : prev
    })
  }

  const handleConfirm = () => {
    // À remplacer par l'appel API
    console.log('Distribution confirmée', { requestId, date, bagIds: selected })

    setBags((prev) => prev.filter((b) => !selected.includes(b.id)))

    // La demande disparaît de la liste seulement si elle est entièrement satisfaite
    const remaining = requests.filter(
      (r) => !(r.id === requestId && selected.length >= r.quantity)
    )
    setRequests(remaining)
    if (!remaining.some((r) => r.id === requestId)) {
      setRequestId(remaining[0]?.id ?? '')
    }

    setSelected([])
    setDate('')
  }

  return (
    <>
      <PageHeader
        title="Distribution"
        subtitle="Affectez les poches aux demandes acceptées"
      />

      <div className={styles.content}>
        {/* Formulaire */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Préparer la distribution</h2>
            <p className={styles.cardSub}>Sélectionnez une demande acceptée.</p>
          </div>

          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="dist-request">
                Demande
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="dist-request"
                  className={styles.input}
                  value={requestId}
                  onChange={handleRequestChange}
                  disabled={requests.length === 0}
                >
                  {requests.length === 0 && (
                    <option value="">Aucune demande acceptée</option>
                  )}
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} · {r.hospital} · {r.group}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className={styles.chevron} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="dist-hospital">
                Hôpital
              </label>
              <input
                id="dist-hospital"
                className={styles.input}
                value={request?.hospital ?? ''}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="dist-date">
                Date
              </label>
              <input
                id="dist-date"
                type="date"
                className={styles.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Poches compatibles */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Poches spécifiques</h2>
            <p className={styles.cardSub}>{compatible.length} compatible(s)</p>
          </div>

          <div className={styles.bags}>
            {compatible.length === 0 ? (
              <p className={styles.empty}>Aucune poche compatible en stock.</p>
            ) : (
              <ul className={styles.list}>
                {compatible.map((b) => {
                  const checked = selected.includes(b.id)
                  const blocked = !checked && selected.length >= limit
                  return (
                    <li key={b.id}>
                      <label
                        className={`${styles.bag} ${blocked ? styles.blocked : ''}`}
                      >
                        <input
                          type="checkbox"
                          className={styles.check}
                          checked={checked}
                          disabled={blocked}
                          onChange={() => toggle(b.id)}
                        />
                        <span className={styles.bagId}>{b.id}</span>
                        <BloodTag group={b.group} />
                        <span className={styles.bagDate}>{b.date}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className={styles.footer}>
            <span className={styles.counter}>
              {selected.length}/{limit} sélectionnée(s)
            </span>
            <Button
              icon={Truck}
              className={styles.confirm}
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              Confirmer la distribution
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}