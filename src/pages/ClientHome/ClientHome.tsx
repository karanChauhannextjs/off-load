import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./ClientHome.module.scss";
import { Avatar, Button, ScheduleCard } from "@shared/ui";
import { useBook } from "@store/book.ts";
import {
  androidAppLink,
  getTypeCall,
  iosAppLink,
  upcomingSessionsReader,
} from "@utils/helpers.ts";
import { IScheduleCard } from "@models/book.ts";
import {
  AppModal,
  useAppModalSimpleHandlers,
} from "@shared/ui/AppModal/AppModal.tsx";
import { ClientConnectModal, ClientStartBookingModal } from "@pages/index.ts";
import toast from "react-hot-toast";
import {
  CHECKIN_PUBLIC_BASE_URL,
  EXERCISE_PUBLIC_BASE_URL,
  RoutesEnum,
  USER_PUBLIC_BASE_URL,
  VIEW_PUBLIC_BASE_URL,
} from "@routes/Routes.types.ts";
import Gold1 from "@assets/svg/gold1.svg";
import Gold2 from "@assets/svg/gold2.svg";
import Gold3 from "@assets/svg/gold3.svg";
import Checkin1 from "@assets/svg/checkin1.svg";
import Checkin2 from "@assets/svg/checkin2.svg";
import Checkin3 from "@assets/svg/checkin3.svg";
import Checkin4 from "@assets/svg/checkin4.svg";
import Checkin5 from "@assets/svg/checkin5.svg";
import Therapists from "@assets/images/therapists.png";
import BlackStar from "@assets/svg/blackStar.svg";
import { MoodSmilesData } from "@constants/constants.ts";
import Care from "@pages/Care";
import cn from "classnames";
import { ExerciseCard } from "@features/index.ts";
import { useExercises } from "@store/exercises.ts";
import { useGlobalStore } from "@store/global.ts";
import { useInvite } from "@store/invite.ts";
import { useProfileStore } from "@store/profile.ts";
import { USER_TYPES } from "@constants/user.ts";
import Apple from "@assets/images/apple.png";
import { StoreTypes } from "@constants/care.ts";
import Google from "@assets/images/google.png";
import { Helmet } from "react-helmet";
// import {useFeeling} from "@store/feeling.ts";

const checkinImages = [Checkin1, Checkin2, Checkin3, Checkin4, Checkin5];

const ClientHome = () => {
  const { state, pathname } = useLocation();
  const location = useLocation();
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const refs = useRef<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") ?? "{}");
  const [selected, setSelected] = useState(false);
  const [isExerciseData, setIsExerciseData] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<boolean>(false);
  const [threeModalsShow, setThreeModalsShow] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768
  );
  const favoriteExercise = useExercises((state) => state.favoriteExercise);
  const unFavoriteExercise = useExercises((state) => state.unFavoriteExercise);
  const viewExercise = useExercises((state) => state.viewExercise);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const getBookings = useBook((state) => state.getBookings);
  const getBookingsStatus = useBook((state) => state.getBookingsStatus);
  const bookingData = useBook((state) => state.bookingData);
  const getOffloadsCount = useGlobalStore((state) => state.getOffloadsCount);
  const getOffloadsCountStatus = useGlobalStore(
    (state) => state.getOffloadsCountStatus
  );
  const offloadsCount = useGlobalStore((state) => state.offloadsCount);
  const [scrollState, setScrollState] = useState<any>(null);
  // const [upcomingTherapist, setUpcomingTherapist] = useState<any>(null);
  const getJoinedExercises = useExercises((state) => state.getJoinedExercises);
  const getJoinedExercisesStatus = useExercises(
    (state) => state.getJoinedExercisesStatus
  );
  const joinedExercises = useExercises((state) => state.joinedExercises);
  const connectClient = useInvite((state) => state.connectClient);
  const getProfile = useProfileStore((state) => state.getProfile);
  const profile = useProfileStore((state) => state.profile);
  const [connectShow, setConnectShow] = useState<boolean>(false);
  const [connectStep, setConnectStep] = useState<number>(1);
  const [code, setCode] = useState<string>("");
  const [isWrongeCode, setIsWrongeCode] = useState<boolean>(false);
  // const userFeeling = useFeeling((state) => state.userFeeling);
  // const createExerciseAnswer = useExercises(state => state.createExerciseAnswer)
  // const checkinCompleteData = JSON.parse(localStorage.getItem('checkinCompleteData') ?? '{}');
  // const exerciseCompleteData = JSON.parse(localStorage.getItem('exerciseCompleteData') ?? '{}');
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  let cardWidth = isMobileScreen ? 162 : 187;

  const onScheduleCardClick = (item: IScheduleCard) => {
    setThreeModalsShow(true);
    modalHandlers.show(item);
  };

  const onAvatarClick = (username: string) => {
    navigate(`${VIEW_PUBLIC_BASE_URL}${username}`);
  };

  const onSmileClick = (checkId: number) => {
    navigate(`${CHECKIN_PUBLIC_BASE_URL}`, { state: { checkId } });
  };

  const onConnectClick = () => {
    if (user?.uuid) {
      setConnectShow(true);
      modalHandlers.show();
    } else {
      navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.CLIENT_SIGN_UP}`);
    }
  };

  const onNextHandler = async () => {
    if (code) {
      setIsWrongeCode(false);
      try {
        if (connectStep === 1) {
          const result = await connectClient({ code });
          if (result.status) {
            setConnectStep((prev) => prev + 1);
            localStorage.setItem("invitedTherapistEmail", result.result);
            getProfile();
          }
        }
        if (connectStep === 2) {
          setConnectStep((prev) => prev + 1);
        }
        if (connectStep === 3) {
          setConnectStep(1);
          setConnectShow(false);
          modalHandlers.close();
          navigate("/client/client-messages");
        }
      } catch (err: any) {
        setIsWrongeCode(true);
      }
    }
  };

  const onSeeBookings = () => {
    setSelected(true);
    setSelectedBookings(true);
    localStorage.setItem("scrollPosition", scrollPosition.toString());
    navigate(`${location.pathname}#selected_bookings`);
  };

  const onBackHandler = () => {
    setSelected(false);
    setSelectedBookings(false);
    window.location.hash = "";
  };

  const handleLeftArrowClick = (index: number) => {
    if (refs.current[index] && refs.current[index].current) {
      (refs.current[index].current as any).scrollBy({ left: -cardWidth - 16 });
    }
  };

  const handleRightArrowClick = (index: number) => {
    if (refs?.current?.[index] && refs?.current?.[index]?.current) {
      (refs?.current?.[index]?.current as any).scrollBy({
        left: cardWidth + 16,
      });
    }
  };

  const handleScroll = (index: number) => {
    const wrapper = refs?.current?.[index]?.current;
    if (wrapper) {
      const isAtStart = wrapper.scrollLeft === 0;
      const isAtEnd =
        wrapper.scrollLeft + wrapper.clientWidth === wrapper.scrollWidth;
      setScrollState((prevState: any) =>
        prevState?.map((state: any, idx: number) =>
          idx === index ? { isAtStart, isAtEnd } : state
        )
      );
    }
  };

  const onAction = (type: string, card: any) => {
    if (type === "add") {
      modalHandlers.show(card);
    }
  };

  const onFavorite = async (isFavorite: boolean, uuid: string) => {
    try {
      if (!isFavorite) {
        await favoriteExercise(uuid);
      } else {
        await unFavoriteExercise(uuid);
      }
      setIsChanged(!isChanged);
    } catch (error) {
      console.log("error", error);
    }
  };

  const onCardClick = (card: any) => {
    if (card?.isActive) {
      viewExercise(card?.uuid);
      navigate(`${EXERCISE_PUBLIC_BASE_URL}/${card?.uuid}?from=internal`);
    }
  };

  const onClickCarePlanSee = (therapist: any) => {
    localStorage.setItem("fromCarePlan", JSON.stringify(therapist));
    setTimeout(() => {
      navigate("/client/client-messages");
    }, 0);
  };

  const onAppAction = (type: string) => {
    if (type === StoreTypes.Apple) {
      //Apple
      window.location.href = iosAppLink;
    } else {
      //Google
      window.location.href = androidAppLink;
    }
  };

  useEffect(() => {
    if (
      !location.hash.includes("selected_bookings") &&
      selectedBookings &&
      selected
    ) {
      setSelectedBookings(false);
      setSelected(false);
    }
    if (
      !location.hash.includes("selected_category") &&
      selected &&
      !selectedBookings
    ) {
      setSelected(false);
    }
  }, [location]);

  useEffect(() => {
    if (state?.startCallError) {
      toast.error("You can start five minutes before the start time");
      navigate(pathname, { replace: true });
    }
    if (state?.startCallExpireError) {
      toast.error("The booking time has expired.");
      navigate(pathname, { replace: true });
    }
  }, [state]);

  useEffect(() => {
    if (user?.uuid) {
      getBookings().then(() => {
        getJoinedExercises();
      });
    }
  }, []);

  useEffect(() => {
    setScrollState(
      joinedExercises?.map((item: any) => ({
        isAtStart: true,
        isAtEnd: item?.exercises?.length < 5,
      }))
    );
  }, [joinedExercises]);

  useEffect(() => {
    getOffloadsCount();
    if (user?.uuid) {
      getProfile();
    }
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const scrollPositionFromCare = localStorage.getItem(
      "scrollPositionFromCare"
    );
    if (!scrollPositionFromCare) return;

    if (user?.uuid) {
      if (
        getBookingsStatus === "SUCCESS" &&
        getJoinedExercisesStatus === "SUCCESS" &&
        getOffloadsCountStatus === "SUCCESS"
      ) {
        setTimeout(() => {
          window.scrollTo({
            top: Number(scrollPositionFromCare),
            behavior: "smooth",
          });
          localStorage.removeItem("scrollPositionFromCare");
        }, 500);
      }
    } else if (getOffloadsCountStatus === "SUCCESS") {
      setTimeout(() => {
        window.scrollTo({
          top: Number(scrollPositionFromCare),
          behavior: "smooth",
        });
        localStorage.removeItem("scrollPositionFromCare");
      }, 500);
    }
  }, [getBookingsStatus, getOffloadsCountStatus, getJoinedExercisesStatus]);

  useEffect(() => {
    const scrollPosition = localStorage.getItem("scrollPosition");
    if (selectedBookings) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: Number(scrollPosition), behavior: "smooth" });
    }
  }, [selected, selectedBookings]);

  const sorted = bookingData?.sort((a: any, b: any) => {
    return b.date - a.date;
  });
  const lastUpcomingSession = upcomingSessionsReader(sorted).at(-1);
  const visibleSessions = lastUpcomingSession
    ? [lastUpcomingSession]
    : sorted?.slice(0, 2);

  return (
    <>
      <Helmet>
        <title>Offload | Client-Home</title>
      </Helmet>

      <div className={styles.pageWrapper}>
        {!selected && (
          <div className={styles.topWrapper}>
            <div className={styles.topMain}>
              <img className={styles.gold1} src={Gold1} alt="g1" />
              <img className={styles.gold2} src={Gold2} alt="g1" />
              <img className={styles.gold3} src={Gold3} alt="g1" />
              <span className={styles.titlePage}>
                {user?.type === USER_TYPES.CLIENT
                  ? "Get it off your chest"
                  : "Client companion app"}
              </span>
              <div className={styles.moodBlock}>
                <span className={styles.feelingText}>How are you feeling?</span>
                <div className={styles.smilesWrapper}>
                  {MoodSmilesData.map((i: number) => {
                    return (
                      <img
                        src={checkinImages[i - 1]}
                        alt="Smile"
                        className={styles.smile}
                        onClick={() => {
                          onSmileClick(i);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className={styles.offloadsCountWrapper}>
                <span className={styles.countText}>
                  {offloadsCount} offloads{" "}
                  <span className={styles.lightCountText}>
                    from other people
                  </span>
                </span>
              </div>
              {user?.uuid && bookingData?.length ? (
                <div className={styles.upcomingWrapper}>
                  <span className={styles.upcomingLabel}>Sessions</span>
                  <span className={styles.seeAll} onClick={onSeeBookings}>
                    See all
                  </span>
                </div>
              ) : null}
              {user?.uuid && (
                <>
                  {!!bookingData?.length ? (
                    <div
                      className={cn(
                        styles.cardsWrapper,
                        styles.cardsWrapperMobile
                      )}
                    >
                      {visibleSessions?.map((item: IScheduleCard) => {
                        const {
                          id,
                          type,
                          day,
                          date,
                          startTime,
                          endTime,
                          therapist,
                          isInPerson,
                          isLiveText,
                          isVideoCall,
                          isVoiceCall,
                        } = item;
                        const duration = type === 1 ? 30 : type === 2 ? 50 : 15;
                        const disabled =
                          Date.now() > date * 1000 + duration * 60 * 1000;

                        return (
                          <div key={id} className={styles.block}>
                            <Avatar
                              photoUrl={therapist?.image}
                              className={styles.avatar}
                              onClick={() => {
                                onAvatarClick(therapist?.username);
                              }}
                            />
                            <div className={styles.cardsBlock}>
                              <ScheduleCard
                                day={day}
                                onClick={() => {
                                  onScheduleCardClick(item);
                                }}
                                key={id}
                                disabled={disabled}
                                className={styles.card}
                                name={therapist?.name}
                                end_time={endTime}
                                start_time={startTime}
                                session_type={
                                  type === 3 ? "consultation" : "session"
                                }
                                type={getTypeCall(
                                  isInPerson,
                                  isLiveText,
                                  isVideoCall,
                                  isVoiceCall
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              )}
              {!selected && !isExerciseData && !profile?.acceptedCounts && (
                <div className={styles.therapistBlockWrapper}>
                  <div className={styles.therapistsMain}>
                    <div className={styles.avatarsWrapper}>
                      <img
                        src={Therapists}
                        alt="img"
                        className={styles.therapists}
                      />
                    </div>
                    {user?.uuid && (
                      <span className={styles.therapistsInfoLabel}>
                        Get a care plan, send messages, book sessions and more.
                      </span>
                    )}
                    {!user?.uuid && (
                      <span className={styles.therapistsInfoLabelBold}>
                        Got a connection code from your therapist?
                      </span>
                    )}
                    {!user?.uuid && (
                      <span className={styles.therapistsInfoLabel}>
                        Download the client companion app for iOS or Android
                      </span>
                    )}
                    {user?.uuid && (
                      <div className={styles.therapistsActionWrapper}>
                        <Button
                          label={"Connect your therapist"}
                          className={styles.connectButton}
                          onClick={onConnectClick}
                        />
                        <img
                          className={styles.blackKross}
                          src={BlackStar}
                          alt="blackStar"
                        />
                      </div>
                    )}
                    {!user?.uuid && (
                      <div className={styles.appActionsWrapper}>
                        <img
                          className={styles.appButtons}
                          src={Apple}
                          alt="apple"
                          onClick={() => {
                            onAppAction(StoreTypes.Apple);
                          }}
                        />
                        <img
                          className={styles.appButtons}
                          src={Google}
                          alt="google"
                          onClick={() => {
                            onAppAction(StoreTypes.Google);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/*{!user?.uuid && !selected && (*/}
        {/*  <div className={styles.clientHomeExercises}>Client Home Exercises</div>*/}
        {/*)}*/}
        {user?.uuid && !selected && joinedExercises?.length ? (
          <>
            {joinedExercises?.map((item, index) => {
              return (
                <div className={styles.carePlanWrapper2}>
                  <div className={styles.carePlanTop}>
                    <div className={styles.planInfos}>
                      <span className={styles.heartIconWrapper}>
                        <i className={cn("icon-heart-art")} />
                      </span>
                      <div className={styles.textsWrapper}>
                        <span className={styles.bold}>Your care plan</span>
                        <span className={styles.label}>
                          By {item?.therapist?.name}
                        </span>
                      </div>
                    </div>
                    <div className={styles.seeAllWrapper}>
                      {!isMobileScreen && (
                        <div className={styles.arrowsWrapper}>
                          <div
                            className={cn(styles.iconWrapper2, {
                              [styles.disabled]:
                                scrollState?.[index]?.isAtStart,
                            })}
                            onClick={() => handleLeftArrowClick(index)}
                          >
                            <i className={cn("icon-left-arrow")} />
                          </div>
                          <div
                            className={cn(styles.iconWrapper2, {
                              [styles.disabled]: scrollState?.[index]?.isAtEnd,
                            })}
                            onClick={() => handleRightArrowClick(index)}
                          >
                            <i className={cn("icon-right-arrow")} />
                          </div>
                        </div>
                      )}
                      <span
                        className={styles.seeAll}
                        onClick={() => {
                          onClickCarePlanSee(item?.therapist);
                        }}
                      >
                        See all
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardRow}>
                    <div
                      className={styles.exerciseCardsWrapper}
                      ref={refs?.current?.[index]}
                      onScroll={() => handleScroll(index)}
                    >
                      {item?.exercises?.map((exercise: any) => (
                        <ExerciseCard
                          cardData={exercise}
                          onActionClick={onAction}
                          onFavoriteClick={onFavorite}
                          onCardClick={onCardClick}
                          size={isMobileScreen ? "small" : "large"}
                          isFavoritable={false}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
        {!selectedBookings && (
          <div className={styles.careBlockWrapper}>
            <Care
              page={"client-home"}
              widthTitle={false}
              widthLine={false}
              setIsExerciseData={setIsExerciseData}
              setSelected={setSelected}
            />
          </div>
        )}
        {selectedBookings && (
          <div className={styles.wrapper}>
            <div className={styles.iconWrapper} onClick={onBackHandler}>
              <i className={cn("icon-left-arrow")} style={{ fontSize: 16 }} />
            </div>
            <span className={styles.title}>Sessions</span>
            <div className={styles.line}></div>
            {!!bookingData?.length ? (
              <div className={cn(styles.cardsWrapper, styles.inPage)}>
                {sorted?.map((item: IScheduleCard) => {
                  const {
                    id,
                    type,
                    day,
                    date,
                    startTime,
                    endTime,
                    therapist,
                    isInPerson,
                    isLiveText,
                    isVideoCall,
                    isVoiceCall,
                  } = item;

                  const duration = type === 1 ? 30 : type === 2 ? 50 : 15;
                  const disabled =
                    Date.now() > date * 1000 + duration * 60 * 1000;

                  return (
                    <div key={id} className={styles.block}>
                      <Avatar
                        photoUrl={therapist?.image}
                        className={styles.avatar}
                        onClick={() => {
                          onAvatarClick(therapist?.username);
                        }}
                      />
                      <div className={styles.cardsBlock}>
                        <ScheduleCard
                          day={day}
                          onClick={() => {
                            onScheduleCardClick(item);
                          }}
                          key={id}
                          disabled={disabled}
                          className={styles.card}
                          name={therapist?.name}
                          end_time={endTime}
                          start_time={startTime}
                          session_type={type === 3 ? "consultation" : "session"}
                          type={getTypeCall(
                            isInPerson,
                            isLiveText,
                            isVideoCall,
                            isVoiceCall
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className={styles.label}>No bookings yet</span>
            )}
          </div>
        )}
        {threeModalsShow && (
          <AppModal
            setStateAction={setThreeModalsShow}
            width={389}
            {...modalHandlers}
            disableClosingModal
          >
            <ClientStartBookingModal
              data={modalHandlers.metaData}
              setThreeModalsShow={setThreeModalsShow}
            />
          </AppModal>
        )}
        {connectShow && (
          <AppModal
            setStateAction={setConnectShow}
            width={isMobileScreen ? "100%" : 375}
            {...modalHandlers}
            withBorder={!isMobileScreen}
            closeIcon={connectStep === 1}
            disableClosingModal={connectStep > 1}
            className={cn({ [styles.connectModalStep2]: connectStep > 1 })}
          >
            <ClientConnectModal
              step={connectStep}
              onNext={onNextHandler}
              setCode={setCode}
              isWrongCode={isWrongeCode}
            />
          </AppModal>
        )}
      </div>
    </>
  );
};
export default ClientHome;
