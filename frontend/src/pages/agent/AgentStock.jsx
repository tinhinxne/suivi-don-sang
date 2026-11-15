import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import BloodTag from '../../components/ui/BloodTag'
import styles from './AgentStock.module.css'
import { stockCounts, stockPoches, stockPending } from './mockData'
// En dessous de ce nombre, la carte passe en bordeaux (stock bas)
const LOW_STOCK = 5

const STATUS = {
  available: { label: 'Disponible', className: styles.available },
  reserved: { label: 'Réservée', className: styles.reserved },
  distributed: { label: 'Distribuée', className: styles.distributed },
}



export default function AgentStock() {
  const [counts, setCounts] = useState(stockCounts)
  const [poches, setPoches] = useState(stockPoches)
  const [pending, setPending] = useState(stockPending)
  const [filter, setFilter] = useState('all')

  const handleAddToStock = () => {
    // À remplacer par l'appel API
    setPoches((prev) => [...pending, ...prev])
    setCounts((prev) => {
      const next = { ...prev }
      pending.forEach((p) => {
        next[p.group] += 1
      })
      return next
    })
    setPending([])
  }

  const visible =
    filter === 'all' ? poches : poches.filter((p) => p.status === filter)

  return (
    <>
      <PageHeader
        title="Stock"
        subtitle="Poches disponibles par groupe sanguin"
      />

      <div className={styles.content}>
        <div className={styles.cards}>
          {Object.entries(counts).map(([group, count]) => (
            <div
              key={group}
              className={`${styles.card} ${
                count < LOW_STOCK ? styles.low : styles.ok
              }`}
            >
              <BloodTag group={group} />
              <div>
                <div className={styles.count}>{count}</div>
                <div className={styles.countLabel}>poches disponibles</div>
              </div>
            </div>
          ))}
        </div>

        {pending.length > 0 && (
          <div className={styles.banner}>
            <Check size={15} strokeWidth={2} className={styles.bannerIcon} />
            <div className={styles.bannerText}>
              <div className={styles.bannerTitle}>
                {pending.length} poche(s) acceptée(s) à ajouter au stock
              </div>
              <div className={styles.bannerSub}>Analyse terminée.</div>
            </div>
            <button className={styles.bannerBtn} onClick={handleAddToStock}>
              Ajouter au stock
            </button>
          </div>
        )}

        <section className={styles.table}>
          <div className={styles.tableHead}>
            <h2 className={styles.tableTitle}>Poches en stock</h2>

            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filtrer par état"
              >
                <option value="all">Tous</option>
                <option value="available">Disponible</option>
                <option value="reserved">Réservée</option>
                <option value="distributed">Distribuée</option>
              </select>
              <ChevronDown size={14} className={styles.chevron} />
            </div>
          </div>

          <div className={`${styles.row} ${styles.head}`}>
            <span>Poche</span>
            <span>Groupe</span>
            <span>Date</span>
            <span>État</span>
          </div>

          {visible.length === 0 && (
            <div className={styles.empty}>Aucune poche pour ce filtre.</div>
          )}

          {visible.map((p) => (
            <div key={p.id} className={styles.row}>
              <span className={styles.id}>{p.id}</span>
              <span>
                <BloodTag group={p.group} />
              </span>
              <span className={styles.cell}>{p.date}</span>
              <span>
                <span className={`${styles.pill} ${STATUS[p.status].className}`}>
                  {STATUS[p.status].label}
                </span>
              </span>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}