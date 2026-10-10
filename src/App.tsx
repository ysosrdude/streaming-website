import { RouterProvider } from 'react-router-dom'
import { ProviderSelectionProvider } from './context/ProviderSelectionContext'
import { router } from './routes/router'

export default function App() {
  return (
    <ProviderSelectionProvider>
      <RouterProvider router={router} />
    </ProviderSelectionProvider>
  )
}
