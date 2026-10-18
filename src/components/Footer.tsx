import { Link } from 'react-router-dom'
import { INDEPENDENCE_DISCLAIMER, TRAINING_DISCLAIMER } from '../app/copy'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-name">XR SkillLab</p>
          <p className="footer-meta">Independent educational prototype. No account. No tracking. No personal data collected.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <Link to="/simulate">Demo</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/project">Project Story</Link>
          <Link to="/about">About</Link>
        </nav>
        <div className="footer-legal">
          <p>{INDEPENDENCE_DISCLAIMER}</p>
          <p>{TRAINING_DISCLAIMER}</p>
        </div>
      </div>
    </footer>
  )
}
