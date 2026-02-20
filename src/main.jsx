import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/accessibility.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { TierProvider } from './contexts/TierContext'
import { StatsProvider } from './contexts/StatsContext'
import { UserWordsProvider } from './contexts/UserWordsContext'
import { GamificationProvider } from './contexts/GamificationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <TierProvider>
          <StatsProvider>
            <UserWordsProvider>
              <GamificationProvider>
                <App />
              </GamificationProvider>
            </UserWordsProvider>
          </StatsProvider>
        </TierProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// PWA Service Worker registration with update prompt
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        if (confirm('גרסה חדשה זמינה! לרענן?')) {
          window.location.reload()
        }
      },
      onOfflineReady() {
        console.log('App ready for offline use')
      }
    })
  }).catch(() => {
    // PWA not available in dev mode
  })
}
