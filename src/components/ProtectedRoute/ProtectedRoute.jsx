import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathFor } from '../../utils/paths'

// Wrap a page to keep it behind login. Pass `role` to limit it to admins or employees.
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to={homePathFor(user.role)} replace />
  return children
}
