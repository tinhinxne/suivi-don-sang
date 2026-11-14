import './ui.css'

export default function Checkbox({ label, ...props }) {
  return (
    <label className="checkbox">
      <input type="checkbox" className="checkbox__input" {...props} />
      <span className="checkbox__box" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="3.5"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      {label}
    </label>
  )
}