import { useId } from 'react'
import './ui.css'

export default function Input({ label, error, ...props }) {
  const id = useId()
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="field__input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <span id={`${id}-error`} className="field__error">{error}</span>}
    </div>
  )
}