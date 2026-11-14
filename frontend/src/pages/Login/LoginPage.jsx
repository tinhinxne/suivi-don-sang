import BrandPanel from './BrandPanel'
import LoginForm from './LoginForm'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <BrandPanel />
      <section className={styles.formSide}>
        <LoginForm />
      </section>
    </main>
  )
}