import Logo from '../../components/brand/Logo'
import styles from './LoginPage.module.css'

export default function BrandPanel() {
  return (
    <aside className={styles.brand}>
      <Logo />

      <div>
        <p className={styles.arabic} dir="rtl" lang="ar">
          قطرة أمل، حياة كاملة
        </p>
        <h1 className={styles.title}>Chaque goutte raconte une histoire.</h1>
        <p className={styles.lead}>
          Une traçabilité transparente et sécurisée, au service de ceux qui
          donnent et de ceux qui reçoivent.
        </p>
      </div>

      <div className={styles.note}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
          <path d="M8.5 12l2.5 2.5L15.5 10" />
        </svg>
      </div>
    </aside>
  )
}