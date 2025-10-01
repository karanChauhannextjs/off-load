import { Suspense } from 'react';
import { StaticRouter } from 'react-router-dom/server';
import './App.css';
import { LazyAgoraProvider } from './provider/LazyAgoraProvider';
import Routing from '@routes/index.tsx';

interface ServerAppProps {
  url: string;
}

function ServerApp({ url }: ServerAppProps) {
  return (
    <StaticRouter location={url}>
      <Suspense fallback={null}>
        <LazyAgoraProvider>
          <Routing />
        </LazyAgoraProvider>
      </Suspense>
    </StaticRouter>
  );
}

export default ServerApp;


