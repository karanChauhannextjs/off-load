import React, { Suspense } from 'react';
import { LoadingScreen } from '@pages/index.ts';

const BrowserAgoraProvider = React.lazy(
  () => import('./agora-provider.browser'),
);

type Props = {
  children: React.ReactNode;
};

export default function ClientAgoraProvider({ children }: Props) {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <BrowserAgoraProvider>{children}</BrowserAgoraProvider>
    </Suspense>
  );
}
