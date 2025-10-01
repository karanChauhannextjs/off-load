import ReactDOM from 'react-dom/client';
import App from './app/App.tsx';
import { IntlProvider } from 'react-intl';
import { Toaster } from 'react-hot-toast';

window.addEventListener('vite:preloadError', (event) => {
  console.error('Preload failed:', event);
  event.preventDefault();
  window.location.reload();
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <IntlProvider locale={'en'}>
    <App />
    <Toaster
      toastOptions={{
        icon: null,
        position: 'top-center',
        duration: 2000,
        success: {
          style: {
            background: '#11CE51',
          },
        },
        error: {
          style: {
            background: '#FF3A3A',
          },
        },
      }}
    />
  </IntlProvider>,
);
