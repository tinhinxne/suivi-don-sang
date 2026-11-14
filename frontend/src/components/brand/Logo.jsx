import goutte from '../../assets/icons/goutte.svg'

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <img src={goutte} alt="" width={44} height={44} />
      <div>
        <div style={{
          fontFamily: 'var(--font-title)',
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '0.12em',
          color: 'var(--on-dark)',
          lineHeight: 1,
        }}>
          QATRA
        </div>
        <div style={{
          marginTop: 4,
          fontSize: 8,
          letterSpacing: '0.04em',
          color: 'var(--on-dark-muted)',
        }}>
          Traçabilité du don
        </div>
      </div>
    </div>
  )
}