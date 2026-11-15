import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, Droplet, Check, X, FlaskConical, Package, Truck } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import BloodTag from '../../components/ui/BloodTag'
import StatusBadge from '../../components/ui/StatusBadge'
import { donations } from './mockData'
import styles from './AgentDonationDetail.module.css'

// États à partir desquels chaque étape est terminée
const DONE_AFTER = {
  analysis: ['accepted', 'rejected', 'available', 'reserved', 'distributed'],
  stock: ['available', 'reserved', 'distributed'],
  distribution: ['distributed'],
}

function buildSteps(d) {
  return [
    {
      key: 'collect',
      title: 'Collecte',
      icon: Check,
      done: true,
      meta: [`${d.date} · ${d.time}`, d.collector],
    },
    {
      key: 'analysis',
      title: "Résultat d'analyse",
      icon: FlaskConical,
      done: DONE_AFTER.analysis.includes(d.status),
      rejected: d.status === 'rejected',
    },
    {
      key: 'stock',
      title: 'Entrée en stock',
      icon: Package,
      done: DONE_AFTER.stock.includes(d.status),
    },
    {
      key: 'distribution',
      title: 'Distribution',
      icon: Truck,
      done: DONE_AFTER.distribution.includes(d.status),
    },
  ]
}

export default function AgentDonationDetail() {
  const { id } = useParams()
  const { state } = useLocation()

  // La poche vient de la navigation (liste), sinon on la cherche dans les données
  const donation = state?.donation ?? donations.find((d) => d.id === id)

  return (
    <>
      <PageHeader title="Détails de la poche" subtitle="Parcours et état actuel" />

      <div className={styles.content}>
        <Link to="/agent/dons" className={styles.back}>
          <ArrowLeft size={13} />
          Retour aux dons
        </Link>

        {!donation ? (
          <div className={styles.notFound}>Poche introuvable : {id}</div>
        ) : (
          <>
            {/* Identité de la poche */}
            <section className={styles.summary}>
              <div className={styles.iconBox}>
                <Droplet size={20} strokeWidth={1.6} />
              </div>

              <div className={styles.identity}>
                <div className={styles.eyebrow}>Identifiant de la poche</div>
                <h2 className={styles.bagId}>{donation.id}</h2>
                <p className={styles.bagMeta}>
                  {donation.date} <span className={styles.dot}>•</span> {donation.place}
                </p>
              </div>

              <div className={styles.facts}>
                <div className={styles.fact}>
                  <div className={styles.eyebrow}>Groupe</div>
                  <BloodTag group={donation.group} />
                </div>
                <div className={styles.fact}>
                  <div className={styles.eyebrow}>Donneur</div>
                  <div className={styles.factValue}>{donation.donorCode}</div>
                </div>
                <div className={styles.fact}>
                  <div className={styles.eyebrow}>État</div>
                  <StatusBadge status={donation.status} />
                </div>
              </div>
            </section>

            {/* Parcours */}
            <section className={styles.journey}>
              <div className={styles.journeyHead}>
                <h3 className={styles.journeyTitle}>Parcours de la poche</h3>
                <p className={styles.journeySub}>Quatre étapes de traçabilité</p>
              </div>

              <ol className={styles.timeline}>
                {buildSteps(donation).map((s) => {
                  const Icon = s.rejected ? X : s.icon
                  const circle = s.done
                    ? s.rejected
                      ? styles.circleRejected
                      : styles.circleDone
                    : ''
                  return (
                    <li key={s.key} className={styles.step}>
                      <span className={`${styles.circle} ${circle}`}>
                        <Icon size={13} strokeWidth={1.8} />
                      </span>

                      <div>
                        <div className={styles.stepTitle}>
                          {s.title}
                          {s.done && (
                            <span
                              className={`${styles.tag} ${
                                s.rejected ? styles.tagRejected : styles.tagDone
                              }`}
                            >
                              {s.rejected ? 'Rejeté' : 'Terminé'}
                            </span>
                          )}
                        </div>

                        {s.done ? (
                          s.meta?.map((line) => (
                            <div key={line} className={styles.stepMeta}>
                              {line}
                            </div>
                          ))
                        ) : (
                          <>
                            <div className={styles.stepWait}>En attente</div>
                            <div className={styles.stepMeta}>Étape non réalisée</div>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          </>
        )}
      </div>
    </>
  )
}