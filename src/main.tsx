import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/dm-sans'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/600.css'
import './styles/index.css'
import App from './App'
import { AuthProvider } from './features/auth/AuthProvider'
import { SiteSettingsProvider } from './features/content/SiteSettingsContext'
import { useCalmMode } from './hooks/useCalmMode'
import { useAuth } from './features/auth/authContext'

function Root() {
  const { calm } = useCalmMode()
  return (
    <MotionConfig reducedMotion={calm ? 'always' : 'user'}>
      <AuthProvider>
        <SettingsGate>
          <App />
        </SettingsGate>
      </AuthProvider>
    </MotionConfig>
  )
}

// Settings are member-only; remount the provider when the user changes so it refetches.
function SettingsGate({ children }: { children: ReactNode }) {
  const { session, role } = useAuth()
  return <SiteSettingsProvider key={`${session?.user.id ?? 'anon'}:${role ?? ''}`}>{children}</SiteSettingsProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
)
