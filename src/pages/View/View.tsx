import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './View.module.scss';
import { Avatar, Badge } from '@shared/ui';
import { IBookData } from '@models/book.ts';
import { BookingCard } from '@widgets/index.ts';
import { GallarySlider } from '@features/index.ts';
import { useProfileStore } from '@store/profile.ts';
import { ISocialLinks } from '@pages/MyPage/MyPage.tsx';
import { formattedHours, formattedWeekdays } from '@constants/daysAndTime.ts';
import {
  BookingModal,
  LoadingScreen,
  ReportModal,
  // ShareModal,
} from '@pages/index.ts';
import {
  combineDateTime, currentBaseUrl,
  formatLink,
  getTimezoneDifferenceInSeconds,
} from '@utils/helpers.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import toast from 'react-hot-toast';
import {
  CLIENT_PRIVATE_BASE_URL,
  USER_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import {USER_TYPES} from "@constants/user.ts";

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const popupRef = useRef(null);
  const modalHandlers = useAppModalSimpleHandlers();
  const therapistData = useProfileStore((state) => state.therapistData);
  const getTherapist = useProfileStore((state) => state.getTherapist);
  const getTherapistDataStatus = useProfileStore(
    (state) => state.getTherapistDataStatus,
  );
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(
    window.innerWidth <= 1200,
  );
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(
    window.innerWidth <= 768,
  );
  const [socialLinks, setSocialLinks] = useState<ISocialLinks[]>([]);
  const [videoShow, setVideoShow] = useState<boolean>(false);
  // const [shareShow, setShareShow] = useState<boolean>(false);
  const [reportShow, setReportShow] = useState<boolean>(false);
  const [bookModalShow, setBookModalShow] = useState<boolean>(false);
  const [show, setShow] = useState({
    session: false,
    consultation: true,
  });
  const [popupShow, setPopupShow] = useState<boolean>(false);

  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const username = location.pathname.split('/')?.[1];
  const bookingData = JSON.parse(localStorage.getItem('bookingData') ?? '{}');
  const fromClientSignup = localStorage.getItem('clientSignup');

  const onShareHandler = () => {
    if (isMobileScreen) {
      const shareData = {
        title: 'Offload',
        text: '',
        url: `${currentBaseUrl}/${username}`,
      };
      if (navigator.share) {
        try {
          navigator.share(shareData);
        } catch (error: any) {
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(`${currentBaseUrl}/${username}`);
      toast.success('URL copied');
    }

    setBookModalShow(false);
    setReportShow(false);
    setVideoShow(false);
    // setShareShow(true);
    // modalHandlers.show();
  };

  const onDotsHandler = () => {
    setPopupShow(true);
  };

  const reportModalHandler = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    setPopupShow(false);
    setBookModalShow(false);
    // setShareShow(false);
    setVideoShow(false);
    setReportShow(true);
    modalHandlers.show();
  };

  const onPlayVideo = () => {
    setBookModalShow(false);
    setReportShow(false);
    setVideoShow(true);
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
      localStorage.setItem('from', 'view');
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

  const onChangeRadio = () => {
    setShow({
      session: show.session,
      consultation: show.consultation,
    });
  };

  const onClickBookingCard = () => {
    setShow({
      session: !show.session,
      consultation: !show.consultation,
    });
  };

  const onClickBook = async (data: IBookData) => {
    const sessionType = data.duration ? 'session' : 'consultation';
    if (sessionType === 'session' && !therapistData?.stripeAccountId) {
      toast.error("This therapist isn't connected to Stripe");
    } else if (user?.type === USER_TYPES.THERAPIST && user?.email === therapistData?.email) {
      toast.error("You can't make a booking with yourself.");
    } else if (user?.type === USER_TYPES.THERAPIST && user?.email !== therapistData?.email) {
      toast.error(
        `You can\'t book a ${sessionType} as a therapist. Please log in as a client.`,
      );
    } else {
      const day = formattedWeekdays.find((e) => e.id === data?.day);
      const time = formattedHours.find(
        (e: { id: number; label: string }) => e.id === data?.time,
      );
      // Combine date and time into a single Date object
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
        localStorage.setItem('from', 'view');
        localStorage.setItem('username', username);
        navigate(`/auth/client-sign-up`);
      } else {
        // setShareShow(false);
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
    if (
      !therapistData?.userSessions?.[0]?.showActive &&
      therapistData?.userSessions?.[2]?.showActive
    ) {
      setShow({
        session: false,
        consultation: true,
      });
    }
  }, [therapistData]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1200);
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (bookingData && !!bookingData?.body && !fromClientSignup) {
      setBookModalShow(true);
      modalHandlers.show({
        therapistData: bookingData?.therapistData,
        bookData: bookingData?.bookData,
        body: { ...bookingData?.body, email: user?.email, name: user?.name },
      });
      localStorage.removeItem('from');
      localStorage.removeItem('username');
      localStorage.removeItem('bookingData');
      localStorage.removeItem('fromClientSignup');
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
    <div className={styles.wrapper}>
      {getTherapistDataStatus === 'LOADING' ? (
        <LoadingScreen />
      ) : (
        <div className={styles.main}>
          <div className={styles.leftWrapper}>
            {isMobileScreen ? (
              <div className={styles.mobInfoWrapper}>
                <div className={styles.nameRow}>
                  {therapistData?.name && (
                    <span className={styles.mobileName}>
                      {therapistData.name}
                    </span>
                  )}
                  <div className={styles.mobileShareWrapper}>
                    <i
                      className={cn('icon-share', styles.shareIcon)}
                      onClick={onShareHandler}
                    />
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
            ) : (
              <div className={styles.infoWrapper}>
                <Avatar photoUrl={therapistData?.image} />
                <div className={styles.infoBlock}>
                  <div className={styles.shareWrapper}>
                    <i
                      className={cn('icon-share', styles.shareIcon)}
                      onClick={onShareHandler}
                    />
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
              </div>
            )}
            <div className={styles.bioBlock}>
              {therapistData?.profession && (
                <span className={styles.label}>{therapistData.profession}</span>
              )}
              {therapistData?.location && (
                <span className={styles.location}>
                  {therapistData.location}
                </span>
              )}
              {therapistData?.shortBio && (
                <span className={cn(styles.label, styles.shortBio)}>
                  {therapistData.shortBio}
                </span>
              )}
            </div>
            <div className={styles.specialitiesBlock}>
              {therapistData?.specialities?.map((spec) => {
                return (
                  <Badge
                    className={styles.badgeSpec}
                    key={spec?.uuid}
                    id={spec?.id}
                    label={spec?.name}
                  />
                );
              })}
              {therapistData?.customSpecialities?.map((spec) => {
                if (spec.isSelected) {
                  return (
                    <Badge
                      className={styles.badgeSpec}
                      key={spec?.id}
                      id={spec?.id}
                      label={spec?.name}
                    />
                  );
                }
              })}
            </div>

            {isSmallScreen && (
              <div className={styles.rightWrapper}>
                {therapistData?.userSessions?.[2]?.showActive && (
                  <BookingCard
                    username={username}
                    type={'consultation'}
                    onChangeRadio={onChangeRadio}
                    onClickCard={onClickBookingCard}
                    show={show.consultation}
                    onClickBook={onClickBook}
                    data={therapistData.userSessions}
                  />
                )}
                {therapistData?.userSessions?.[0]?.showActive && (
                  <BookingCard
                    username={username}
                    type={'session'}
                    onChangeRadio={onChangeRadio}
                    onClickCard={onClickBookingCard}
                    show={show.session}
                    onClickBook={onClickBook}
                    data={therapistData.userSessions}
                  />
                )}
              </div>
            )}

            {(!!therapistData?.userImages?.length ||
              !!therapistData?.userVideos?.length) && (
              <GallarySlider
                className={styles.gallery}
                images={therapistData?.userImages}
                video={therapistData?.userVideos}
                onPlayVideo={onPlayVideo}
              />
            )}

            {therapistData?.fullBio && (
              <div className={styles.block}>
                <span className={styles.subtitle}>Biography</span>
                <span className={styles.labelBio}>{therapistData.fullBio}</span>
              </div>
            )}
            {therapistData?.educations &&
              therapistData?.educations?.some((e) => e?.name) && (
                <div className={styles.block}>
                  <span className={styles.subtitle}>
                    Education & Accreditations
                  </span>
                  <ul className={styles.list}>
                    {therapistData.educations.map((item) => {
                      if (item?.name) {
                        return (
                          <li key={item.id} className={styles.label2}>
                            {item?.name}
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
              )}
            {therapistData?.memberships &&
              therapistData?.memberships?.some((e) => e?.name) && (
                <div className={styles.block}>
                  <span className={styles.subtitle}>Memberships</span>
                  <ul className={styles.list}>
                    {therapistData?.memberships?.map((item) => {
                      if (item?.name) {
                        return (
                          <li key={item.id} className={styles.label2}>
                            {item?.name}
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
              )}
          </div>
          {!isSmallScreen && (
            <div className={styles.rightWrapper}>
              {therapistData?.userSessions?.[2]?.showActive && (
                <BookingCard
                  username={username}
                  onChangeRadio={onChangeRadio}
                  onClickCard={onClickBookingCard}
                  show={show.consultation}
                  onClickBook={onClickBook}
                  data={therapistData.userSessions}
                  type={'consultation'}
                />
              )}
              {therapistData?.userSessions?.[0]?.showActive && (
                <BookingCard
                  username={username}
                  type={'session'}
                  onChangeRadio={onChangeRadio}
                  onClickCard={onClickBookingCard}
                  show={show.session}
                  onClickBook={onClickBook}
                  data={therapistData.userSessions}
                />
              )}
            </div>
          )}

          {bookModalShow && (
            <AppModal width={389} {...modalHandlers} disableClosingModal>
              <BookingModal
                data={modalHandlers.metaData}
                setBookModalShow={setBookModalShow}
              />
            </AppModal>
          )}

          {/*{shareShow && (*/}
          {/*  <AppModal width={389} {...modalHandlers}>*/}
          {/*    <ShareModal*/}
          {/*      setShareShow={setShareShow}*/}
          {/*      link={therapistData.username}*/}
          {/*    />*/}
          {/*  </AppModal>*/}
          {/*)}*/}

          {reportShow && (
            <AppModal width={389} {...modalHandlers}>
              <ReportModal setReportShow={setReportShow} />
            </AppModal>
          )}

          {videoShow && !isMobileScreen && (
            <AppModal
              withBorder={false}
              width={'100%'}
              {...modalHandlers}
              className={styles.videoModal}
            >
              <video controls autoPlay className={styles.video}>
                <source src={therapistData?.userVideos?.[0]?.video} type="video/mp4"/>
                Your browser does not support the video tag.
              </video>
            </AppModal>
            )}
        </div>
      )}
    </div>
  );
};
export default View;
