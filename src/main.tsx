import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely handle global cross-origin script errors and unhandled promise rejections 
// to prevent browser sandboxing and cookie-blocking constraints from crashing the interface.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message === 'Script error.' || !event.message) {
      console.warn('Safely intercepted cross-origin Script error.');
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Safely intercepted unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

