import { useEffect } from 'react'
import { HashRouter, useLocation } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { SessionProvider } from './SessionContext'
import { AppRoutes } from './routes'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function App() {
  return (
    <HashRouter>
      <SessionProvider>
        <ScrollToTop />
        <div className="app-shell">
          <Header />
          <main id="main" tabIndex={-1}>
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </SessionProvider>
    </HashRouter>
  )
}
