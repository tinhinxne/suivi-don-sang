import { useState } from 'react'
import { Search, Check, Copy, Link2, ShieldCheck, ShieldAlert, X } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import { traceRecords } from './mockData'
import styles from './AgentTraceability.module.css'

const STATUS_LABEL = {
  available: 'Disponible',
  reserved: 'Réservée',
  distributed: 'Distribuée',
}

// 0x71b4e9...8f2c
const shortHash = (hash) => `${hash.slice(0, 8)}...${hash.slice(-4)}`

// Index de l'étape modifiée dans l'exemple « Voir un exemple modifié »
const TAMPERED_INDEX = 2

export default function AgentTraceability() {
  const [query, setQuery] = useState('POCHE-2026-0005')
  const [record, setRecord] = useState(traceRecords['POCHE-2026-0005'])
  const [notFound, setNotFound] = useState(false)
  const [tampered, setTampered] = useState(false)
  const [integrity, setIntegrity] = useState(null) // null | 'ok' | 'broken'
  const [copied, setCopied] = useState(null)

  const handleSearch = (e) => {
    e.preventDefault()
    // À remplacer par l'appel API
    const found = traceRecords[query.trim().toUpperCase()]
    setRecord(found ?? null)
    setNotFound(!found)
    setTampered(false)
    setIntegrity(null)
  }

  const handleVerify = () => {
    // À remplacer par la vraie comparaison des empreintes (API / blockchain)
    setIntegrity(tampered ? 'broken' : 'ok')
  }

  const handleExample = () => {
    setTampered(true)
    setIntegrity(null)
  }

  const handleCopy = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(hash)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // Presse-papiers indisponible : on ignore
    }
  }

  const brokenIndex = integrity === 'broken' ? TAMPERED_INDEX : -1

  return (
    <>
      <PageHeader
        title="Traçabilité blockchain"
        subtitle="Historique vérifiable d'une poche"
      />

      <div className={styles.content}>
        {/* Recherche */}
        <section className={styles.searchCard}>
          <div>
            <div className={styles.eyebrow}>Registre blockchain</div>
            <h2 className={styles.searchTitle}>Rechercher une poche</h2>
            <p className={styles.searchSub}>Historique vérifiable des opérations.</p>
          </div>

          <form className={styles.search} onSubmit={handleSearch}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="POCHE-2026-0000"
              aria-label="Référence de la poche"
            />
            <Button type="submit" className={styles.searchBtn}>
              Rechercher
            </Button>
          </form>
        </section>

        {notFound && (
          <div className={styles.notFound}>
            Aucune poche trouvée pour « {query.trim()} ».
          </div>
        )}

        {record && (
          <div className={styles.grid}>
            {/* Historique */}
            <section className={styles.card}>
              <div className={styles.recordHead}>
                <div>
                  <h2 className={styles.recordId}>{record.id}</h2>
                  <p className={styles.recordSub}>
                    Groupe {record.group} · {STATUS_LABEL[record.status]}
                  </p>
                </div>
                <Link2 size={16} className={styles.recordIcon} />
              </div>

              <ol className={styles.timeline}>
                {record.events.map((ev, i) => {
                  const broken = i === brokenIndex
                  return (
                    <li key={ev.hash} className={styles.step}>
                      <span className={`${styles.dot} ${broken ? styles.dotBroken : ''}`}>
                        {broken ? (
                          <X size={13} strokeWidth={2.4} />
                        ) : (
                          <Check size={13} strokeWidth={2.4} />
                        )}
                      </span>
                      <div className={styles.stepBody}>
                        <div className={styles.stepTitle}>{ev.type}</div>
                        <div className={styles.stepMeta}>
                          {ev.actor} · {ev.date}
                        </div>
                        <div className={styles.hashRow}>
                          <code className={styles.hash}>{shortHash(ev.hash)}</code>
                          <button
                            type="button"
                            className={styles.copy}
                            onClick={() => handleCopy(ev.hash)}
                            aria-label="Copier l'empreinte"
                          >
                            {copied === ev.hash ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>

            {/* Intégrité */}
            <aside className={`${styles.card} ${styles.integrity}`}>
              <div
                className={`${styles.shield} ${
                  integrity === 'broken' ? styles.shieldBroken : ''
                }`}
              >
                {integrity === 'broken' ? (
                  <ShieldAlert size={22} strokeWidth={1.6} />
                ) : (
                  <ShieldCheck size={22} strokeWidth={1.6} />
                )}
              </div>

              <h3 className={styles.integrityTitle}>Intégrité du registre</h3>
              <p className={styles.integritySub}>
                Comparez les empreintes pour détecter toute modification.
              </p>

              <button type="button" className={styles.verify} onClick={handleVerify}>
                Vérifier l'intégrité
              </button>

              {integrity === 'ok' && (
                <p className={`${styles.result} ${styles.resultOk}`}>
                  Toutes les empreintes concordent.
                </p>
              )}
              {integrity === 'broken' && (
                <p className={`${styles.result} ${styles.resultBroken}`}>
                  Modification détectée à l'étape « {record.events[TAMPERED_INDEX].type} ».
                </p>
              )}

              <button type="button" className={styles.example} onClick={handleExample}>
                Voir un exemple modifié
              </button>

              <div className={styles.note}>
                <ShieldCheck size={12} className={styles.noteIcon} />
                <p>
                  Les informations personnelles et les résultats médicaux détaillés
                  restent dans la base de données et ne sont pas enregistrés sur la
                  blockchain.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}