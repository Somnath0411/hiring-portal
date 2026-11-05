import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="page container">
      <div className="empty-state">
        <h1 className="section-title">Page not found</h1>
        <p>The page you opened does not exist. Head back to the home page.</p>
        <Link to="/" className="btn btn-primary">Go to the home page</Link>
      </div>
    </main>
  )
}
