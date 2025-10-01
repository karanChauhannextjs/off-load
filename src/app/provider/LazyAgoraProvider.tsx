import React, { Suspense } from 'react';
import { LoadingScreen } from '@pages/index.ts';

const ClientAgoraProvider = React.lazy(() =>
  typeof window === 'undefined'
    ? new Promise(() => {}) // Return empty promise on server-side
    : import('./agora-provider.client').then((module) => ({
        default: module.default,
      })),
);

type Props = {
  children: React.ReactNode;
};

export function LazyAgoraProvider({ children }: Props) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ClientAgoraProvider>{children}</ClientAgoraProvider>
    </Suspense>
  );
}

