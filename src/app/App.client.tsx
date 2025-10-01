import Routing from '@routes/index.tsx';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { LazyAgoraProvider } from './provider/LazyAgoraProvider';

function ClientApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <LazyAgoraProvider>
          <Routing />
        </LazyAgoraProvider>
      </Suspense>
    </BrowserRouter>
  );
}

export default ClientApp;


