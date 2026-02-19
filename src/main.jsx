import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/accessibility.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { StatsProvider } from './contexts/StatsContext'
import { UserWordsProvider } from './contexts/UserWordsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <StatsProvider>
        <UserWordsProvider>
          <App />
        </UserWordsProvider>
      </StatsProvider>
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
