import React, { useEffect, useRef, useState } from 'react';

import styles from './Care.module.scss';
import {
  AddClientModal,
  ExerciseCard,
  ExerciseShareModal,
} from '@features/index.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import cn from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  EXERCISE_PUBLIC_BASE_URL,
  RoutesEnum,
  USER_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import { useExercises } from '@store/exercises.ts';
import { CareProps } from '@pages/Care/Care.types.ts';
import { USER_TYPES } from '@constants/user.ts';
import Therapists from '@assets/images/therapists.png';
import Apple from '@assets/images/apple.png';
import Google from '@assets/images/google.png';
import { Button } from '@shared/ui';
import BlackStar from '@assets/svg/blackStar.svg';
import {
  ClientConnectModal,
  FeedbackModal,
  LoadingScreen,
} from '@pages/index.ts';
import { useInvite } from '@store/invite.ts';
import { useProfileStore } from '@store/profile.ts';
import { useGlobalStore } from '@store/global.ts';
import { useBook } from '@store/book.ts';
import { CareMockDots, StoreTypes } from '@constants/care.ts';
import { androidAppLink, currentBaseUrl, iosAppLink } from '@utils/helpers.ts';
import { PaidStatus } from '@constants/plans.ts';
import { GroupAll } from '@constants/constants.ts';
import ThinkingFace from '@assets/images/thinking-face-back.svg';
import { Helmet } from 'react-helmet';

const Care: React.FC<CareProps> = (props) => {
  const {
    widthTitle = true,
    widthLine = true,
    setSelected,
    setIsExerciseData,
    page,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [addCardShow, setAddCardShow] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(GroupAll);
  const [scrollState, setScrollState] = useState<any>(null);
  const [scrollStateGroups, setScrollStateGroups] = useState({
    isAtStart: false,
    isAtEnd: false,
    hasScroll: false,
  });
  // const getExercises = useExercises((state) => state.getExercises);
  const getExercisesByCategory = useExercises(
    (state) => state.getExercisesByCategory,
  );
  const exercises = useExercises((state) => state.exercises);
  const getFavoriteExercises = useExercises(
    (state) => state.getFavoriteExercises,
  );
  const favoriteExercise = useExercises((state) => state.favoriteExercise);
  const unFavoriteExercise = useExercises((state) => state.unFavoriteExercise);
  const favoriteExercises = useExercises((state) => state.favoriteExercises);
  const viewExercise = useExercises((state) => state.viewExercise);
  const connectClient = useInvite((state) => state.connectClient);
  const getProfile = useProfileStore((state) => state.getProfile);
  const profile = useProfileStore((state) => state.profile);
  const [pageData, setPageData] = useState<any[]>([]);
  const [pageDataGroup, setPageDataGroup] = useState<any[] | null>([]);
  const [connectShow, setConnectShow] = useState<boolean>(false);
  const [connectStep, setConnectStep] = useState<number>(1);
  const [code, setCode] = useState<string>('');
  const [isWrongeCode, setIsWrongeCode] = useState<boolean>(false);
  const refs = useRef<any[]>([]);
  const refGroups = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const resetOffloadCounts = useGlobalStore((state) => state.reset);
  const resetExercises = useExercises((state) => state.reset);
  const resetBookings = useBook((state) => state.reset);
  let cardWidth = isMobileScreen ? 154 : 187;
  let gruopWrapperWidth = 120;
  const scrollPositionFromCare = localStorage.getItem('scrollPositionFromCare');
  const savedScrollFromSee = localStorage.getItem('savedScrollFromSee');
  const savedScrollForHome = localStorage.getItem('savedScrollForHome');
  const getGroups = useExercises((state) => state.getGroups);
  const resetGroups = useExercises((state) => state.resetGroups);
  const groups = useExercises((state) => state.groups);
  const getGroupCategories = useExercises((state) => state.getGroupCategories);
  const getGroupCategoriesStatus = useExercises(
    (state) => state.getGroupCategoriesStatus,
  );
  const groupCategories = useExercises((state) => state.groupCategories);
  const [loadingFrom, setLoadingFrom] = useState(true);
  const [shareShow, setShareShow] = useState<boolean>(false);
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);

  const onAction = (type: string, card: any) => {
    if (type === 'add') {
      if (user.type === USER_TYPES.THERAPIST) {
        setAddCardShow(true);
        modalHandlers.show(card);
      } else {
        navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
      }
    }
  };

  const onFavorite = async (
    isFavorite: boolean,
    uuid: string,
    exercise?: any,
  ) => {
    if (user?.uuid) {
      try {
        const updatedPageData = [...pageData];
        if (!isFavorite) {
          await favoriteExercise(uuid);
          let favIndex = updatedPageData.findIndex(
            (row) => row.category?.name === 'Favourites',
          );
          if (favIndex === -1) {
            updatedPageData.splice(1, 0, {
              category: { id: Date.now(), name: 'Favourites' },
              exercises: [{ ...exercise, isFavorite: true }],
            });
          } else {
            updatedPageData[favIndex].exercises.push({
              ...exercise,
              isFavorite: true,
            });
          }
        } else {
          await unFavoriteExercise(uuid);
          let favIndex = updatedPageData.findIndex(
            (row) => row.category?.name === 'Favourites',
          );
          if (favIndex !== -1) {
            updatedPageData[favIndex].exercises = updatedPageData[
              favIndex
            ].exercises.filter((item: any) => item.uuid !== uuid);
            if (updatedPageData[favIndex].exercises.length === 0) {
              updatedPageData.splice(favIndex, 1);
            }
          }
        }
        const finalPageData = updatedPageData.map((row) => ({
          ...row,
          exercises: row.exercises.map((el: any) =>
            el.uuid === uuid ? { ...el, isFavorite: !isFavorite } : el,
          ),
        }));
        setPageData(finalPageData);

        // resetExercises();
        // setIsChanged(!isChanged);
      } catch (error) {
        console.log('error', error);
      }
    } else {
      navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.CLIENT_SIGN_UP}`);
    }
  };

  const onCardClick = (card: any) => {
    if (card?.isActive) {
      viewExercise(card.uuid);
      localStorage.setItem('scrollPositionFromCare', scrollPosition.toString());
      const prevScrollPosition = localStorage.getItem('scrollPosition');
      if (!scrollPositionFromCare) {
        if (prevScrollPosition) {
          localStorage.setItem(
            'scrollPositionFromCare',
            prevScrollPosition.toString(),
          );
        } else {
          localStorage.setItem(
            'scrollPositionFromCare',
            scrollPosition.toString(),
          );
        }
      }
      if (selectedCategory) {
        localStorage.setItem('savedScrollFromSee', scrollPosition.toString());
        prevScrollPosition &&
          localStorage.setItem(
            'savedScrollForHome',
            prevScrollPosition.toString(),
          );
      }
      resetOffloadCounts();
      resetExercises();
      resetBookings();
      resetGroups();
      navigate(`${EXERCISE_PUBLIC_BASE_URL}/${card?.uuid}?from=internal`);
    }
  };

  const onSeeHandle = (category: any) => {
    setSelectedCategory(category);
    if (setSelected) {
      setSelected(true);
    }
    localStorage.setItem('selectedCategory', JSON.stringify(category));
    localStorage.setItem('scrollPosition', scrollPosition.toString());
    localStorage.removeItem('scrollPositionFromCare');
    navigate(`${location.pathname}#selected_category`);
  };

  const onBackHandler = () => {
    setSelectedCategory(null);
    localStorage.removeItem('selectedCategory');
    if (selectedGroup) {
      window.location.hash = '#selected_group';
    } else {
      window.location.hash = '';
    }
    if (setSelected) {
      setSelected(false);
    }
  };

  const onGroupBackHandler = () => {
    setSelectedGroup(GroupAll);
    setPageDataGroup(null);
    localStorage.removeItem('selectedGroup');
    window.location.hash = '';
  };

  const onExerciseShare = async (exercise: any) => {
    if (!isMobileScreen) {
      setShareShow(true);
      modalHandlers.show(exercise);
    } else {
      const shareData = {
        title: 'Check out this therapy tool',
        text: '100s of science-backed therapy tools | Offload',
        url: `${currentBaseUrl}/exercise/${exercise?.uuid}`,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error: any) {
          console.error('Error sharing:', error);
        }
      }
    }
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
          idx === index ? { isAtStart, isAtEnd } : state,
        ),
      );
    }
  };

  const handleLeftArrowClickGroups = () => {
    if (refGroups?.current) {
      (refGroups?.current).scrollBy({ left: -(3 * gruopWrapperWidth) });
    }
  };

  const handleRightArrowClickGroups = () => {
    if (refGroups?.current) {
      (refGroups?.current).scrollBy({ left: 3 * gruopWrapperWidth });
    }
  };

  const handleScrollGroups = () => {
    const wrapper = refGroups?.current;
    if (wrapper) {
      const isAtStart = wrapper.scrollLeft === 0;
      const tolerance = 1;
      const isAtEnd =
        wrapper.scrollLeft + wrapper.clientWidth >=
        wrapper.scrollWidth - tolerance;
      setScrollStateGroups({ isAtStart, isAtEnd, hasScroll: true });
    }
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
            localStorage.setItem('invitedTherapistEmail', result.result);
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
          navigate('/client/client-messages');
        }
      } catch (err: any) {
        setIsWrongeCode(true);
      }
    }
  };

  const onGroupClick = async (group: any) => {
    if (!isMobileScreen) {
      saveGroupsScrollPosition();
    }
    setSelectedGroup(group);
    getGroupCategories(group.uuid, 1);
    if (group?.uuid !== 'all') {
      localStorage.setItem('selectedGroup', JSON.stringify(group));
      window.location.hash = '#selected_group';
    } else {
      window.location.hash = '';
    }
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

  const saveGroupsScrollPosition = () => {
    const wrapper = refGroups?.current;
    if (wrapper) {
      localStorage.setItem(
        'groupsScrollPosition',
        wrapper.scrollLeft.toString(),
      );
    }
  };

  const restoreGroupsScrollPosition = () => {
    const savedScrollPosition = localStorage.getItem('groupsScrollPosition');
    if (savedScrollPosition && refGroups?.current) {
      refGroups.current.scrollLeft = parseInt(savedScrollPosition, 10);
    }
  };

  const onFeedbackBanner = () => {
    setFeedbackShow(true);
    modalHandlers.show();
  };

  useEffect(() => {
    if (page === 'client-home') {
      getExercisesByCategory(2, 1);
    } else {
      getExercisesByCategory(1, 1);
      getGroups();
    }
    if (user?.uuid) {
      getFavoriteExercises();
    }
  }, []);

  useEffect(() => {
    if (user?.uuid) {
      getProfile();
    }
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const scrollPosition = localStorage.getItem('scrollPosition');
    setTimeout(() => {
      if (selectedCategory && !savedScrollFromSee) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (selectedCategory && savedScrollFromSee) {
        window.scrollTo({
          top: Number(savedScrollFromSee),
          behavior: 'smooth',
        });
        localStorage.removeItem('savedScrollFromSee');
      } else if (!selectedCategory && scrollPositionFromCare) {
        window.scrollTo({
          top: Number(scrollPositionFromCare),
          behavior: 'smooth',
        });
      } else if (!selectedCategory && savedScrollForHome && !scrollPosition) {
        window.scrollTo({
          top: Number(savedScrollForHome),
          behavior: 'smooth',
        });
        localStorage.removeItem('savedScrollForHome');
      } else {
        window.scrollTo({ top: Number(scrollPosition), behavior: 'smooth' });
      }
    }, 0);
  }, [selectedCategory]);

  useEffect(() => {
    setPageDataGroup(groupCategories || []);
  }, [groupCategories]);

  useEffect(() => {
    if (!!pageData?.length && (!!groups?.length || page === 'client-home')) {
      setScrollState(
        pageData?.map((item: any) => ({
          isAtStart: true,
          isAtEnd: item?.exercises.length < 6,
        })),
      );
      const selectedGroup = JSON.parse(
        localStorage.getItem('selectedGroup') || '{}',
      );
      const selectedCategory = JSON.parse(
        localStorage.getItem('selectedCategory') || '{}',
      );
      if (!selectedGroup?.name && !selectedCategory?.category?.name) {
        setLoadingFrom(false);
      }
      if (!!pageData?.length && groups?.length && selectedGroup.name) {
        setSelectedGroup(selectedGroup);
        restoreGroupsScrollPosition();
        setLoadingFrom(false);
        getGroupCategories(selectedGroup.uuid, 1);
        window.scrollTo({
          top: Number(scrollPositionFromCare),
          behavior: 'smooth',
        });
        setTimeout(() => {
          localStorage.removeItem('scrollPositionFromCare');
        }, 15000);
      }
      if (!!pageData?.length && selectedCategory.category) {
        if (setSelected) {
          setSelected(true);
        }
        setSelectedCategory(selectedCategory);
        setLoadingFrom(false);
        window.scrollTo({
          top: Number(scrollPositionFromCare),
          behavior: 'smooth',
        });
      } else if (scrollPositionFromCare && !!pageData?.length) {
        setScrollPosition(Number(scrollPositionFromCare));
        setTimeout(() => {
          window.scrollTo({
            top: Number(scrollPositionFromCare),
            behavior: 'smooth',
          });
        }, 100);
        setTimeout(() => {
          localStorage.removeItem('scrollPositionFromCare');
        }, 100);
      }
    }
  }, [pageData, groups, refGroups.current]);

  useEffect(() => {
    if (
      !location.hash.includes('selected_group') &&
      !location.hash.includes('selected_category')
    ) {
      setSelectedGroup(GroupAll);
      localStorage.removeItem('selectedGroup');
    }
    if (!location.hash.includes('selected_category')) {
      setSelectedCategory(null);
      localStorage.removeItem('selectedCategory');
    }
  }, [location]);

  useEffect(() => {
    if (!exercises) return;

    refs.current = exercises.map(() => React.createRef());
    let updatedPageData = [...exercises];
    if (favoriteExercises?.length) {
      const hasFavourites = updatedPageData.some(
        (row) => row.category?.name === 'Favourites',
      );
      if (!hasFavourites) {
        updatedPageData = [
          updatedPageData[0], // Keep the first item
          {
            category: { id: Date.now(), name: 'Favourites' },
            exercises: favoriteExercises,
          },
          ...updatedPageData.slice(1),
        ];
      }
    }
    setPageData(updatedPageData.filter((e) => !!e));
  }, [exercises, favoriteExercises]);

  useEffect(() => {
    if (setIsExerciseData) {
      if (pageData?.length) {
        setIsExerciseData(true);
      } else {
        setIsExerciseData(false);
      }
    }
  }, [pageData, setIsExerciseData]);

  useEffect(() => {
    const checkScrollAvailability = () => {
      const wrapper = refGroups?.current;
      if (wrapper) {
        const hasScroll = wrapper.scrollWidth > wrapper.clientWidth;

        setScrollStateGroups((prev: any) => ({
          ...prev,
          hasScroll,
          isAtStart: true,
          isAtEnd: !hasScroll,
        }));
      }
    };

    // Check after data is loaded and DOM is updated
    if (groups && groups.length > 0 && refGroups.current) {
      // Small timeout to ensure DOM is fully rendered
      setTimeout(checkScrollAvailability, 0);
    }
  }, [groups, refGroups.current]);

  return (
    <>
      <Helmet>
        <title>Offload | Care</title>
        <meta
          name="description"
          content="This is the best website built with React."
        />
        <meta
          property="og:title"
          content="100s of science-backed therapy tools | Offload"
        />
        <meta
          property="og:description"
          content="Brief description (og:description): Interactive therapy tools for mental health professionals, that save time and give real insights. Including anxiety, relaxation and self-esteem."
        />
        {/* <meta
          property="og:image"
          content="https://myawesomewebsite.com/og-image.jpg"
        /> */}
      </Helmet>
      {!loadingFrom && (
        <div
          className={cn(styles.pageWrapper, {
            [styles.pageWrapperWithUpgradeBanner]:
              (!user?.isSubscribed || user?.paidStatus !== PaidStatus.Paid) &&
              user?.type === USER_TYPES.THERAPIST,
            [styles.publicLayoutCare]:
              !user?.uuid && !location.pathname.includes('client-home'),
          })}
        >
          {location.pathname.includes('client-home') &&
            selectedCategory &&
            isMobileScreen && (
              <div
                className={styles.groupBackWrapper}
                style={{ padding: '0 20px' }}
              >
                <i
                  className={cn('icon-left-arrow', styles.groupBackMobile)}
                  onClick={onBackHandler}
                />
                <span className={styles.groupNameTitleMobile}>
                  {selectedCategory?.category?.name}
                </span>
              </div>
            )}
          {!isMobileScreen &&
            selectedGroup.uuid !== 'all' &&
            !selectedCategory &&
            widthTitle && (
              <div className={styles.titleWrapper}>
                <span
                  className={cn(styles.title, {
                    [styles.signoutMobileTitle]: isMobileScreen && !user?.type,
                    [styles.signoutDesktopTitle]:
                      !isMobileScreen && !user?.type,
                  })}
                >
                  {!!user?.type ? 'Care' : 'Therapy Tools'}
                </span>
              </div>
            )}
          {!(
            !isMobileScreen &&
            (selectedCategory || selectedGroup.uuid !== 'all')
          ) &&
            widthTitle && (
              <div
                className={cn(styles.titleWrapper, {
                  [styles.titleSelectedClient]:
                    !!selectedCategory &&
                    user?.type === USER_TYPES.CLIENT &&
                    location.pathname.includes('care'),
                })}
              >
                {(!selectedGroup || selectedGroup?.uuid === 'all') &&
                  !selectedCategory && (
                    <span
                      className={cn(styles.title, {
                        [styles.signoutMobileTitle]:
                          isMobileScreen && !user?.type,
                        [styles.signoutDesktopTitle]:
                          !isMobileScreen && !user?.type,
                      })}
                    >
                      {!!user?.type ? 'Care' : 'Therapy Tools'}
                    </span>
                  )}
                {selectedGroup &&
                  !selectedCategory &&
                  selectedGroup.uuid !== 'all' && (
                    <div className={styles.groupBackWrapper}>
                      <i
                        className={cn(
                          'icon-left-arrow',
                          styles.groupBackMobile,
                        )}
                        onClick={onGroupBackHandler}
                      />
                      <span className={styles.groupNameTitleMobile}>
                        {selectedGroup?.name}
                      </span>
                    </div>
                  )}
                {selectedGroup && selectedCategory && (
                  <div className={styles.groupBackWrapper}>
                    <i
                      className={cn('icon-left-arrow', styles.groupBackMobile)}
                      onClick={onBackHandler}
                    />
                    <span className={styles.groupNameTitleMobile}>
                      {selectedCategory?.category?.name}
                    </span>
                  </div>
                )}
                {!selectedGroup && selectedCategory && (
                  <div className={styles.groupBackWrapper}>
                    <i
                      className={cn('icon-left-arrow', styles.groupBackMobile)}
                      onClick={onBackHandler}
                    />
                    <span className={styles.groupNameTitleMobile}>
                      {selectedCategory?.category?.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          {!user?.type &&
            !selectedCategory &&
            location.pathname.includes('public/care') &&
            (!isMobileScreen ||
              (isMobileScreen && selectedGroup?.uuid === 'all')) && (
              <span className={styles.subtitle2}>
                For therapists and their clients
              </span>
            )}
          {!user?.type &&
            !selectedCategory &&
            location.pathname.includes('public/care') &&
            (!isMobileScreen ||
              (isMobileScreen && selectedGroup?.uuid === 'all')) && (
              <div className={styles.pointsWrapper}>
                {CareMockDots.map((item) => {
                  return (
                    <div className={styles.pointWrapper} key={item}>
                      <div className={styles.yellowCircle}>
                        <i className={cn('icon-check', styles.icon)} />
                      </div>
                      <span className={styles.pointText}>{item}</span>
                    </div>
                  );
                })}
              </div>
            )}
          {widthLine && user?.type && (
            <div
              className={cn(styles.line, { [styles.lineSignout]: !user?.type })}
            ></div>
          )}
          {selectedCategory ? (
            <div
              className={cn(styles.selectedWrapper, {
                [styles.selectedTherapistCare]:
                  user?.type === USER_TYPES.THERAPIST,
                [styles.selectedWrapperHome]:
                  location.pathname.includes('client-home') ||
                  (user?.type === USER_TYPES.CLIENT &&
                    location.pathname.includes('care')),
              })}
            >
              {!isMobileScreen && (
                <div
                  className={styles.iconWrapperSelected}
                  onClick={onBackHandler}
                >
                  <i className={cn('icon-left-arrow')} />
                </div>
              )}
              {!isMobileScreen && (
                <div className={styles.categoryNameWrapper}>
                  <span className={styles.subtitle}>
                    {selectedCategory?.category?.name}
                  </span>
                </div>
              )}
              <div className={cn(styles.selectedCardMain)}>
                {selectedCategory?.exercises?.map((item: any) => (
                  <ExerciseCard
                    isShareable
                    isAddable={user?.type === USER_TYPES.THERAPIST}
                    isFavoritable={!!user?.uuid}
                    cardData={item}
                    onActionClick={onAction}
                    onFavoriteClick={onFavorite}
                    onCardClick={onCardClick}
                    onShare={onExerciseShare}
                    size={isMobileScreen ? 'medium' : 'large'}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              className={cn(styles.main, {
                [styles.mainWithDat]: !!pageData?.length,
                [styles.mainWithUpgradeBanner]:
                  (!user?.isSubscribed ||
                    user?.paidStatus !== PaidStatus.Paid) &&
                  user?.type === USER_TYPES.THERAPIST &&
                  (selectedGroup || selectedCategory),
              })}
            >
              {!selectedCategory &&
                ((isMobileScreen &&
                  (selectedGroup?.uuid === 'all' || !selectedGroup)) ||
                  !isMobileScreen) &&
                location.pathname.includes('care') &&
                !!groups?.length && (
                  <div className={styles.groupsMain}>
                    {!isMobileScreen && (
                      <span
                        className={cn(
                          styles.groupArrowWrapper,
                          styles.firstWrapper,
                          {
                            [styles.disabled]: scrollStateGroups.isAtStart,
                          },
                        )}
                        onClick={handleLeftArrowClickGroups}
                      >
                        <i className={cn('icon-left-arrow')} />
                      </span>
                    )}
                    <div
                      className={styles.groupsWrapper}
                      ref={refGroups}
                      onScroll={handleScrollGroups}
                    >
                      {[{ uuid: 'all', name: 'All' }, ...groups]?.map(
                        (group: any) => (
                          <div
                            className={cn(styles.groupWrapper, {
                              [styles.active]:
                                selectedGroup?.uuid === group?.uuid,
                            })}
                            onClick={() => {
                              onGroupClick(group);
                            }}
                          >
                            <span className={styles.groupName}>
                              {group?.name}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                    {!isMobileScreen && (
                      <span
                        className={cn(
                          styles.groupArrowWrapper,
                          styles.secondWrapper,
                          {
                            [styles.disabled]: scrollStateGroups.isAtEnd,
                          },
                        )}
                        onClick={handleRightArrowClickGroups}
                      >
                        <i className={cn('icon-right-arrow')} />
                      </span>
                    )}
                  </div>
                )}
              {/*{!selectedCategory && selectedGroup && !isMobileScreen && (*/}
              {/*  <div*/}
              {/*    className={styles.groupBackWrapper}*/}
              {/*    onClick={onGroupBackHandler}*/}
              {/*  >*/}
              {/*    <i className={cn('icon-left-arrow', styles.groupBack)} />*/}
              {/*    <span className={styles.groupNameTitle}>*/}
              {/*      {selectedGroup?.name}*/}
              {/*    </span>*/}
              {/*  </div>*/}
              {/*)}*/}
              {selectedGroup &&
                !selectedCategory &&
                getGroupCategoriesStatus === 'SUCCESS' && (
                  <>
                    {pageDataGroup?.map((item, index) => (
                      <>
                        <div className={styles.mainBlock}>
                          <div className={styles.blockTop}>
                            <span className={styles.subtitle}>
                              {item?.category?.name}
                            </span>
                            <div className={styles.seeAllWrapper}>
                              {!isMobileScreen && (
                                <div className={styles.arrowsWrapper}>
                                  <div
                                    className={cn(styles.iconWrapper, {
                                      [styles.disabled]:
                                        scrollState?.[index]?.isAtStart,
                                    })}
                                    onClick={() => handleLeftArrowClick(index)}
                                  >
                                    <i className={cn('icon-left-arrow')} />
                                  </div>
                                  <div
                                    className={cn(styles.iconWrapper, {
                                      [styles.disabled]:
                                        scrollState?.[index]?.isAtEnd,
                                    })}
                                    onClick={() => handleRightArrowClick(index)}
                                  >
                                    <i className={cn('icon-right-arrow')} />
                                  </div>
                                </div>
                              )}
                              <span
                                className={styles.seeAll}
                                onClick={() => onSeeHandle(item)}
                              >
                                See all
                              </span>
                            </div>
                          </div>
                          <div className={styles.cardRow}>
                            <div
                              className={styles.cardsWrapper}
                              ref={refs?.current?.[index]}
                              onScroll={() => handleScroll(index)}
                            >
                              {item?.exercises?.map((exercise: any) => (
                                <ExerciseCard
                                  isShareable
                                  isAddable={
                                    user?.type === USER_TYPES.THERAPIST
                                  }
                                  cardData={exercise}
                                  onActionClick={onAction}
                                  onFavoriteClick={onFavorite}
                                  onCardClick={onCardClick}
                                  onShare={onExerciseShare}
                                  size={isMobileScreen ? 'small' : 'large'}
                                  isFavoritable={!!user?.uuid}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {location.pathname.includes('care') && index === 1 && (
                          <div
                            className={styles.feedbackBannerWrapper}
                            onClick={onFeedbackBanner}
                          >
                            <div className={styles.leftBlock}>
                              <img src={ThinkingFace} alt="Icon" />
                              <span>
                                What’s missing? Add any ideas for new content or
                                tools you’d like to see.
                              </span>
                            </div>
                            <i className={cn('icon-right-arrow')} />
                          </div>
                        )}
                        {!location.pathname.includes('care') &&
                          index === 0 &&
                          !selectedCategory &&
                          !profile?.acceptedCounts && (
                            <div className={styles.therapistBlockWrapper}>
                              <div className={styles.therapistsMain}>
                                <div className={styles.avatarsWrapper}>
                                  <img
                                    src={Therapists}
                                    alt="img"
                                    className={styles.therapists}
                                  />
                                </div>
                                <span className={styles.therapistsInfoLabel}>
                                  Get a care plan, send messages, book sessions
                                  and more.
                                </span>
                                <Button
                                  label={'Connect your therapist'}
                                  className={styles.connectButton}
                                  onClick={onConnectClick}
                                />
                                <img
                                  className={styles.blackKross}
                                  src={BlackStar}
                                  alt="blackStar"
                                />
                              </div>
                            </div>
                          )}
                      </>
                    ))}
                  </>
                )}
              {getGroupCategoriesStatus === 'LOADING' && <LoadingScreen />}
              {selectedGroup &&
                selectedGroup.uuid !== 'all' &&
                !selectedCategory &&
                getGroupCategoriesStatus === 'SUCCESS' &&
                !groupCategories?.length && (
                  <>
                    <h3>There is no category to show!</h3>
                    {location.pathname.includes('care') && (
                      <div
                        className={styles.feedbackBannerWrapper}
                        onClick={onFeedbackBanner}
                      >
                        <div className={styles.leftBlock}>
                          <img src={ThinkingFace} alt="Icon" />
                          <span>
                            What’s missing? Add any ideas for new content or
                            tools you’d like to see.
                          </span>
                        </div>
                        <i className={cn('icon-right-arrow')} />
                      </div>
                    )}
                  </>
                )}
              {!selectedCategory &&
                (selectedGroup?.uuid === 'all' || !selectedGroup) && (
                  <>
                    {pageData?.map((item, index) => (
                      <>
                        <div className={styles.mainBlock}>
                          <div className={styles.blockTop}>
                            <span className={styles.subtitle}>
                              {item?.category?.name}
                            </span>
                            <div className={styles.seeAllWrapper}>
                              {!isMobileScreen && (
                                <div className={styles.arrowsWrapper}>
                                  <div
                                    className={cn(styles.iconWrapper, {
                                      [styles.disabled]:
                                        scrollState?.[index]?.isAtStart,
                                    })}
                                    onClick={() => handleLeftArrowClick(index)}
                                  >
                                    <i className={cn('icon-left-arrow')} />
                                  </div>
                                  <div
                                    className={cn(styles.iconWrapper, {
                                      [styles.disabled]:
                                        scrollState?.[index]?.isAtEnd,
                                    })}
                                    onClick={() => handleRightArrowClick(index)}
                                  >
                                    <i className={cn('icon-right-arrow')} />
                                  </div>
                                </div>
                              )}
                              <span
                                className={styles.seeAll}
                                onClick={() => onSeeHandle(item)}
                              >
                                See all
                              </span>
                            </div>
                          </div>
                          <div className={styles.cardRow}>
                            <div
                              className={styles.cardsWrapper}
                              ref={refs?.current?.[index]}
                              onScroll={() => handleScroll(index)}
                            >
                              {item?.exercises?.map((exercise: any) => (
                                <ExerciseCard
                                  isShareable
                                  isAddable={
                                    user?.type === USER_TYPES.THERAPIST
                                  }
                                  cardData={exercise}
                                  onActionClick={onAction}
                                  onFavoriteClick={onFavorite}
                                  onCardClick={onCardClick}
                                  onShare={onExerciseShare}
                                  size={isMobileScreen ? 'small' : 'large'}
                                  isFavoritable={!!user?.uuid}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {location.pathname.includes('care') && index === 1 && (
                          <div
                            className={styles.feedbackBannerWrapper}
                            onClick={onFeedbackBanner}
                          >
                            <div className={styles.leftBlock}>
                              <img src={ThinkingFace} alt="Icon" />
                              <span>
                                What’s missing? Add any ideas for new content or
                                tools you’d like to see.
                              </span>
                            </div>
                            <i className={cn('icon-right-arrow')} />
                          </div>
                        )}
                        {!location.pathname.includes('care') &&
                          index === 0 &&
                          !selectedCategory &&
                          !profile?.acceptedCounts && (
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
                                    Get a care plan, send messages, book
                                    sessions and more.
                                  </span>
                                )}
                                {!user?.uuid && (
                                  <span
                                    className={styles.therapistsInfoLabelBold}
                                  >
                                    Got a connection code from your therapist?
                                  </span>
                                )}
                                {!user?.uuid && (
                                  <span className={styles.therapistsInfoLabel}>
                                    Download the client companion app for iOS or
                                    Android
                                  </span>
                                )}
                                {user?.uuid && (
                                  <div
                                    className={styles.therapistsActionWrapper}
                                  >
                                    <Button
                                      label={'Connect your therapist'}
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
                      </>
                    ))}
                  </>
                )}
            </div>
          )}
          {!selectedCategory &&
            !user?.uuid &&
            location.pathname.includes('care') && (
              <div className={styles.bottomInfoWrapper}>
                <span className={styles.infoLabel}>
                  🙌 Our mission is to make mental health tools accessible and
                  approachable for everyone.
                </span>
                <span className={styles.infoLabel}>
                  The materials on Offload are for educational and informational
                  purposes. They are designed to support, not replace,
                  professional therapy or counselling.{' '}
                </span>
              </div>
            )}
          {addCardShow && (
            <AppModal width={706} {...modalHandlers} withBorder={false}>
              <AddClientModal
                data={modalHandlers.metaData}
                setAddCardShow={setAddCardShow}
              />
            </AppModal>
          )}
          {connectShow && (
            <AppModal
              width={isMobileScreen ? '100%' : 375}
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
          {shareShow && (
            <AppModal
              width={375}
              {...modalHandlers}
              withBorder={false}
              className={styles.shareModal}
            >
              <ExerciseShareModal
                setCloseModalShow={setShareShow}
                exercise={modalHandlers.metaData}
              />
            </AppModal>
          )}
          {feedbackShow && (
            <AppModal width={389} {...modalHandlers}>
              <FeedbackModal setFeedbackShow={setFeedbackShow} />
            </AppModal>
          )}
        </div>
      )}
    </>
  );
};
export default Care;
