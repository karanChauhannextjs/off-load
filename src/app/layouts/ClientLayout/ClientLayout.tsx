import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from '@features/Header';
import styles from './ClientLayout.module.scss';
import { ClientSidebar, ClientTabbar } from '@features/index.ts';
import cn from 'classnames';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { FeedbackModal, LoadingScreen } from '@pages/index.ts';
import Smile from '@assets/images/thinking-face.svg';

const ClientLayout: React.FC = () => {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(false);
  const [agoraConnected, setAgoraConnected] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(
    window.innerWidth <= 768,
  );
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const modalHandlers = useAppModalSimpleHandlers();

  const onFeedbackClick = () => {
    setFeedbackShow(true);
    modalHandlers.show();
  };

  useEffect(() => {
    const hash = location.hash;
    if (hash === '#selected_chat') {
      setSelectedChat(true);
    } else {
      setSelectedChat(false);
    }
  }, [location]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isFeedbackVisibility =
    location.pathname.includes('client-home') ||
    (location.pathname.includes('client-messages') &&
      location.hash !== '#selected_chat') ||
    location.pathname.includes('care') ||
    location.pathname.includes('feed');

  return (
    <div className={styles.container}>
      <Header className={styles.header} />
      <div className={styles.body}>
        {!isMobileScreen && (
          <div className={styles.sidebar}>
            <ClientSidebar setAgoraConnected={setAgoraConnected} />
          </div>
        )}
        <div className={styles.main}>
          {agoraConnected ? <Outlet /> : <LoadingScreen />}
          {isFeedbackVisibility && isMobileScreen && (
            <div className={styles.feedbackWrapper} onClick={onFeedbackClick}>
              <span>Give Feedback</span>
              <img src={Smile} alt="smile" className={styles.smile} />
            </div>
          )}
          {feedbackShow && (
            <AppModal width={389} {...modalHandlers}>
              <FeedbackModal setFeedbackShow={setFeedbackShow} />
            </AppModal>
          )}
        </div>
        {isMobileScreen && (
          <div
            className={cn(styles.tabBar, { [styles.tabBarHide]: selectedChat })}
          >
            <ClientTabbar setAgoraConnected={setAgoraConnected} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientLayout;
