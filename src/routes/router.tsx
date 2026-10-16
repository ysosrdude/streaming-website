import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { BrowsePage } from '../pages/BrowsePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { EventOffersPage } from '../pages/EventOffersPage'
import { WatchPage } from '../pages/WatchPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        element: <BrowsePage />,
        children: [
          { index: true, element: null },
          { path: 'sport/:sportId', element: null },
        ],
      },
      { path: 'event', element: <EventOffersPage /> },
      { path: 'watch/:providerId/:matchId', element: <WatchPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
