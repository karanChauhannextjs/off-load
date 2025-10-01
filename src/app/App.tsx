import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Routing from '@routes/index.tsx';
import AgoraRTC, {
  AgoraRTCProvider,
  IAgoraRTCClient,
  useRTCClient,
} from 'agora-rtc-react';
// import { useEffect } from 'react';

export let client: IAgoraRTCClient;

function App() {
  client = useRTCClient(AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }));

  // useEffect(() => {
  //   const halfHour = 30 * 60 * 1000;
  //
  //   const checkForUpdates = async () => {
  //     try {
  //       const response = await fetch('/version.json', { cache: 'no-store' });
  //       const data = await response.json();
  //       const currentVersion = localStorage.getItem('app_version');
  //
  //       if (currentVersion && currentVersion !== data.version) {
  //         localStorage.setItem('app_version', data.version);
  //         window.location.reload();
  //       } else {
  //         localStorage.setItem('app_version', data.version);
  //       }
  //     } catch (error) {
  //       console.error('Failed to check version:', error);
  //     }
  //   };
  //
  //   const intervalId = setInterval(checkForUpdates, halfHour);
  //
  //   return () => clearInterval(intervalId);
  // }, []);

  // useEffect(() => {
  //   const handleError = (event:any) => {
  //     if (event.message?.includes("Failed to load module script") || event.message.includes('Failed to load resource')) {
  //       window.location.reload();
  //     }
  //   };
  //
  //   window.addEventListener("error", handleError);
  //
  //   return () => {
  //     window.removeEventListener("error", handleError);
  //   };
  // }, []);

  return (
    <BrowserRouter>
      <AgoraRTCProvider client={client}>
        <Routing />
      </AgoraRTCProvider>
    </BrowserRouter>
  );
}

export default App;
