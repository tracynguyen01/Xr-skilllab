import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/manrope'
import { App } from './app/App'
import './app/styles.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root is missing.')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
