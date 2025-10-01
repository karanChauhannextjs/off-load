import { useEffect, useState } from 'react';

import styles from './ClientMessages.module.scss';
import { Chat } from '@widgets/index.ts';
import { ClientConnectModal, LoadingScreen } from '@pages/index.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { useConversation } from '@store/chat.ts';
import cn from "classnames";
import {useInvite} from "@store/invite.ts";

const ClientMessages = () => {
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [connectStep, setConnectStep] = useState<number>(1);
  const [code, setCode] = useState<string>('');
  const modalHandlers = useAppModalSimpleHandlers();
  const [connectShow, setConnectShow] = useState<boolean>(false);
  const [isWrongCode, setIsWrongCode] = useState<boolean>(false);
  const connectClient = useInvite(state => state.connectClient)
  const conversations = useConversation((state) => state.conversations);
  const getConversations = useConversation((state) => state.getConversations);
  const getConversationsStatus = useConversation(
    (state) => state.getConversationsStatus,
  );
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const onConnectHandler = () => {
    setConnectShow(true);
    modalHandlers.show();
  };

  const onNextHandler = async () => {
    if(code) {
      setIsWrongCode(false)
      try {
        if (connectStep === 1) {
          const result = await connectClient({code});
          if (result.status) {
            setConnectStep((prev) => prev + 1);
            localStorage.setItem('invitedTherapistEmail', result.result
            )
            localStorage.setItem('connectedFromChat', 'true')
          }
        }if(connectStep === 2){
          setConnectStep((prev) => prev + 1);
        }
        if (connectStep === 3) {
          setConnectStep(1);
          setConnectShow(false);
          setIsWrongCode(false)
          modalHandlers.close();
          getConversations(0, 100);
        }
      } catch (err) {
        setIsWrongCode(true)
      }
    }
  };

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

  useEffect(() => {
    getConversations(0, 100);
  }, [isMobileScreen]);

  // useEffect(() => {
  //   setIsWrongCode(false)
  // }, [modalHandlers]);

  return (
    <div className={styles.pageWrapper}>
      {getConversationsStatus === 'LOADING' ? (
        <LoadingScreen />
      ) : (
        <Chat
          onConnectClick={onConnectHandler}
          conversations={conversations}
          isMobileScreen={isMobileScreen}
          user={user}
        />
      )}
      {connectShow && (
        <AppModal
          width={isMobileScreen ? '100%' : 389}
          {...modalHandlers}
          withBorder={!isMobileScreen}
          closeIcon={connectStep === 1}
          disableClosingModal={connectStep > 1}
          className={cn({[styles.connectModalStep2]:connectStep > 1})}
        >
          <ClientConnectModal
            step={connectStep}
            isWrongCode={isWrongCode}
            onNext={onNextHandler}
            setCode={setCode}
          />
        </AppModal>
      )}
    </div>
  );
};
export default ClientMessages;
