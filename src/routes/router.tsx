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
      { index: true, element: <BrowsePage /> },
      { path: 'sport/:sportId', element: <BrowsePage /> },
      { path: 'event', element: <EventOffersPage /> },
      { path: 'watch/:providerId/:matchId', element: <WatchPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
