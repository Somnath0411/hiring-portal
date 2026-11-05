import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { isEmail, normalizeUrl } from '../../utils/format'
import './ApplyRole.css'

const STEPS = ['Your details and resume', 'Test']

function TextField({ id, label, error, hint, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" aria-invalid={Boolean(error)} aria-describedby={describedBy} {...inputProps} />
      {hint && !error && <span id={`${id}-hint`} className="field-hint">{hint}</span>}
      {error && <span id={`${id}-error`} className="field-error">{error}</span>}
    </div>
  )
}

export default function ApplyRole() {
  const { roleId } = useParams()
  const navigate = useNavigate()
  const { handleAuthError } = useAuth()

  const [role, setRole] = useState(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', linkedin: '', github: '' })
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [detailsErrors, setDetailsErrors] = useState({})
  const [reading, setReading] = useState(false)

  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let ignore = false
    Promise.all([api.getRoleForTest(roleId), api.getProfile(), api.getMyApplications()])
      .then(([roleData, me, applications]) => {
        if (ignore) return
        setRole(roleData)
        setAlreadyApplied(applications.some((app) => app.roleId === roleData.id))
        setProfile({
          name: me.name,
          email: me.email,
          phone: me.phone || '',
          linkedin: me.linkedin || '',
          github: me.github || '',
        })
      })
      .catch((err) => {
        if (!ignore) setLoadError(handleAuthError(err))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [roleId, handleAuthError])

  const setField = (field) => (event) => setProfile((current) => ({ ...current, [field]: event.target.value }))

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null)
    setResumeText('')
    setDetailsErrors((current) => ({ ...current, file: undefined }))
  }

  const handleContinue = async (event) => {
    event.preventDefault()

    const errors = {}
    if (!profile.name.trim()) errors.name = 'Enter your name.'
    if (!isEmail(profile.email)) errors.email = 'Enter a valid email address.'
    if (!file) errors.file = 'Choose your resume.'
    if (Object.keys(errors).length) {
      setDetailsErrors(errors)
      return
    }

    setReading(true)
    try {
      // Read the resume now so a bad file is caught before the test starts.
      // Loaded on demand so the PDF reader stays out of the main bundle.
      const { extractResumeText } = await import('../../utils/resumeParser')
      const text = resumeText || (await extractResumeText(file))
      setResumeText(text)
      setDetailsErrors({})
      setStep(2)
    } catch (err) {
      setDetailsErrors({ file: err.message })
    } finally {
      setReading(false)
    }
  }

  const total = role?.questions.length ?? 0
  const answeredCount = role ? role.questions.filter((q) => answers[q.id] !== undefined).length : 0

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (answeredCount < total) {
      setSubmitError('Answer every question before submitting.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await api.submitApplication({
        roleId: role.id,
        profile: { ...profile, linkedin: normalizeUrl(profile.linkedin), github: normalizeUrl(profile.github) },
        resumeFileName: file.name,
        resumeText,
        answers,
      })
      navigate('/employee', { state: { submitted: role.title } })
    } catch (err) {
      setSubmitError(handleAuthError(err))
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="page container">
        <div className="loading" role="status">
          <span className="spinner" aria-hidden="true" /> Loading the role
        </div>
      </main>
    )
  }

  if (loadError || !role) {
    return (
      <main className="page container">
        <p className="alert alert--error" role="alert">{loadError || 'This role is no longer open.'}</p>
        <p className="apply__back"><Link to="/employee">Back to roles</Link></p>
      </main>
    )
  }

  if (alreadyApplied) {
    return (
      <main className="page container">
        <div className="empty-state">
          <h3>You already applied for {role.title}</h3>
          <p>Your scores and result are on your home screen.</p>
          <Link to="/employee" className="btn btn-primary">Back to home</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page container apply">
      <p className="apply__back"><Link to="/employee">Back to roles</Link></p>

      <div className="page-head">
        <h1 className="page-title">{role.title}</h1>
        {role.description && <p className="page-lead">{role.description}</p>}
        {role.skills.length > 0 && (
          <div className="apply__skills">
            <span className="muted text-sm">Your resume is scored on these skills</span>
            <div className="chips">
              {role.skills.map((skill) => (
                <span key={skill} className="chip">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <ol className="apply__steps" aria-label="Application steps">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`apply__step${step === index + 1 ? ' is-current' : ''}${step > index + 1 ? ' is-done' : ''}`}
            aria-current={step === index + 1 ? 'step' : undefined}
          >
            <span className="apply__step-number">{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <form className="card stack apply__form" onSubmit={handleContinue} noValidate>
          <div className="field-row">
            <TextField
              id="apply-name"
              label="Full name"
              value={profile.name}
              onChange={setField('name')}
              error={detailsErrors.name}
              autoComplete="name"
            />
            <TextField
              id="apply-email"
              label="Email"
              type="email"
              value={profile.email}
              onChange={setField('email')}
              error={detailsErrors.email}
              autoComplete="email"
            />
          </div>

          <div className="field-row">
            <TextField
              id="apply-phone"
              label="Phone"
              type="tel"
              value={profile.phone}
              onChange={setField('phone')}
              autoComplete="tel"
            />
            <TextField
              id="apply-linkedin"
              label="LinkedIn"
              value={profile.linkedin}
              onChange={setField('linkedin')}
              placeholder="linkedin.com/in/your-name"
            />
          </div>

          <TextField
            id="apply-github"
            label="GitHub"
            value={profile.github}
            onChange={setField('github')}
            placeholder="github.com/your-name"
          />

          <div className="field">
            <label htmlFor="apply-resume">Resume</label>
            <input
              id="apply-resume"
              type="file"
              className="input"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFileChange}
              aria-invalid={Boolean(detailsErrors.file)}
              aria-describedby={detailsErrors.file ? 'apply-resume-error' : 'apply-resume-hint'}
            />
            {detailsErrors.file ? (
              <span id="apply-resume-error" className="field-error" role="alert">{detailsErrors.file}</span>
            ) : (
              <span id="apply-resume-hint" className="field-hint">
                A PDF with selectable text, or a .txt file. Up to 5 MB.
              </span>
            )}
          </div>

          <div>
            <button type="submit" className="btn btn-primary" disabled={reading}>
              {reading ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Reading your resume
                </>
              ) : (
                'Continue to the test'
              )}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="stack apply__form" style={{ '--gap': 'var(--space-5)' }} onSubmit={handleSubmit}>
          <p className="muted" aria-live="polite">
            {answeredCount} of {total} answered
          </p>

          {role.questions.map((question, index) => (
            <fieldset key={question.id} className="apply__question">
              <legend className="apply__legend">
                {index + 1}. {question.text}
              </legend>
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex
                return (
                  <label key={optionIndex} className={`apply__option${selected ? ' is-selected' : ''}`}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={selected}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    />
                    <span>{option}</span>
                  </label>
                )
              })}
            </fieldset>
          ))}

          {submitError && <p className="alert alert--error" role="alert">{submitError}</p>}

          <div className="row">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} disabled={submitting}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || answeredCount < total}>
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Submitting
                </>
              ) : (
                'Submit application'
              )}
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
