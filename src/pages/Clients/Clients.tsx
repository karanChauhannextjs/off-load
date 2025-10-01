import { useEffect, useState } from 'react';

import styles from './Clients.module.scss';
import { Chat } from '@widgets/index.ts';
import { useBook } from '@store/book.ts';
import { LoadingScreen, StartBookingModal } from '@pages/index.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { IScheduleCard } from '@models/book.ts';
import { useConversation } from '@store/chat.ts';
import CodeGenerationModal from '@pages/CodeGenerationModal';
import cn from 'classnames';
import { PaidStatus } from '@constants/plans.ts';
import { useProfileStore } from '@store/profile.ts';
import { PLANS_AND_BILLINGS } from '@routes/Routes.types.ts';
import { useLocation, useNavigate } from 'react-router-dom';

const Clients = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const modalHandlers = useAppModalSimpleHandlers();
  const [codeGenerationShow, setCodeGenerationShow] = useState<boolean>(false);
  const [threeModalsShow, setThreeModalsShow] = useState<boolean>(true);

  const getBookings = useBook((state) => state.getBookings);
  const bookingData = useBook((state) => state.bookingData);
  const getBookingsStatus = useBook((state) => state.getBookingsStatus);

  const conversations = useConversation((state) => state.conversations);
  const getConversations = useConversation((state) => state.getConversations);
  const getConversationsStatus = useConversation(
    (state) => state.getConversationsStatus,
  );

  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const currentUser = useProfileStore((state) => state.currentUser);

  const addClientHandler = (client?: any) => {
    if (client) {
      if (
        currentUser?.generalInviteCounts < 1 ||
        currentUser?.paidStatus === PaidStatus.Paid
      ) {
        setThreeModalsShow(false);
        setCodeGenerationShow(true);
        modalHandlers.show(client);
      } else {
        navigate(`${PLANS_AND_BILLINGS}`);
        localStorage.setItem('toSubscription', location.pathname)
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
    getBookings();
  }, [isMobileScreen, threeModalsShow]);

  useEffect(() => {
    getConversations(0, 100, 1);
  }, [isMobileScreen, threeModalsShow, codeGenerationShow]);

  const onClickCard = (item: IScheduleCard) => {
    setThreeModalsShow(true);
    modalHandlers.show(item);
  };

  return (
    <div
      className={cn(styles.pageWrapper, {
        [styles.pageWrapperWithUpgradeBanner]:
          !user?.isSubscribed || user?.paidStatus !== PaidStatus.Paid,
      })}
    >
      {getBookingsStatus === 'LOADING' ||
      getConversationsStatus === 'LOADING' ? (
        <LoadingScreen />
      ) : (
        <Chat
          user={user}
          page={'inbox'}
          bookingsData={bookingData}
          conversations={conversations}
          isMobileScreen={isMobileScreen}
          onAddClick={addClientHandler}
          onClickCard={onClickCard}
        />
      )}

      {codeGenerationShow && (
        <AppModal width={389} {...modalHandlers}>
          <CodeGenerationModal
            page={'inbox'}
            data={modalHandlers.metaData}
            setCodeGenerationShow={setCodeGenerationShow}
          />
        </AppModal>
      )}

      {threeModalsShow && (
        <AppModal width={389} {...modalHandlers} disableClosingModal>
          <StartBookingModal
            setThreeModalsShow={setThreeModalsShow}
            data={modalHandlers.metaData}
          />
        </AppModal>
      )}
    </div>
  );
};
export default Clients;
