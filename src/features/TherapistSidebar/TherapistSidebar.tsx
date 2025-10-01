import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import styles from './TherapistSidebar.module.scss';
import { TherapistSidebarData } from '@constants/constants.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import { PLANS_AND_BILLINGS, THERAPIST_PRIVATE_BASE_URL } from '@routes/Routes.types.ts';
import { connection } from '../../services/agoraChat.ts';
import Smile from '@assets/images/thinking-face.svg';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { FeedbackModal } from '@pages/index.ts';
import { useUnreadStore } from '@store/unreadStore.ts';
import { useConversation } from '@store/chat.ts';
import { USER_TYPES } from '@constants/user.ts';
import {useExerciseComplete} from "@store/exerciseComplete.ts";
import { Button } from '@shared/ui';
import CodeGenerationModal from '@pages/CodeGenerationModal';
import { useProfileStore } from '@store/profile.ts';
import { PaidStatus } from '@constants/plans.ts';

interface ISidebarProps {
  setAgoraConnected: any
}

const TherapistSidebar: React.FC<ISidebarProps> = (props) => {
  const {setAgoraConnected} = props
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const newMessages = useUnreadStore((state: any) => state.newMessages);
  const newMessagesClients = useUnreadStore(
    (state: any) => state.newMessagesClients,
  );
  const [activeId, setActiveId] = useState<number>(1);
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const currentUser = useProfileStore(state => state.currentUser);
  const resetExercises = useExerciseComplete((state: any) => state.reset);
  const [isNewMessage, setIsNewMessage] = useState<boolean | undefined>(false);
  const [isNewMessageClients, setIsNewMessageClients] = useState<
    boolean | undefined
  >(false);
  const getConversations = useConversation((state) => state.getConversations);
  const conversations = useConversation((state) => state.conversations);
  const therapistClientsConversations = useConversation(
    (state) => state.therapistClientsConversations,
  );
  const getAgoraRefreshToken = useConversation(
    (state) => state.getAgoraRefreshToken,
  );
  const [isLogedIn, setIsLogedIn] = useState<boolean>(false);
  const [codeGenerationShow, setCodeGenerationShow] = useState<boolean>(false);

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
    if(activeId !== id) {
      resetExercises();
      localStorage.removeItem('selectedGroup')
      localStorage.removeItem('selectedCategory')
      localStorage.removeItem('savedScrollForHome')
      localStorage.removeItem('scrollPositionFromCare')
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${path}`);
      setActiveId(id);
    }
  };

  const onFeedback = () => {
    modalHandlers.show();
    setFeedbackShow(true);
  };

  const onAddClient = () => {
    if(currentUser?.inviteCounts < 1 || currentUser?.paidStatus === PaidStatus.Paid) {
      setCodeGenerationShow(true);
      modalHandlers.show();
    } else {
      navigate(`${PLANS_AND_BILLINGS}`);
      localStorage.setItem('toSubscription', pathname)
    }
  };

  const onPrivacyPolicy = () => {
    window.open('https://www.offloadweb.com/privacy-policy', '_blanc')
  };

  const onTermsOfUse = () => {
    window.open('https://www.offloadweb.com/terms-of-service-professionals', '_blanc')
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
    if(now > user?.agoraTokenExpiration ){
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
        console.log('Disconnected', err)
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
    <div className={styles.sidebarMain}>
      <ul className={styles.sidebarWrapper}>
        <Button
          className={styles.button}
          label={'Add Client'}
          variant={'secondary'}
          onClick={onAddClient}
        />
        {TherapistSidebarData.map((el, idx) => {
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
                  [styles.inbox]: idx === 4 || idx === 1,
                })}
              />
              <span className={styles.label}>{label}</span>
              {idx === 1 && (newMessagesClients || isNewMessageClients) && (
                <span className={styles.greenDot}></span>
              )}
              {idx === 3 && (newMessages || isNewMessage) && (
                <span className={styles.greenDot}></span>
              )}
            </li>
          );
        })}
      </ul>
      <div className={styles.burgerBottom}>
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

      {codeGenerationShow && (
        <AppModal width={389} {...modalHandlers}>
          <CodeGenerationModal
            page={'clients'}
            data={modalHandlers.metaData}
            setCodeGenerationShow={setCodeGenerationShow}
          />
        </AppModal>
      )}
    </div>
  );
};
export default TherapistSidebar;
