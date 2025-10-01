// Move the original Chat.tsx content here
import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import cn from 'classnames';
import AC, { AgoraChat } from 'agora-chat';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChatProps } from './Chat.types';
import styles from './Chat.module.scss';
// ... rest of the imports

const Chat: React.FC<ChatProps> = (props) => {
  // ... rest of the component code from Chat.tsx
};

export default Chat;

