
import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import BloodTag from '../../components/ui/BloodTag'
import AnalysisModal from './AnalysisModal'
import styles from './AgentAnalyses.module.css'
import { analysisPoches } from './mockData'
// Données de démonstration, à remplacer par l'API


export default function AgentAnalyses() {
const [poches, setPoches] = useState(analysisPoches)
  const [selected, setSelected] = useState(null)

  const handleSave = ({ id, result, note }) => {
    // À remplacer par l'appel API : { id, result, note }
    console.log('Analyse enregistrée', { id, result, note })

    // La poche analysée sort de la liste « à analyser »
    setPoches((prev) => prev.filter((p) => p.id !== id))
    setSelected(null)
  }

  return (
    <>
      <PageHeader
        title="Analyses"
        subtitle="Saisissez les résultats des poches"
      />

      <div className={styles.content}>
        <div className={styles.notice}>
          <ShieldCheck size={15} strokeWidth={1.8} className={styles.noticeIcon} />
          <div>
            <div className={styles.noticeTitle}>Règle de sécurité</div>
            <div className={styles.noticeText}>
              Une poche rejetée ne peut pas être ajoutée au stock ni distribuée.
            </div>
          </div>
        </div>

        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <span>Poche</span>
            <span>Groupe</span>
            <span>Date</span>
            <span>Lieu</span>
            <span>Action</span>
          </div>

          {poches.map((p) => (
            <div key={p.id} className={styles.row}>
              <span className={styles.id}>{p.id}</span>
              <span>
                <BloodTag group={p.group} />
              </span>
              <span className={styles.cell}>{p.date}</span>
              <span className={styles.cell}>{p.place}</span>
              <span>
                <button className={styles.action} onClick={() => setSelected(p)}>
                  Saisir le résultat
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <AnalysisModal
          poche={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}