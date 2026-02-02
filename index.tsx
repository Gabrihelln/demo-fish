
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registra o Service Worker para funcionalidade offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usando /sw.js para garantir que busque na raiz do domínio
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SGA: Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(err => {
        console.warn('SGA: Falha ao registrar Service Worker (Modo Preview ou Erro de Rede):', err);
        // Notifica o app que o modo offline falhou para liberar a UI
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
