import React, { Suspense } from 'react';
import { LoadingScreen } from '@pages/index.ts';
import { ChatProps } from './Chat.types';

const ChatComponent = React.lazy(() =>
  typeof window === 'undefined'
    ? new Promise(() => {}) // Return empty promise on server-side
    : import('./Chat.browser').then((module) => ({ default: module.default })),
);

export const Chat: React.FC<ChatProps> = (props) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ChatComponent {...props} />
    </Suspense>
  );
};
