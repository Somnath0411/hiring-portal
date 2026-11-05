import { useState } from 'react'
import Modal from '../Modal/Modal'
import StatusBadge from '../StatusBadge/StatusBadge'
import ScoreBar from '../ScoreBar/ScoreBar'
import { formatDate, safeHref } from '../../utils/format'
import './CandidateOverlay.css'

function ContactLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Shows a link only when the saved text is a safe http(s) URL, otherwise shows it as plain text.
function ProfileLink({ value }) {
  if (!value) return <span className="muted">Not provided</span>
  const href = safeHref(value)
  return href ? <ContactLink href={href}>{value}</ContactLink> : <span>{value}</span>
}

// Full details for one candidate, with the buttons that decide their next step.
// `onStatusChange(id, status)` should return a promise and throw if saving fails.
export default function CandidateOverlay({ candidate, onClose, onStatusChange }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!candidate) return null

  const {
    id, rank, name, roleTitle, email, phone, linkedin, github, resumeFileName, appliedAt, status,
    total, maxTotal, quizScore, resumeScore, correctCount, totalQuestions, matchedSkills, missingSkills,
  } = candidate

  const change = async (nextStatus) => {
    setSaving(true)
    setError('')
    try {
      await onStatusChange(id, nextStatus)
    } catch (err) {
      setError(err.message || 'Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} labelledBy="candidate-overlay-title">
      <div className="candidate-overlay">
        <header className="candidate-overlay__head">
          <div className="row">
            <span className="candidate-overlay__rank">Rank #{rank}</span>
            <StatusBadge status={status} />
          </div>
          <h2 id="candidate-overlay-title" className="candidate-overlay__name">{name}</h2>
          <p className="muted">Applied for {roleTitle} on {formatDate(appliedAt)}</p>
        </header>

        <section className="candidate-overlay__scores" aria-label="Scores">
          <div className="candidate-overlay__total">
            <span className="candidate-overlay__total-value">{total}</span>
            <span className="muted text-sm">out of {maxTotal}</span>
          </div>
          <div className="stack" style={{ '--gap': 'var(--space-4)' }}>
            <ScoreBar
              label="Test"
              value={quizScore}
              detail={`${correctCount} of ${totalQuestions} correct (${quizScore}%)`}
            />
            <ScoreBar label="Resume" value={resumeScore} />
          </div>
        </section>

        <section className="candidate-overlay__section">
          <h3 className="candidate-overlay__heading">Skills found in the resume</h3>
          <div className="chips">
            {matchedSkills.map((skill) => (
              <span key={skill} className="chip chip--ok">{skill}</span>
            ))}
            {missingSkills.map((skill) => (
              <span key={skill} className="chip chip--missing">{skill} (not found)</span>
            ))}
            {!matchedSkills.length && !missingSkills.length && <span className="muted">No skills listed for this role.</span>}
          </div>
        </section>

        <section className="candidate-overlay__section">
          <h3 className="candidate-overlay__heading">Contact</h3>
          <dl className="candidate-overlay__details">
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${email}`}>{email}</a></dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{phone ? <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a> : <span className="muted">Not provided</span>}</dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd><ProfileLink value={linkedin} /></dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd><ProfileLink value={github} /></dd>
            </div>
            <div>
              <dt>Resume file</dt>
              <dd>{resumeFileName}</dd>
            </div>
          </dl>
        </section>

        {error && <p className="alert alert--error" role="alert">{error}</p>}

        <footer className="candidate-overlay__actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving || status === 'accepted'}
            onClick={() => change('accepted')}
          >
            Move to next round
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={saving || status === 'rejected'}
            onClick={() => change('rejected')}
          >
            Reject
          </button>
          {status !== 'pending' && (
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => change('pending')}>
              Back to under review
            </button>
          )}
        </footer>
      </div>
    </Modal>
  )
}
