import { FEED_PROVIDERS } from '../../feeds'
import { AnimatedOutlet } from '../motion/AnimatedOutlet'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-atmosphere" aria-hidden>
        <span className="app-atmosphere__glow" />
        <span className="app-atmosphere__grid" />
        <span className="app-atmosphere__noise" />
      </div>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content" className="app-main" tabIndex={-1}>
        <AnimatedOutlet />
      </main>
      <footer className="site-footer">
        <p>
          Data from{' '}
          {FEED_PROVIDERS.map((feed, index) => (
            <span key={feed.id}>
              {index > 0 ? ', ' : null}
              {feed.docsUrl ? (
                <a href={feed.docsUrl} target="_blank" rel="noreferrer">
                  {feed.name}
                </a>
              ) : (
                feed.name
              )}
            </span>
          ))}
          . Third-party streams.
        </p>
      </footer>
    </div>
  )
}
