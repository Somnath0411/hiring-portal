import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathFor } from '../../utils/paths'
import './Header.css'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to={user ? homePathFor(user.role) : '/'} className="site-header__brand">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="20" height="4" rx="2" fill="currentColor" />
            <rect x="1" y="9" width="14" height="4" rx="2" fill="currentColor" opacity="0.7" />
            <rect x="1" y="15" width="8" height="4" rx="2" fill="currentColor" opacity="0.45" />
          </svg>
          Shortlist
        </Link>

        <nav className="site-header__nav" aria-label="Account">
          {user ? (
            <>
              <span className="site-header__user">
                <span className="site-header__name">{user.name}</span>
                <span className="badge badge--neutral">{user.role === 'admin' ? 'Admin' : 'Employee'}</span>
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
