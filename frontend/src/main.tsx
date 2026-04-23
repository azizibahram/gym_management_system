import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPerformanceMonitoring } from './utils/performanceMonitoring'

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  initPerformanceMonitoring();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
