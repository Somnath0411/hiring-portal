import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathFor } from '../../utils/paths'
import './Login.css'

// Accounts that exist in the mock data (src/data/mockDb.js). Remove this list once real users exist.
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@shortlist.dev', password: 'admin123' },
  { label: 'Employee', email: 'ravi@shortlist.dev', password: 'employee123' },
]

export default function Login() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already signed in, or just signed in: go to the right dashboard.
  if (user) {
    const home = homePathFor(user.role)
    const from = location.state?.from
    return <Navigate to={from?.startsWith(home) ? from : home} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <main className="login container">
      <div className="login__panel">
        <h1 className="login__title">Log in</h1>
        <p className="muted">Admins land on the hiring dashboard. Employees see open roles.</p>

        <form className="stack" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="alert alert--error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || !email || !password}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" /> Logging in
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <div className="login__demo">
          <h2 className="login__demo-title">Demo accounts</h2>
          <ul className="stack" style={{ '--gap': 'var(--space-2)' }}>
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="login__demo-row">
                <span>
                  <strong>{account.label}</strong>
                  <span className="muted text-sm"> {account.email}</span>
                </span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillDemo(account)}>
                  Fill in
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
