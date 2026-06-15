import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });

  // When a new service worker takes over, reload the page to get fresh code
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[App] New service worker took over — reloading for fresh content...');
    window.location.reload();
  });
}
