// Polyfill "global" for sockjs-client / stompjs in browser
// Must be FIRST line before any imports
// @ts-ignore
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  // @ts-ignore
  window.global = window
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
