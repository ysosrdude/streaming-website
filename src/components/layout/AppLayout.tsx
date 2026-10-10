import { Outlet } from 'react-router-dom'
import { FEED_PROVIDERS } from '../../feeds'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Data provided by{' '}
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
          . Streams are third-party embeds.
        </p>
      </footer>
    </div>
  )
}
