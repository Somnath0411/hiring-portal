import './ScoreBar.css'

// A labelled horizontal bar for a 0-100 score.
// `detail` replaces the default "80%" text, `animate` plays the fill-in once, `delay` staggers it.
export default function ScoreBar({ label, value, detail, animate = false, delay = 0 }) {
  const percent = Math.max(0, Math.min(100, value))

  return (
    <div className="score-bar">
      <div className="score-bar__top">
        <span className="score-bar__label">{label}</span>
        <span className="score-bar__value">{detail ?? `${percent}%`}</span>
      </div>
      <div className="score-bar__track" role="img" aria-label={`${label}: ${percent} percent`}>
        <div
          className={`score-bar__fill${animate ? ' is-animated' : ''}`}
          style={{ '--value': `${percent}%`, '--delay': `${delay}ms` }}
        />
      </div>
    </div>
  )
}
