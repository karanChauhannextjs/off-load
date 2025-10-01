import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { THERAPIST_PRIVATE_BASE_URL } from '@routes/Routes.types.ts';
import { TherapistSidebarData } from '@constants/constants.ts';
import styles from './TherapistTabbar.module.scss';
import cn from 'classnames';
import { useUnreadStore } from '@store/unreadStore.ts';
import { connection } from '../../services/agoraChat.ts';
import { useExerciseComplete } from '@store/exerciseComplete.ts';
import { useConversation } from '@store/chat.ts';
import {USER_TYPES} from "@constants/user.ts";

interface ISidebarProps {
  setAgoraConnected: any
}

const TherapistTabbar: React.FC<ISidebarProps> = (props) => {
  const {setAgoraConnected} = props
  const [activeId, setActiveId] = useState<number>(1);
  const newMessages = useUnreadStore((state: any) => state.newMessages);
  const newMessagesClients = useUnreadStore(
    (state: any) => state.newMessagesClients,
  );
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const [isNewMessage, setIsNewMessage] = useState<boolean | undefined>(false);
  const [isNewMessageClients, setIsNewMessageClients] = useState<
    boolean | undefined
  >(false);
  const resetExercises = useExerciseComplete((state: any) => state.reset);
  const getConversations = useConversation((state) => state.getConversations);
  const conversations = useConversation((state) => state.conversations);
  const therapistClientsConversations = useConversation(
    (state) => state.therapistClientsConversations,
  );
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
      if(result?.accessToken){
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
    resetExercises();
    localStorage.removeItem('selectedGroup')
    localStorage.removeItem('selectedCategory')
    localStorage.removeItem('savedScrollForHome')
    localStorage.removeItem('scrollPositionFromCare')
    navigate(`${THERAPIST_PRIVATE_BASE_URL}/${path}`);
    setActiveId(id);
  };

  const getConversationList = async () => {
    connection
      .getConversationlist({
        pageNum: 1,
        pageSize: 100,
      })
      .then((result) => {
        const arrayWithMessages = result?.data?.channel_infos?.filter(
          (e) => e.unread_num,
        );

        if (arrayWithMessages?.length) {
          let hasNewMessageFromClients = false;
          let hasOtherNewMessages = false;

          arrayWithMessages.forEach((item) => {
            const sender = item?.lastMessage?.from?.toLowerCase().trim();
            const isClientsNewMessage = therapistClientsConversations?.some(
              (el: any) => sender === el?.client?.agoraUsername?.toLowerCase(),
            );

            let isNewMessage = false;
            conversations?.forEach((el: any) => {
              const agoraUsername =
                user?.type === USER_TYPES.THERAPIST
                  ? el?.client?.agoraUsername?.toLowerCase().trim()
                  : el?.therapist?.agoraUsername?.toLowerCase().trim();
              if (sender === agoraUsername) {
                isNewMessage = true;
              }
            });
            if (isClientsNewMessage) {
              hasNewMessageFromClients = true;
            }
            if (isNewMessage) {
              hasOtherNewMessages = true;
            }
          });
          setIsNewMessageClients(hasNewMessageFromClients);
          setIsNewMessage(hasOtherNewMessages);
        } else {
          setIsNewMessageClients(false);
          setIsNewMessage(false);
        }
      })
      .catch((e) => {
        console.log('Error', e);
      });
  };

  useEffect(() => {
    const activeTab = TherapistSidebarData.find(
      (e) => e?.path === pathname.split('/')[2],
    );
    if (activeTab) {
      setActiveId(activeTab?.id);
    }
  }, [pathname]);

  useEffect(() => {
    if (isLogedIn) {
      getConversationList();
    }
  }, [
    isLogedIn,
    conversations,
    therapistClientsConversations,
    newMessages,
    newMessagesClients,
    // activeId,
  ]);


  useEffect(() => {
    getConversations(0, 100, 1);
    getConversations(0, 100, 2);
  }, [activeId]);

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
        if(!conversations?.length && !therapistClientsConversations?.length){
          getConversations(0, 100, 1);
          getConversations(0, 100, 2);
        }
        getConversationList();
      },
      onFileMessage: () => {
        if(!conversations?.length && !therapistClientsConversations?.length){
          getConversations(0, 100, 1);
          getConversations(0, 100, 2);
        }
        getConversationList();
      },
      onTokenWillExpire: () =>{
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
      {TherapistSidebarData.map((el, idx) => {
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
                <i className={cn(`icon-${icon}`, styles.icon)} />
                <span className={styles.label}>{label}</span>
                {idx === 2 && (newMessagesClients || isNewMessageClients) && (
                  <span className={styles.greenDot}></span>
                )}
                {idx === 4 && (newMessages || isNewMessage) && (
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
export default TherapistTabbar;
