import styles from './BloodTag.module.css'

export default function BloodTag({ group }) {
  return <span className={styles.tag}>{group}</span>
}