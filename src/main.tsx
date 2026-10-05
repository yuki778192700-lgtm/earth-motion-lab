import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { installLabelLifecycleDiagnostics } from './lib/diagnostics/labelLifecycleDiagnostics'
import { useEarthLabStore } from './store/useEarthLabStore'

if (import.meta.env.DEV) {
  const stopDiagnostics = installLabelLifecycleDiagnostics(() => useEarthLabStore.getState().activeModuleId)
  import.meta.hot?.dispose(stopDiagnostics)
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
