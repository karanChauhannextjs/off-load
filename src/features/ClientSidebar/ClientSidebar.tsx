import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import cn from 'classnames';

import styles from './ClientSidebar.module.scss';
import { ClientSidebarData } from '@constants/constants.ts';
import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  USER_PUBLIC_BASE_URL,
  USER_PUBLIC_URL,
} from '@routes/Routes.types.ts';
import { connection } from '../../services/agoraChat.ts';
import { useUnreadStore } from '@store/unreadStore.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { FeedbackModal } from '@pages/index.ts';
import Smile from '@assets/images/thinking-face.svg';
import { useExerciseComplete } from '@store/exerciseComplete.ts';
import { useExercises } from '@store/exercises.ts';
import {useConversation} from "@store/chat.ts";
import {redirectToAppStore} from "@utils/helpers.ts";
import { USER_TYPES } from '@constants/user.ts';

interface ISidebarProps {
  setAgoraConnected?: any
}

const ClientSidebar: React.FC<ISidebarProps> = (props) => {
  const {setAgoraConnected} = props
  const [activeId, setActiveId] = useState<number>(1);
  const newMessages = useUnreadStore((state: any) => state.newMessages);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const token = localStorage.getItem('ACCESS_TOKEN');
  const [isNewMessage, setIsNewMessage] = useState<boolean | undefined>(false);
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const modalHandlers = useAppModalSimpleHandlers();
  const reset = useExerciseComplete((state: any) => state.reset);
  const resetExercises = useExercises((state: any) => state.reset);
  const getAgoraRefreshToken = useConversation(
    (state) => state.getAgoraRefreshToken,
  );
  const [isLogedIn, setIsLogedIn] = useState<boolean>(false);

  const loginUserAgora = async (username: string, token: string) => {
    try {
      const result = await connection.open({
        user: username,
        accessToken: token,
      });
      console.log('Login successful');
      if (result?.accessToken) {
        setIsLogedIn(true);
      }
    } catch (error) {
      console.error('Login failed', error);
      setIsLogedIn(false);
    }
  };

  const reconnectAgoraChat = async () => {
    await getAgoraRefreshToken()
      .then((res: any) => {
        if (!!res) {
          // connection.renewToken(res.agoraChatToken)
          loginUserAgora(res?.agoraUsername, res?.agoraChatToken);
          localStorage.setItem('user', JSON.stringify(res));
        }
      })
      .catch((e) => {
        console.log('Refresh error', e);
      });
    setAgoraConnected(true)
  };

  const onFeedback = () => {
    modalHandlers.show();
    setFeedbackShow(true);
  };

  const onClickSidebarItem = (id: number, path: string) => {
    if (activeId !== id) {
      reset();
      resetExercises();
      localStorage.removeItem('selectedGroup')
      localStorage.removeItem('selectedCategory')
      localStorage.removeItem('savedScrollForHome')
      localStorage.removeItem('scrollPositionFromCare')
      if (!token && user?.type !== 2) {
        if (path === 'client-messages' || path === 'client-account') {
          navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.CLIENT_SIGN_UP}`);
        } else {
          navigate(`${USER_PUBLIC_URL}/${path}`);
        }
      } else {
        navigate(`${CLIENT_PRIVATE_BASE_URL}/${path}`);
        setActiveId(id);
      }
    }
  };

  const onPrivacyPolicy = () => {
    window.open('https://www.offloadweb.com/privacy-policy', '_blanc')
  };

  const onTermsOfUse = () => {
    window.open('https://www.offloadweb.com/terms-of-service-client', '_blanc')
  };

  useEffect(() => {
    const activeTab = ClientSidebarData.find(
      (e) => e?.path === pathname.split('/')[2],
    );
    if (activeTab) {
      setActiveId(activeTab?.id);
    }
  }, [pathname]);

  const getConversationList = () => {
    connection
      .getConversationlist({
        pageNum: 1,
        pageSize: 100,
      })
      .then((result) => {
        setIsNewMessage(
          result?.data?.channel_infos.some((e) => e.unread_num > 0),
        );
      })
      .catch((e) => {
        console.log('Error', e);
      });
  };

  useEffect(() => {
    if (isLogedIn) {
      getConversationList();
    }
  }, [
    isLogedIn,
    newMessages,
    // activeId,
  ]);

  useEffect(() => {
    const now = Date.now() % 1000
    if(now > user?.agoraTokenExpiration){
      getAgoraRefreshToken()
        .then((res: any) => {
          if (!!res) {
            // connection.renewToken(res.agoraChatToken)
            loginUserAgora(res?.agoraUsername, res?.agoraChatToken);
            localStorage.setItem('user', JSON.stringify(res));
          }
        })
        .catch((e) => {
          console.log('Refresh error', e);
        });
    }
  }, []);

  useEffect(() => {
    loginUserAgora(user?.agoraUsername, user?.agoraChatToken);

    connection.addEventHandler("connection&message",{
      onTextMessage: () => {
        getConversationList();
      },
      onFileMessage: () => {
        getConversationList();
      },
      onTokenWillExpire: () =>{
        getAgoraRefreshToken()
          .then((res: any) => {
            if (!!res) {
              localStorage.setItem('user', JSON.stringify(res));
              connection.renewToken(res?.agoraChatToken);
              // loginUserAgora(res?.agoraUsername, res?.agoraChatToken);
            }
          })
          .catch((e) => {
            console.log('Refresh error', e);
          });
      },
      onTokenExpired: () =>{
        getAgoraRefreshToken()
          .then((res: any) => {
            if (!!res) {
              localStorage.setItem('user', JSON.stringify(res));
              connection.renewToken(res.agoraChatToken)
              // loginUserAgora(res?.agoraUsername, res?.agoraChatToken);
            }
          })
          .catch((e) => {
            console.log('Refresh error', e);
          });
      },
      onConnected: () =>{
        console.log('Connected ')
        setAgoraConnected(true);
      },
      onDisconnected: (err: any) =>{
        console.log('Disconnected')
        setAgoraConnected(false)
        if(err?.type === 206){
          localStorage.removeItem('user');
          localStorage.removeItem('ACCESS_TOKEN');
          window.location.reload();
        }else if(err?.type){
          reconnectAgoraChat()
        } else{
          console.log('Long Time inactive', err)
        }
      }
    });

    return () => {
      connection.close();
    };
  }, []);

  return (
    <ul className={styles.sidebarWrapper}>
      {ClientSidebarData.map((el, idx) => {
        const { id, label, icon, path } = el;
        return (
          <li
            key={id}
            className={cn(styles.row, { [styles.active]: id === activeId })}
            onClick={() => {
              onClickSidebarItem(id, path);
            }}
          >
            <i
              className={cn(`icon-${icon}`, styles.icon, {
                [styles.heart]: idx === 2 || idx === 3,
              })}
            />
            <span className={styles.label}>{label}</span>
            {idx === 1 && (newMessages || isNewMessage) && (
              <span className={styles.greenDot}></span>
            )}
          </li>
        );
      })}
      <div className={styles.burgerBottom}>
        {user?.type === USER_TYPES.CLIENT && (
          <span className={styles.label} onClick={redirectToAppStore}>Get mobile app</span>
        )}
        <div className={styles.feedbackWrapper} onClick={onFeedback}>
          <span className={styles.label}>Feedback</span>
          <img src={Smile} alt="smile" />
        </div>
        <a className={styles.label} href="mailto:edwin@offloadweb.com">Support</a>
        <div className={styles.privacyRow}>
          <span className={styles.lightLabel} onClick={onPrivacyPolicy}>Privacy</span>
          <span className={styles.dot}></span>
          <span className={styles.lightLabel} onClick={onTermsOfUse}>Terms</span>
        </div>
        <div>
          <p className={styles.lightLabel}>© 2025 Offload</p>
          <p className={styles.lightLabel}>All rights reserved</p>
        </div>
      </div>
      {feedbackShow && (
        <AppModal width={389} {...modalHandlers}>
          <FeedbackModal setFeedbackShow={setFeedbackShow} />
        </AppModal>
      )}
    </ul>
  );
};
export default ClientSidebar;
