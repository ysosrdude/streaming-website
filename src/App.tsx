import { MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router-dom'
import { ProviderSelectionProvider } from './context/ProviderSelectionContext'
import { router } from './routes/router'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ProviderSelectionProvider>
        <RouterProvider router={router} />
      </ProviderSelectionProvider>
    </MotionConfig>
  )
}
