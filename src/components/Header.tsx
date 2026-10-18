import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/simulate', label: 'Demo' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/project', label: 'Project Story' },
  { to: '/about', label: 'About' },
]

function Wordmark() {
  return (
    <Link to="/" className="wordmark">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="wordmark-mark">
        <rect width="32" height="32" rx="8" fill="#132033" />
        <path d="M6.5 14.2 16 8.2l9.5 6v10.2h-19V14.2Z" fill="#0B1220" stroke="#42DDC5" strokeWidth="1.6" />
        <path d="M14 24.4v-6.2h4v6.2" fill="#42DDC5" />
      </svg>
      XR SkillLab
    </Link>
  )
}

export function Header() {
  const location = useLocation()
  // The menu is open only while this matches the current path, so a route
  // change closes it without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null)
  const open = openPath === location.pathname

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPath(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="site-header">
      {/* A normal #main link would replace the HashRouter route, so this is a button. */}
      <button
        type="button"
        className="skip-link"
        onClick={() => document.getElementById('main')?.focus()}
      >
        Skip to content
      </button>
      <div className="header-bar">
        <Wordmark />
        <nav className="nav-desktop" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Link to="/simulate" className="btn btn-primary nav-cta">
            Try Demo
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpenPath(open ? null : location.pathname)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="nav-mobile" aria-label="Mobile">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
