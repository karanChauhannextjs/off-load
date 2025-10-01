import React from 'react';
import AgoraRTC, { AgoraRTCProvider } from 'agora-rtc-react';

type Props = {
  children: React.ReactNode;
};

export default function BrowserAgoraProvider({ children }: Props) {
  const client = React.useMemo(
    () => AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }),
    [],
  );

  return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
}

