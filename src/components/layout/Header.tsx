import { Link } from 'react-router-dom'
import { homePath } from '../../routes/paths'

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to={homePath('live')} className="brand">
          <span className="brand__mark" aria-hidden />
          <span className="brand__text">StreamHub</span>
        </Link>
        <p className="site-header__tagline">Multi-feed live sports</p>
      </div>
    </header>
  )
}
