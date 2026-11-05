import { useEffect, useState } from 'react'
import * as api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import CandidateCard from '../CandidateCard/CandidateCard'
import CandidateOverlay from '../CandidateOverlay/CandidateOverlay'
import './Leaderboard.css'

// Ranked grid of everyone who applied. Rank comes from test score + resume score.
// Click a card to open the overlay with full details and the accept / reject buttons.
export default function Leaderboard({ roles }) {
  const { handleAuthError } = useAuth()
  const [roleFilter, setRoleFilter] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError('')

    api
      .getLeaderboard(roleFilter || null)
      .then((data) => {
        if (!ignore) setRows(data)
      })
      .catch((err) => {
        if (!ignore) setError(handleAuthError(err))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [roleFilter, handleAuthError])

  const selected = rows.find((row) => row.id === selectedId) ?? null

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateApplicationStatus(id, status)
    } catch (err) {
      throw new Error(handleAuthError(err))
    }
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)))
  }

  return (
    <div className="stack" style={{ '--gap': 'var(--space-5)' }}>
      <div className="leaderboard__controls">
        <div className="field leaderboard__filter">
          <label htmlFor="leaderboard-role">Role</label>
          <select
            id="leaderboard-role"
            className="input"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.title}</option>
            ))}
          </select>
        </div>

        {!loading && !error && (
          <p className="muted" aria-live="polite">
            {rows.length} {rows.length === 1 ? 'candidate' : 'candidates'}, highest total score first
          </p>
        )}
      </div>

      {loading && (
        <div className="loading" role="status">
          <span className="spinner" aria-hidden="true" /> Loading candidates
        </div>
      )}

      {error && <p className="alert alert--error" role="alert">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Candidates show up here as soon as they finish a test.</p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <ul className="grid-cards">
          {rows.map((row) => (
            <li key={row.id}>
              <CandidateCard candidate={row} onOpen={(candidate) => setSelectedId(candidate.id)} />
            </li>
          ))}
        </ul>
      )}

      <CandidateOverlay
        candidate={selected}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
