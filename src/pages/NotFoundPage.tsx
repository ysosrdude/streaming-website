import { Link } from 'react-router-dom'
import { homePath } from '../routes/paths'

export function NotFoundPage() {
  return (
    <div className="state state--empty">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to={homePath('live')} className="btn btn--secondary">
        Go home
      </Link>
    </div>
  )
}
