import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import cn from 'classnames';

import styles from './ClientTabbar.module.scss';
import { ClientSidebarData } from '@constants/constants.ts';
import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  USER_PUBLIC_BASE_URL,
  USER_PUBLIC_URL,
} from '@routes/Routes.types.ts';
import { useUnreadStore } from '@store/unreadStore.ts';
import { connection } from '../../services/agoraChat.ts';
import { useExerciseComplete } from '@store/exerciseComplete.ts';
import { useExercises } from '@store/exercises.ts';
import {useConversation} from "@store/chat.ts";

interface ISidebarProps {
  setAgoraConnected?: any
}


const ClientTabbar: React.FC<ISidebarProps> = (props) => {
  const {setAgoraConnected} = props
  const [activeId, setActiveId] = useState<number>(1);
  const newMessages = useUnreadStore((state: any) => state.newMessages);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const token = localStorage.getItem('ACCESS_TOKEN');
  const [isNewMessage, setIsNewMessage] = useState<boolean | undefined>(false);
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
        setAgoraConnected(true)
      },
      onDisconnected: (err:any) =>{
        console.log('Disconnected')
        setAgoraConnected(false)
        if(err?.type === 206){
          localStorage.removeItem('user');
          localStorage.removeItem('ACCESS_TOKEN');
          window.location.reload();
        }else if(err?.type){
          reconnectAgoraChat()
        }else{
          console.log('Long Time inactive', err)
        }
      }
    });

    return () => {
      connection.close();
    };
  }, []);

  return (
    <ul className={styles.tabBarWrapper}>
      {ClientSidebarData.map((el, idx) => {
        const { id, label, icon, path, inTabBar } = el;
        return (
          <>
            {inTabBar && (
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
            )}
          </>
        );
      })}
    </ul>
  );
};
export default ClientTabbar;
