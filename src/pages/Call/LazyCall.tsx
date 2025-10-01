import React, { Suspense } from 'react';
import { LoadingScreen } from '@pages/index.ts';

const CallComponent = React.lazy(() => {
  if (typeof window === 'undefined') {
    return new Promise(() => {}); // Return empty promise on server-side
  }
  return import('./Call');
});

export default function LazyCall() {
  if (typeof window === 'undefined') {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <CallComponent />
    </Suspense>
  );
}

