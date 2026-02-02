
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registra o Service Worker para funcionalidade offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registrado com sucesso:', registration.scope);
      })
      .catch(err => {
        console.warn('Service Worker falhou (provável ambiente de preview):', err);
        // Avisa a aplicação que o registro falhou para não ficar esperando o cache
        window.postMessage({ type: 'SW_REGISTRATION_FAILED' }, '*');
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
