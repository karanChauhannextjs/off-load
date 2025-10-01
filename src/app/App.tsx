import ClientApp from './App.client';
import ServerApp from './App.server';

interface AppProps {
  url?: string;
}

function App({ url }: AppProps) {
  if (typeof window === 'undefined') {
    return <ServerApp url={url || '/'} />;
  }
  return <ClientApp />;
}

export default App;
