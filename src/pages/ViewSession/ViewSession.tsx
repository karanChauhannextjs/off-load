import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './ViewSession.module.scss';
import { Avatar, Badge } from '@shared/ui';
import { IBookData } from '@models/book.ts';
import { BookingCard } from '@widgets/index.ts';
import { useProfileStore } from '@store/profile.ts';
import { ISocialLinks } from '@pages/MyPage/MyPage.tsx';
import { BookingModal, LoadingScreen, ReportModal } from '@pages/index.ts';
import { formattedHours, formattedWeekdays } from '@constants/daysAndTime.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import {
  combineDateTime,
  formatLink,
  getTimezoneDifferenceInSeconds,
} from '@utils/helpers.ts';
import toast from 'react-hot-toast';
import {
  CLIENT_PRIVATE_BASE_URL,
  USER_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import {USER_TYPES} from "@constants/user.ts";

const ViewSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const popupRef = useRef(null);
  const modalHandlers = useAppModalSimpleHandlers();
  const [reportShow, setReportShow] = useState<boolean>(false);
  const [bookModalShow, setBookModalShow] = useState<boolean>(false);
  const [popupShow, setPopupShow] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(
    window.innerWidth <= 768,
  );
  const [socialLinks, setSocialLinks] = useState<ISocialLinks[]>([]);
  const therapistData = useProfileStore((state) => state.therapistData);
  const getTherapist = useProfileStore((state) => state.getTherapist);
  const getTherapistDataStatus = useProfileStore(
    (state) => state.getTherapistDataStatus,
  );

  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const username = location.pathname.split('/')[1];
  const bookingData = JSON.parse(localStorage.getItem('bookingData') ?? '{}');
  const fromClientSignup = localStorage.getItem('clientSignup');

  const onDotsHandler = () => {
    setPopupShow(true);
  };

  const reportModalHandler = (e: any) => {
    e.stopPropagation();
    setPopupShow(false);
    setBookModalShow(false);
    setReportShow(true);
    modalHandlers.show();
  };

  const onMessageHandler = () => {
    if (user?.type === USER_TYPES.CLIENT) {
      navigate(`${CLIENT_PRIVATE_BASE_URL}/client-messages`, {
        state: {
          from: 'viewMessage',
          id: Date.now(),
          client: user,
          therapist: therapistData,
        },
      });
    } else if (user?.type === USER_TYPES.THERAPIST && user?.email === therapistData?.email) {
      toast.error("You can't send a message to yourself");
    } else if (user?.type === USER_TYPES.THERAPIST && user?.email !== therapistData?.email) {
      toast.error(
        "You can't send a message to another therapist. Please log in as a client.",
      );
    } else {
      localStorage.setItem('from', 'viewSession');
      localStorage.setItem('username', username);
      localStorage.setItem(
        'newChatItem',
        JSON.stringify({
          from: 'viewMessage',
          id: Date.now(),
          client: user,
          therapist: therapistData,
        }),
      );
      navigate(`${USER_PUBLIC_BASE_URL}/client-sign-up`);
    }
  };

  const onClickBook = async (data: IBookData) => {
    const sessionType = data.duration ? 'session' : 'consultation';
    if (sessionType === 'session' && !therapistData?.stripeAccountId) {
      toast.error("This therapist isn't connected to Stripe");
    } else if (user?.type === USER_TYPES.THERAPIST && user?.email === therapistData?.email) {
      toast.error("You can't make a booking with yourself.", {
        duration: 3000,
      });
    } else if (user?.type === USER_TYPES.THERAPIST && user?.email !== therapistData?.email) {
      toast.error(
        `You can\'t book a ${sessionType} as a therapist. Please log in as a client.`,
      );
    } else {
      const day = formattedWeekdays.find((e) => e.id === data?.day);
      const time = formattedHours.find(
        (e: { id: number; label: string }) => e.id === data?.time,
      );
      const dateString = combineDateTime(day, time);
      const date = new Date(dateString);
      // Get the time in milliseconds since January 1, 1970, 00:00:00 UTC
      const milliseconds = date.getTime();

      const body = {
        email: user?.email ? user.email : '',
        name: user?.name ? user?.name : '',
        note: '',
        type: data.duration ? data.duration : 3,
        date:
          Math.floor(milliseconds / 1000) - getTimezoneDifferenceInSeconds(),
        isVideoCall: data.type === 'VIDEO_CALL',
        isInPerson: data.type === 'IN_PERSON',
        isVoiceCall: data.type === 'VOICE_CALL',
        isLiveText: data.type === 'LIVE_TEXT',
        therapistUuid: therapistData.uuid,
      };
      // (!user?.uuid && data.type === 'LIVE_TEXT')
      if (!user?.uuid) {
        const bookingData = {
          therapistData: therapistData,
          bookData: data,
          body: body,
        };
        localStorage.setItem('bookingData', JSON.stringify(bookingData));
        localStorage.setItem('from', 'viewSession');
        localStorage.setItem('username', username);
        navigate(`/auth/client-sign-up`);
      } else {
        setReportShow(false);
        setBookModalShow(true);
        modalHandlers.show({
          therapistData: therapistData,
          bookData: data,
          body: body,
        });
      }
    }
  };

  useEffect(() => {
    setSocialLinks([
      {
        id: 1,
        icon: 'linkedin',
        isActive: therapistData?.isLinkedinLinkActive,
        link: therapistData?.linkedinLink,
      },
      {
        id: 2,
        icon: 'instagram',
        isActive: therapistData?.isInstagramLinkActive,
        link: therapistData?.instagramLink,
      },
      {
        id: 3,
        icon: 'twitter',
        isActive: therapistData?.isTwitterLinkActive,
        link: therapistData?.twitterLink,
      },
      {
        id: 4,
        icon: 'tiktok',
        isActive: therapistData?.isTiktokLinkActive,
        link: therapistData?.tiktokLink,
      },
    ]);
  }, [therapistData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!bookModalShow) {
      getTherapist(username);
    }
  }, [bookModalShow]);

  useEffect(() => {
    if (getTherapistDataStatus === 'FAIL') {
      navigate('/');
    }
  }, [getTherapistDataStatus]);

  useEffect(() => {
    if (bookingData && !!bookingData?.body && !fromClientSignup) {
      setBookModalShow(true);
      modalHandlers.show({
        therapistData: bookingData?.therapistData,
        bookData: bookingData?.bookData,
        body: { ...bookingData?.body, email: user?.email, name: user?.name },
      });
      localStorage.removeItem('from')
      localStorage.removeItem('username')
      localStorage.removeItem('bookingData')
      localStorage.removeItem('fromClientSignup')
    }
  }, [bookingData, location, fromClientSignup]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // @ts-ignore
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setPopupShow]);

  return (
    <>
      {getTherapistDataStatus === 'LOADING' ? (
        <LoadingScreen />
      ) : (
        <div className={styles.wrapper}>
          {isMobileScreen ? (
            <div className={styles.mobInfoWrapper}>
              <div className={styles.nameRow}>
                {therapistData?.name && (
                  <span className={styles.mobileName}>
                    {therapistData.name}
                  </span>
                )}
                <div className={styles.mobileShareWrapper}>
                  <div className={styles.dotsIcon} onClick={onDotsHandler}>
                    {popupShow && (
                      <span
                        ref={popupRef}
                        className={styles.reportPopup}
                        onClick={reportModalHandler}
                      >
                        Report
                      </span>
                    )}
                    <i className={cn('icon-dots')} />
                  </div>
                </div>
              </div>
              <Avatar photoUrl={therapistData?.image} />
              <div className={styles.infoBlock}>
                {therapistData?.username && (
                  <span className={styles.username}>
                    @{therapistData.username}
                  </span>
                )}
                <div className={styles.mediasWrapper}>
                  <Badge
                    id={socialLinks.length + 1}
                    className={cn(styles.badge, styles.messageBadge)}
                    label={'Message'}
                    onClick={onMessageHandler}
                  />
                  {socialLinks?.map((item) => {
                    const { icon, isActive, link } = item;
                    if (isActive) {
                      return (
                        <a
                          key={item.id}
                          href={formatLink(link)}
                          target={'_blank'}
                          className={styles.socialLink}
                        >
                          <Badge
                            id={item.id}
                            key={icon}
                            className={styles.badge}
                            icon={icon}
                          />
                        </a>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.infoWrapper}>
              <Avatar photoUrl={therapistData?.image} />
              <div className={styles.infoBlock}>
                {therapistData?.name && (
                  <span className={styles.name}>{therapistData.name}</span>
                )}
                {therapistData?.username && (
                  <span>@{therapistData.username}</span>
                )}
                <div className={styles.mediasWrapper}>
                  <Badge
                    id={socialLinks.length + 1}
                    className={cn(styles.badge, styles.messageBadge)}
                    label={'Message'}
                    onClick={onMessageHandler}
                  />
                  {socialLinks?.map((item) => {
                    const { icon, isActive, link } = item;
                    if (isActive) {
                      return (
                        <a
                          key={item.id}
                          href={formatLink(link)}
                          target={'_blank'}
                          className={styles.socialLink}
                        >
                          <Badge
                            id={item.id}
                            key={icon}
                            className={styles.badge}
                            icon={icon}
                          />
                        </a>
                      );
                    }
                  })}
                </div>
              </div>
              <div className={styles.shareWrapper}>
                <div className={styles.dotsIcon} onClick={onDotsHandler}>
                  {popupShow && (
                    <span
                      ref={popupRef}
                      className={styles.reportPopup}
                      onClick={reportModalHandler}
                    >
                      Report
                    </span>
                  )}
                  <i className={cn('icon-dots')} />
                </div>
              </div>
            </div>
          )}
          <div className={styles.bioBlock}>
            {therapistData?.profession && (
              <span className={styles.label}>{therapistData.profession}</span>
            )}
            {therapistData?.location && (
              <span className={styles.location}>{therapistData.location}</span>
            )}
          </div>
          {therapistData?.userSessions?.[0]?.showActive && (
            <BookingCard
              show
              type={'session'}
              username={username}
              onClickBook={onClickBook}
              data={therapistData.userSessions}
            />
          )}

          {bookModalShow && (
            <AppModal width={389} {...modalHandlers} disableClosingModal>
              <BookingModal
                data={modalHandlers.metaData}
                setBookModalShow={setBookModalShow}
              />
            </AppModal>
          )}

          {reportShow && (
            <AppModal width={389} {...modalHandlers}>
              <ReportModal setReportShow={setReportShow} />
            </AppModal>
          )}
        </div>
      )}
    </>
  );
};
export default ViewSession;
