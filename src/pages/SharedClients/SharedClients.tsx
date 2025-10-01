import styles from './SharedClients.module.scss';
import { useEffect, useState } from 'react';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { useBook } from '@store/book.ts';
import { useConversation } from '@store/chat.ts';
import { IScheduleCard } from '@models/book.ts';
import { LoadingScreen, StartBookingModal } from '@pages/index.ts';
import { Chat } from '@widgets/index.ts';
import CodeGenerationModal from '@pages/CodeGenerationModal';
import { JonahDemoData } from '@constants/constants.ts';
import {
  PLANS_AND_BILLINGS,
  RoutesEnum,
  USER_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { PaidStatus } from '@constants/plans.ts';
import { useProfileStore } from '@store/profile.ts';
import { Helmet } from 'react-helmet';

const SharedClients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const modalHandlers = useAppModalSimpleHandlers();
  const [codeGenerationShow, setCodeGenerationShow] = useState<boolean>(false);
  const [threeModalsShow, setThreeModalsShow] = useState<boolean>(true);

  const getBookings = useBook((state) => state.getBookings);
  const bookingData = useBook((state) => state.bookingData);
  const getBookingsStatus = useBook((state) => state.getBookingsStatus);

  const getConversations = useConversation((state) => state.getConversations);
  const therapistClientsConversations = useConversation(
    (state) => state.therapistClientsConversations,
  );
  const getConversationsStatus = useConversation(
    (state) => state.getConversationsStatus,
  );

  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const currentUser = useProfileStore((state) => state.currentUser);

  const addClientHandler = (client?: any) => {
    console.log('currentUser', currentUser);
    if (user?.uuid) {
      localStorage.removeItem('fromAddClient');
      if (
        currentUser?.generalInviteCounts < 1 ||
        currentUser?.paidStatus === PaidStatus.Paid
      ) {
        setThreeModalsShow(false);
        setCodeGenerationShow(true);
        modalHandlers.show(client);
      } else {
        navigate(`${PLANS_AND_BILLINGS}`);
        localStorage.setItem('toSubscription', location.pathname);
      }
    } else {
      navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
    }
  };

  useEffect(() => {
    const from = localStorage.getItem('fromAddClient');
    if (from === 'yes') {
      addClientHandler();
    }
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
    if (user?.uuid) {
      getConversations(0, 100, 2);
    }
  }, [isMobileScreen, threeModalsShow, codeGenerationShow]);

  const onClickCard = (item: IScheduleCard) => {
    setThreeModalsShow(true);
    modalHandlers.show(item);
  };

  return (
    <>
      <Helmet>
        <title>Offload | Shared-Clients</title>
      </Helmet>
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
            page={'clients'}
            bookingsData={bookingData}
            conversations={
              user?.uuid ? therapistClientsConversations : JonahDemoData
            }
            isMobileScreen={isMobileScreen}
            onAddClick={addClientHandler}
            onClickCard={onClickCard}
          />
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

        {threeModalsShow && (
          <AppModal width={389} {...modalHandlers} disableClosingModal>
            <StartBookingModal
              setThreeModalsShow={setThreeModalsShow}
              data={modalHandlers.metaData}
            />
          </AppModal>
        )}
      </div>
    </>
  );
};
export default SharedClients;
