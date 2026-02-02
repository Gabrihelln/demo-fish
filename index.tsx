
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Função robusta de registro do Service Worker
const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Usar './sw.js' é mais seguro para Vercel e outros ambientes de deploy
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './'
      });
      console.log('SGA: Service Worker registrado com sucesso:', registration.scope);
    } catch (err) {
      console.error('SGA: Erro crítico ao registrar Service Worker:', err);
      // Notifica o sistema sobre a falha para liberar a interface
      window.postMessage({ type: 'SW_REGISTRATION_FAILED' }, '*');
    }
  } else {
    console.warn('SGA: Navegador não suporta Service Workers.');
    window.postMessage({ type: 'SW_REGISTRATION_FAILED' }, '*');
  }
};

window.addEventListener('load', registerSW);

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
