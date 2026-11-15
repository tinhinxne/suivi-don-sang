import { useId } from 'react'
import './ui.css'

export default function Select({ label, options, error, ...props }) {
  const id = useId()
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="field__input"
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}