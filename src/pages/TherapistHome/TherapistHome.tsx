import { useEffect, useRef, useState } from 'react';
import styles from './TherapistHome.module.scss';
import Banner from '@features/Banner';
import { LoadingScreen, ShareModal } from '@pages/index.ts';
import { Navbar } from '@features/index.ts';
import cn from 'classnames';
import Refer from '@assets/svg/refer.svg';
import Activity1 from '@assets/svg/activity1.svg';
import Mood3 from '@assets/svg/mood3Demo.svg';
import checkin1 from '../../assets/svg/mood1_2.svg';
import checkin2 from '../../assets/svg/mood2_2.svg';
import checkin3 from '../../assets/svg/mood3_2.svg';
import checkin4 from '../../assets/svg/mood4_2.svg';
import checkin5 from '../../assets/svg/mood5_2.svg';

import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { useProfileStore } from '@store/profile.ts';
import {
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
  VIEW_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDays, isBefore, parseISO } from 'date-fns';
import {
  FeelingStates,
  therapistActivityDemo,
  therapistBookingsDemo,
} from '@constants/constants.ts';
import {
  formatTimeDifference,
  getInitialsLetters,
  getTypeCall,
  modifyWord,
  upcomingSessionsReader,
} from '@utils/helpers.ts';
import { useBook } from '@store/book.ts';
import { getTherapistActivity } from '@api/activity.ts';
import { Actions } from '@pages/TherapistHome/TherapistHome.constants.ts';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PaidStatus } from '@constants/plans.ts';
import toast from 'react-hot-toast';

const TherapistHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const currentUser = useProfileStore((state) => state.currentUser);
  const modalHandlers = useAppModalSimpleHandlers();
  const [shareShow, setShareShow] = useState<boolean>(false);
  const [showNavbar, setShowNavbar] = useState<boolean>(false);
  const [isShowAllActivity, setIsShowAllActivity] = useState<boolean>(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollPositionRemembered, setScrollPositionRemembered] = useState(0);
  const getProfile = useProfileStore((state) => state.getProfile);
  const getProfilesStatus = useProfileStore((state) => state.getProfilesStatus);
  const profile = useProfileStore((state) => state.profile);
  const getBookings = useBook((state) => state.getBookings);
  const getBookingsStatus = useBook((state) => state.getBookingsStatus);
  const bookingData = useBook((state) => state.bookingData);
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [activityData, setActivityData] = useState<any>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;
  const widgetDemoArray = [1, 2];
  const images: { [key: number]: string } = {
    1: checkin1,
    2: checkin2,
    3: checkin3,
    4: checkin4,
    5: checkin5,
  };

  const onViewHandler = () => {
    window.open(`${VIEW_PUBLIC_BASE_URL}${profile.username}`, '_blank');
  };

  const onShareHandler = () => {
    setShareShow(true);
    modalHandlers.show();
  };

  const navbarItemHandler = (id: number, path: string) => {
    if (id === 1) {
      localStorage.setItem('fromAddClient', 'yes');
    }
    navigate(`${THERAPIST_PRIVATE_BASE_URL}/${path}`);
  };

  const activityItemClick = (type?: string) => {
    if (type === 'book') {
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.SCHEDULE}`);
    }
  };

  const activityItemClickRealData = (activity: any) => {
    if (
      activity.action === Actions.Feeling ||
      activity.action === Actions.CompleteExercise ||
      activity.action === Actions.ClientConnect
    ) {
      if (
        activity.isFirstInvited ||
        (currentUser.paidStatus === PaidStatus.Paid && currentUser.isSubscribed)
      ) {
        localStorage.setItem('fromActivityEmail', activity?.client?.email);
        navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.CLIENTS}`);
      } else {
        toast.success('Please activate a plan to view clients');
      }
    } else if (
      activity.action === Actions.BookingCreated ||
      activity.action === Actions.BookingCanceled ||
      activity.action === Actions.BookingUpdated
    ) {
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.SCHEDULE}`);
    }
  };

  const activityDemoFeedExe = () => {
    localStorage.setItem('fromActivityEmail', 'jonahdemo@gmail.com');
    navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.CLIENTS}`);
  };

  const onBookClick = () => {
    navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.SCHEDULE}`);
  };

  const onSeeActivity = () => {
    setIsShowAllActivity(true);
    navigate(`${location.pathname}#selected_activity`);
    setScrollPositionRemembered(scrollPosition);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const onBack = async () => {
    setIsShowAllActivity(false);
    window.location.hash = '';
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    setTimeout(() => {
      wrapper.scrollTo({
        top: Number(scrollPositionRemembered),
        behavior: 'smooth',
      });
    }, 100);
  };

  const fetchActivityData = async () => {
    try {
      const from = page * PAGE_SIZE;
      const response = await getTherapistActivity(from, PAGE_SIZE);
      const newData = response.data;
      setActivityData((prev: any) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
      if (newData.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!isShowAllActivity) {
      window.location.hash = '';
    }
    const main = document.getElementById('therapistMain');
    if (main) {
      if (
        window.innerWidth > 768 &&
        location.pathname.includes('therapist-home')
      ) {
        main.style.padding = '32px 0 0 185px';
      } else {
        main.style.padding = '0 !important';
      }
      return () => {
        main.style.padding = '32px 0 0 230px';
      };
    }
  }, [isShowAllActivity, location]);

  useEffect(() => {
    const body = document.getElementById('body');
    if (body) {
      if (window.innerWidth > 768) {
        body.style.overflowY = 'hidden';
      } else {
        body.style.overflowY = 'auto';
      }
      return () => {
        body.style.overflowY = 'auto';
      };
    }
  }, []);

  useEffect(() => {
    getProfile();
    getBookings();
    fetchActivityData();

    const element = document.getElementById('therapistLayoutContainer');
    if (element) {
      if (window.innerWidth > 768) {
        element.style.padding = '18px 0 0 38px';
      } else {
        element.style.padding = '8px 0 0 0px';
      }
      return () => {
        if (window.innerWidth > 768) {
          element.style.padding = '18px 0 0 38px';
        } else {
          element.style.padding = '8px 20px';
        }
      };
    }

    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleScroll = () => {
      setScrollPosition(wrapper.scrollTop);
    };

    wrapper.addEventListener('scroll', handleScroll);

    return () => {
      wrapper.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!profile?.createdAt) {
      return;
    }
    let parsedDate: any;
    try {
      parsedDate = parseISO(profile?.createdAt);
    } catch (error) {
      return;
    }
    if (!parsedDate || isNaN(parsedDate)) {
      return;
    }
    const currentDate = new Date();
    const targetDate = addDays(parsedDate, 14); // Calculate the date 14 days from createdAt
    setShowNavbar(isBefore(currentDate, targetDate));
  }, [profile]);

  useEffect(() => {
    if (!location.hash.includes('selected_activity')) {
      setIsShowAllActivity(false);
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      setTimeout(() => {
        wrapper.scrollTo({
          top: Number(scrollPositionRemembered),
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [location]);

  const sorted = bookingData?.sort((a: any, b: any) => {
    return b.date - a.date;
  });
  const lastUpcomingSession = upcomingSessionsReader(sorted).at(-1);
  const visibleSessions = lastUpcomingSession
    ? [lastUpcomingSession]
    : sorted?.slice(0, 2);

  return (
    <div
      className={cn(styles.wrapper, {
        [styles.wrapperAllActivitis]: isShowAllActivity,
        [styles.wrapperWithUpgradeBanner]:
          !user?.isSubscribed || user?.paidStatus !== PaidStatus.Paid,
      })}
      ref={wrapperRef}
    >
      {isMobileScreen && (
        <>
          <span
            className={cn(styles.mobileTitle, {
              [styles.mobiletitleAllActivity]: isShowAllActivity,
            })}
          >
            Home
          </span>
          <div className={styles.line}></div>
        </>
      )}
      {!isShowAllActivity && (
        <div className={styles.topBannerWrapper}>
          <Banner
            className={styles.banner}
            firstLabel={'Your page:'}
            secondLabel={`stage.offloadweb.com/${profile?.username || ''}`}
            firstButtonLabel={'View'}
            firstButtonIcon={'redirect'}
            secondButtonLabel={'Share'}
            secondButtonIcon={'share'}
            handlerFirstButton={onViewHandler}
            handlerSecondButton={onShareHandler}
          />
          <div className={styles.referWrapper}>
            <img src={Refer} alt="img" />
            <span className={styles.referLabel}>Refer</span>
            <span className={styles.referSecondLabel}>Coming Soon</span>
          </div>
        </div>
      )}
      {getProfilesStatus === 'LOADING' ? (
        <LoadingScreen />
      ) : (
        <>
          {!isShowAllActivity ? (
            <div className={styles.mainBody}>
              <div
                className={cn(styles.navbarWrapper, {
                  [styles.whitenavBar]: !showNavbar,
                })}
              >
                <span className={styles.navbarTitle}>
                  {showNavbar ? 'Get Started' : 'Quick links'}
                </span>
                <Navbar
                  onClickItem={navbarItemHandler}
                  isOldAccount={!showNavbar}
                />
              </div>

              <div className={styles.activityWrapper}>
                <span className={styles.title}>Activity</span>
                {!activityData.length && (
                  <>
                    <div
                      className={styles.activityRow}
                      onClick={activityDemoFeedExe}
                    >
                      <div className={styles.avatarWrapper}>
                        <span className={styles.avatarLabel}>JD</span>
                      </div>
                      <div className={styles.nameLabelWrapper}>
                        <span className={styles.name}>Jonah Demo</span>
                        <span className={styles.label}>
                          completed Cognitive Distortions
                        </span>
                      </div>
                      <span className={styles.date}>3h</span>
                      <img src={Activity1} alt="img" />
                    </div>
                    <div
                      className={styles.activityRow}
                      onClick={activityDemoFeedExe}
                    >
                      <div className={styles.avatarWrapper}>
                        <span className={styles.avatarLabel}>JD</span>
                      </div>
                      <div className={styles.nameLabelWrapper}>
                        <span className={styles.name}>Jonah Demo</span>
                        <span className={styles.label}>was feeling okay</span>
                      </div>
                      <span className={styles.date}>3d</span>
                      <img className={styles.moodImg} src={Mood3} alt="img" />
                    </div>
                    {therapistActivityDemo.map((e) => {
                      return (
                        <div
                          key={e.id}
                          className={styles.activityRow}
                          onClick={() => {
                            activityItemClick('book');
                          }}
                        >
                          <div className={styles.avatarWrapper}>
                            <span className={styles.avatarLabel}>
                              {getInitialsLetters(e.name)}
                            </span>
                          </div>
                          <div className={styles.nameLabelWrapper}>
                            <span className={styles.name}>{e.name}</span>
                            <span className={styles.label}>{e.label}</span>
                          </div>
                          <span className={styles.date}>{e.date}</span>
                          <i
                            className={cn('icon-right-arrow', styles.iconArrow)}
                          ></i>
                        </div>
                      );
                    })}
                  </>
                )}
                {!!activityData.length && (
                  <>
                    {activityData.slice(0, 8).map((e: any) => {
                      return (
                        <div
                          key={e.id}
                          className={styles.activityRow}
                          onClick={() => {
                            activityItemClickRealData(e);
                          }}
                        >
                          <div className={styles.avatarWrapper}>
                            <span className={styles.avatarLabel}>
                              {getInitialsLetters(e?.client?.name)}
                            </span>
                          </div>
                          <div className={styles.nameLabelWrapper}>
                            <span className={styles.name}>
                              {e?.client?.name}
                            </span>
                            {e.action === Actions.Feeling && (
                              <span className={styles.label}>
                                {' '}
                                was{' '}
                                <span className={styles.lowercase}>
                                  {FeelingStates[e.feeling.feeling - 1]}
                                </span>
                              </span>
                            )}
                            {e.action === Actions.CompleteExercise && (
                              <span className={styles.label}>
                                {' '}
                                completed {e.exercise.name}
                              </span>
                            )}
                            {e.action === Actions.BookingCreated && (
                              <span className={styles.label}>
                                {' '}
                                booked a{' '}
                                {e.booking.type === 3
                                  ? 'consultation'
                                  : 'session'}{' '}
                                with you
                              </span>
                            )}
                            {e.action === Actions.BookingUpdated && (
                              <span className={styles.label}>
                                {' '}
                                modified a{' '}
                                {e.booking.type === 3
                                  ? 'consultation'
                                  : 'session'}{' '}
                                with you
                              </span>
                            )}
                            {e.action === Actions.BookingCanceled && (
                              <span className={styles.label}>
                                {' '}
                                cancelled a{' '}
                                {e.booking.type === 3
                                  ? 'consultation'
                                  : 'session'}{' '}
                                with you
                              </span>
                            )}
                            {e.action === Actions.ClientConnect && (
                              <span className={styles.label}>
                                {' '}
                                is now connected with you
                              </span>
                            )}
                          </div>
                          <span className={styles.date}>
                            {formatTimeDifference(e.createdAt)}
                          </span>
                          {e.action === Actions.Feeling && (
                            <img
                              className={styles.moodImg}
                              src={images[e.feeling.feeling]}
                              alt="Smile"
                            />
                          )}
                          {e.action === Actions.CompleteExercise &&
                            e.exercise.image && (
                              <img
                                className={styles.exerciseImg}
                                src={e.exercise.image}
                                alt="Exe"
                              />
                            )}
                          <span className={styles.date}>{e.date}</span>
                          {e.action > 2 && (
                            <i
                              className={cn(
                                'icon-right-arrow',
                                styles.iconArrow,
                              )}
                            ></i>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
                <span className={styles.seeAll} onClick={onSeeActivity}>
                  See all
                </span>
              </div>

              <div className={styles.mainRightWrapper}>
                <div className={styles.scheduleWrapper}>
                  <span className={styles.title}>Schedule</span>
                  {!visibleSessions?.length &&
                    getBookingsStatus === 'SUCCESS' && (
                      <>
                        {therapistBookingsDemo.map((e) => {
                          return (
                            <div
                              key={e.id}
                              className={styles.bookingRow}
                              onClick={onBookClick}
                            >
                              <div className={styles.topRow}>
                                <span className={styles.date}>{e.date}</span>
                                <i className={cn('icon-live-text')}></i>
                              </div>
                              <span className={styles.name}>{e.name}</span>
                              <div className={styles.typeWrapper}>
                                <span
                                  className={cn(
                                    styles.colorCircle,
                                    styles[e.type.toLowerCase()],
                                  )}
                                ></span>
                                {e.type && (
                                  <span className={styles.sessionType}>
                                    {e.type}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  {!!visibleSessions?.length &&
                    getBookingsStatus === 'SUCCESS' && (
                      <>
                        {visibleSessions?.map((e: any) => {
                          const session_type =
                            e?.type === 3 ? 'consultation' : 'session';
                          const type = getTypeCall(
                            e.isInPerson,
                            e.isLiveText,
                            e.isVideoCall,
                            e.isVoiceCall,
                          );
                          return (
                            <div
                              key={e.id}
                              className={styles.bookingRow}
                              onClick={onBookClick}
                            >
                              <div className={styles.topRow}>
                                <span className={styles.date}>
                                  {e?.day}, {e?.startTime} - {e?.endTime}
                                </span>
                                <i
                                  className={cn(`icon-${type}`, styles.icon, {
                                    [styles.inPersonIcon]: type === 'live-text',
                                  })}
                                />
                              </div>
                              <span className={styles.name}>
                                {e?.creator?.name}
                              </span>
                              <div className={styles.typeWrapper}>
                                <span
                                  className={cn(
                                    styles.colorCircle,
                                    styles[session_type],
                                  )}
                                ></span>
                                {session_type && (
                                  <span className={styles.sessionType}>
                                    {modifyWord(session_type)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  <span
                    className={styles.seeAll}
                    onClick={() => {
                      activityItemClick('book');
                    }}
                  >
                    See all
                  </span>
                </div>

                <div className={styles.widgetWrapper}>
                  <span className={styles.title}>Widgets</span>
                  <div className={styles.widgetMainWrapper}>
                    <span className={styles.title}>Client Adherence</span>
                    <span className={styles.comingLabel}>Coming soon</span>
                    {widgetDemoArray.map((_, i) => {
                      return (
                        <div key={i} className={styles.widgetRow}>
                          <div className={styles.widgetRound}></div>
                          <div
                            className={cn(styles.widgetSquar, {
                              [styles.secondSquar]: i > 0,
                            })}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.allActivityWrapper}>
              <div className={styles.allActivityMain}>
                <i
                  className={cn('icon-left-arrow', styles.backIcon)}
                  onClick={onBack}
                ></i>
                <span className={styles.title}>Activity</span>
                <div
                  id={'scrollableDiv'}
                  className={cn(
                    styles.activityWrapper,
                    styles.allActivityState,
                  )}
                >
                  {!activityData.length && (
                    <>
                      <div
                        className={styles.activityRow}
                        onClick={activityDemoFeedExe}
                      >
                        <div className={styles.avatarWrapper}>
                          <span className={styles.avatarLabel}>JD</span>
                        </div>
                        <div className={styles.nameLabelWrapper}>
                          <span className={styles.name}>Jonah Demo</span>
                          <span className={styles.label}>
                            completed Cognitive Distortions
                          </span>
                        </div>
                        <span className={styles.date}>3h</span>
                        <img src={Activity1} alt="img" />
                      </div>
                      <div
                        className={styles.activityRow}
                        onClick={activityDemoFeedExe}
                      >
                        <div className={styles.avatarWrapper}>
                          <span className={styles.avatarLabel}>JD</span>
                        </div>
                        <div className={styles.nameLabelWrapper}>
                          <span className={styles.name}>Jonah Demo</span>
                          <span className={styles.label}>was feeling okay</span>
                        </div>
                        <span className={styles.date}>3d</span>
                        <img className={styles.moodImg} src={Mood3} alt="img" />
                      </div>
                      {therapistActivityDemo.map((e) => {
                        return (
                          <div
                            key={e.id}
                            className={styles.activityRow}
                            onClick={() => {
                              activityItemClick('book');
                            }}
                          >
                            <div className={styles.avatarWrapper}>
                              <span className={styles.avatarLabel}>
                                {getInitialsLetters(e.name)}
                              </span>
                            </div>
                            <div className={styles.nameLabelWrapper}>
                              <span className={styles.name}>{e.name}</span>
                              <span className={styles.label}>{e.label}</span>
                            </div>
                            <span className={styles.date}>{e.date}</span>
                            <i
                              className={cn(
                                'icon-right-arrow',
                                styles.iconArrow,
                              )}
                            ></i>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {!!activityData.length && (
                    <InfiniteScroll
                      dataLength={activityData.length}
                      next={fetchActivityData}
                      hasMore={hasMore}
                      loader={<span></span>}
                      scrollableTarget="scrollableDiv"
                    >
                      <div className={styles.realActivityAllState}>
                        {activityData.map((e: any) => {
                          return (
                            <div
                              key={e.id}
                              className={styles.activityRow}
                              onClick={() => {
                                activityItemClickRealData(e);
                              }}
                            >
                              <div className={styles.avatarWrapper}>
                                <span className={styles.avatarLabel}>
                                  {getInitialsLetters(e?.client?.name)}
                                </span>
                              </div>
                              <div className={styles.nameLabelWrapper}>
                                <span className={styles.name}>
                                  {e?.client?.name}
                                </span>
                                {e.action === Actions.Feeling && (
                                  <span className={styles.label}>
                                    {' '}
                                    was{' '}
                                    <span className={styles.lowercase}>
                                      {FeelingStates[e.feeling.feeling - 1]}
                                    </span>
                                  </span>
                                )}
                                {e.action === Actions.CompleteExercise && (
                                  <span className={styles.label}>
                                    {' '}
                                    completed {e.exercise.name}
                                  </span>
                                )}
                                {e.action === Actions.BookingCreated && (
                                  <span className={styles.label}>
                                    {' '}
                                    booked a{' '}
                                    {e.booking.type === 3
                                      ? 'consultation'
                                      : 'session'}{' '}
                                    with you
                                  </span>
                                )}
                                {e.action === Actions.BookingUpdated && (
                                  <span className={styles.label}>
                                    {' '}
                                    modified a{' '}
                                    {e.booking.type === 3
                                      ? 'consultation'
                                      : 'session'}{' '}
                                    with you
                                  </span>
                                )}
                                {e.action === Actions.BookingCanceled && (
                                  <span className={styles.label}>
                                    {' '}
                                    cancelled a{' '}
                                    {e.booking.type === 3
                                      ? 'consultation'
                                      : 'session'}{' '}
                                    with you
                                  </span>
                                )}
                                {e.action === Actions.ClientConnect && (
                                  <span className={styles.label}>
                                    {' '}
                                    is now connected with you
                                  </span>
                                )}
                              </div>
                              <span className={styles.date}>
                                {formatTimeDifference(e.createdAt)}
                              </span>
                              {e.action === Actions.Feeling && (
                                <img
                                  className={styles.moodImg}
                                  src={images[e.feeling.feeling]}
                                  alt="Smile"
                                />
                              )}
                              {e.action === Actions.CompleteExercise &&
                                e.exercise.image && (
                                  <img
                                    className={styles.exerciseImg}
                                    src={e.exercise.image}
                                    alt="Exe"
                                  />
                                )}
                              <span className={styles.date}>{e.date}</span>
                              {e.action > 2 && (
                                <i
                                  className={cn(
                                    'icon-right-arrow',
                                    styles.iconArrow,
                                  )}
                                ></i>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </InfiniteScroll>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {shareShow && (
        <AppModal width={389} {...modalHandlers}>
          <ShareModal link={profile?.username} setShareShow={setShareShow} />
        </AppModal>
      )}
    </div>
  );
};
export default TherapistHome;
