import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import layout from '../../components/layout/Layout.module.css'
import styles from './Medecin.module.css'
import { BLOOD_GROUPS, LOW_STOCK } from './data'
import { api } from '../../services/api'

export default function StockPage() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    api('/poches/stock')
      .then((rows) => {
        const c = {}
        rows.forEach((r) => {
          c[r.groupe_sanguin] = Number(r.nb_poches)
        })
        setCounts(c)
      })
      .catch(() => {})
  }, [])

  const stock = BLOOD_GROUPS.map((g) => ({ group: g, count: counts[g] || 0 }))

  return (
    <>
      <PageHeader title="Poches disponibles" subtitle="Stock consultable par groupe sanguin" />

      <div className={layout.content}>
        <div className={styles.stockGrid}>
          {stock.map((s) => (
            <div
              key={s.group}
              className={`${styles.stockCard} ${s.count < LOW_STOCK ? styles.stockLow : ''}`}
            >
              <span className={styles.group}>{s.group}</span>
              <div>
                <div className={styles.stockCount}>{s.count}</div>
                <div className={styles.stockLabel}>poches disponibles</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.legend}>
          <span>Stock suffisant</span>
          <span className={styles.low}>Stock faible (moins de {LOW_STOCK} poches)</span>
        </div>
      </div>
    </>
  )
}