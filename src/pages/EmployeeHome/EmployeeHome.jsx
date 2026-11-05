import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { firstName } from '../../utils/format'
import RoleCard from '../../components/RoleCard/RoleCard'
import ApplicationList from '../../components/ApplicationList/ApplicationList'
import './EmployeeHome.css'

export default function EmployeeHome() {
  const { user, handleAuthError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [roles, setRoles] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // The apply page sends the role title here after a successful submit. Show it once.
  const [submittedTitle] = useState(location.state?.submitted ?? null)
  useEffect(() => {
    if (location.state?.submitted) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  useEffect(() => {
    let ignore = false
    Promise.all([api.getOpenRoles(), api.getMyApplications()])
      .then(([openRoles, mine]) => {
        if (ignore) return
        setRoles(openRoles)
        setApplications(mine)
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
  }, [handleAuthError])

  const appliedRoleIds = new Set(applications.map((app) => app.roleId))

  return (
    <main className="page container">
      <div className="page-head">
        <h1 className="page-title">Hi, {firstName(user.name)}</h1>
        <p className="page-lead">
          Pick a role to upload your resume and take its test. Your scores and results show up on this page.
        </p>
      </div>

      {submittedTitle && (
        <p className="alert alert--success employee-home__flash" role="status">
          Your application for {submittedTitle} is in. Your scores are listed under My applications.
        </p>
      )}

      {error && <p className="alert alert--error" role="alert">{error}</p>}

      {loading ? (
        <div className="loading" role="status">
          <span className="spinner" aria-hidden="true" /> Loading your home screen
        </div>
      ) : (
        !error && (
          <div className="stack" style={{ '--gap': 'var(--space-7)' }}>
            {applications.length > 0 && (
              <section className="stack" aria-labelledby="my-applications-title">
                <h2 id="my-applications-title" className="section-title">My applications</h2>
                <ApplicationList applications={applications} />
              </section>
            )}

            <section className="stack" aria-labelledby="open-roles-title">
              <h2 id="open-roles-title" className="section-title">Available roles</h2>
              {roles.length === 0 ? (
                <div className="empty-state">
                  <h3>No open roles right now</h3>
                  <p>Check back soon. New roles appear here as soon as they are posted.</p>
                </div>
              ) : (
                <ul className="grid-cards">
                  {roles.map((role) => (
                    <li key={role.id}>
                      <RoleCard
                        role={role}
                        applied={appliedRoleIds.has(role.id)}
                        onApply={(chosen) => navigate(`/employee/apply/${chosen.id}`)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )
      )}
    </main>
  )
}
