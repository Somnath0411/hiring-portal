import { useCallback, useEffect, useState } from 'react'
import * as api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Tabs from '../../components/Tabs/Tabs'
import QuestionnaireList from '../../components/QuestionnaireList/QuestionnaireList'
import QuestionnaireForm from '../../components/QuestionnaireForm/QuestionnaireForm'
import Leaderboard from '../../components/Leaderboard/Leaderboard'
import './AdminDashboard.css'

const TABS = [
  { id: 'questionnaires', label: 'Questionnaires' },
  { id: 'leaderboard', label: 'Leaderboard' },
]

export default function AdminDashboard() {
  const { handleAuthError } = useAuth()
  const [tab, setTab] = useState('questionnaires')
  const [creating, setCreating] = useState(false)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const loadRoles = useCallback(async () => {
    try {
      setRoles(await api.getRoles())
      setError('')
    } catch (err) {
      setError(handleAuthError(err))
    } finally {
      setLoading(false)
    }
  }, [handleAuthError])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const handleSaved = (title) => {
    setCreating(false)
    setFlash(`The questionnaire for ${title} is live. Employees can apply now.`)
    loadRoles()
  }

  const handleDelete = async (role) => {
    setDeletingId(role.id)
    setFlash('')
    try {
      await api.deleteRole(role.id)
      setFlash(`Deleted ${role.title}.`)
      await loadRoles()
    } catch (err) {
      setError(handleAuthError(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="page container">
      <div className="page-head">
        <h1 className="page-title">Hiring dashboard</h1>
        <p className="page-lead">Create tests for open roles and see who is ranking highest.</p>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} label="Dashboard sections" />

      {/* Kept mounted (just hidden) so a half-written questionnaire survives a visit to the leaderboard. */}
      <div role="tabpanel" id="panel-questionnaires" aria-labelledby="tab-questionnaires" hidden={tab !== 'questionnaires'}>
        {creating ? (
          <QuestionnaireForm onSaved={handleSaved} onCancel={() => setCreating(false)} />
        ) : (
          <div className="stack" style={{ '--gap': 'var(--space-5)' }}>
            <div className="row row--between">
              <h2 className="section-title">Your questionnaires</h2>
              {roles.length > 0 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setFlash('')
                    setCreating(true)
                  }}
                >
                  New questionnaire
                </button>
              )}
            </div>

            {flash && <p className="alert alert--success" role="status">{flash}</p>}
            {error && <p className="alert alert--error" role="alert">{error}</p>}

            {loading ? (
              <div className="loading" role="status">
                <span className="spinner" aria-hidden="true" /> Loading questionnaires
              </div>
            ) : (
              <QuestionnaireList
                roles={roles}
                deletingId={deletingId}
                onDelete={handleDelete}
                onCreate={() => setCreating(true)}
              />
            )}
          </div>
        )}
      </div>

      {tab === 'leaderboard' && (
        <div role="tabpanel" id="panel-leaderboard" aria-labelledby="tab-leaderboard">
          <Leaderboard roles={roles} />
        </div>
      )}
    </main>
  )
}
