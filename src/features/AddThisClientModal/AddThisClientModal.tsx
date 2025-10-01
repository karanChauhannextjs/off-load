import React, { useEffect, useRef, useState } from 'react';
import styles from './AddThisClientModal.module.scss';
import { AddThisClientModalProps } from './AddThisClientModal.types.ts';
import cn from 'classnames';
import { ExerciseCard } from '@features/index.ts';
import { useExercises } from '@store/exercises.ts';
import { EXERCISE_PUBLIC_BASE_URL } from '@routes/Routes.types.ts';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@pages/index.ts';
import toast from 'react-hot-toast';
import { GroupAll } from '@constants/constants.ts';
import { USER_TYPES } from '@constants/user.ts';

const AddThisClientModal: React.FC<AddThisClientModalProps> = (props) => {
  const { data } = props;
  const navigate = useNavigate();
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [selectedGroup, setSelectedGroup] = useState<any>(GroupAll);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [scrollState, setScrollState] = useState<any>(null);
  const getExercises = useExercises((state) => state.getExercises);
  const getExercisesStatus = useExercises((state) => state.getExercisesStatus);
  const exercises = useExercises((state) => state.exercises);
  const getFavoriteExercises = useExercises(
    (state) => state.getFavoriteExercises,
  );
  const getFavoriteExercisesStatus = useExercises(
    (state) => state.getFavoriteExercisesStatus,
  );
  const favoriteExercise = useExercises((state) => state.favoriteExercise);
  const unFavoriteExercise = useExercises((state) => state.unFavoriteExercise);
  const favoriteExercises = useExercises((state) => state.favoriteExercises);
  const joinExercise = useExercises((state) => state.joinExercise);
  const unJoinExercise = useExercises((state) => state.unJoinExercise);
  const viewExercise = useExercises((state) => state.viewExercise);
  const [pageData, setPageData] = useState<any[]>([]);
  const [pageDataGroup, setPageDataGroup] = useState<any[] | null>([]);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<any[]>([]);
  const refGroups = useRef<HTMLDivElement>(null);
  let cardWidth = isMobileScreen ? 162 : 187;
  let gruopWrapperWidth = 120;
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const getGroups = useExercises((state) => state.getGroups);
  const getGroupsStatus = useExercises((state) => state.getGroupsStatus);
  const groups = useExercises((state) => state.groups);
  const getGroupCategories = useExercises((state) => state.getGroupCategories);
  const getGroupCategoriesStatus = useExercises(
    (state) => state.getGroupCategoriesStatus,
  );
  const groupCategories = useExercises((state) => state.groupCategories);
  const [scrollStateGroups, setScrollStateGroups] = useState({
    isAtStart: false,
    isAtEnd: false,
    hasScroll: false,
  });

  const onAction = async (type: string, card: any) => {
    try {
      // [data?.isActiveChat?.client?.uuid]
      if (type === 'add') {
        const body = !!data?.isActiveChat?.client?.uuid
          ? {
              uuids: [data?.isActiveChat?.client?.uuid],
            }
          : {
              emails: [data?.isActiveChat?.email],
            };
        await joinExercise(body, card?.uuid);
        setIsChanged(!isChanged);
        toast.success('Changes Saved!', {
          style: { width: 335 },
        });
      }
      if (type === 'delete') {
        await unJoinExercise({ email: data?.isActiveChat?.email }, card?.uuid);
        setIsChanged(!isChanged);
        toast.success('Changes Saved!', { style: { width: 335 } });
      }
    } catch (err) {
      console.log('error', err);
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
      console.log('error', error);
    }
  };

  const onCardClick = (card: any) => {
    if (card?.isActive) {
      viewExercise(card?.uuid);
      localStorage.setItem('fromAddThisClientID', data?.isActiveChat?.id);
      localStorage.setItem(
        'selectedCategory',
        JSON.stringify(selectedCategory),
      );
      localStorage.setItem('scrollPositionAddModal', scrollPosition.toString());
      navigate(`${EXERCISE_PUBLIC_BASE_URL}/${card?.uuid}?from=internal`);
    }
  };

  const onSeeHandle = (category: any) => {
    setSelectedCategory(category);
  };

  const onBackHandler = () => {
    setSelectedCategory(null);
  };

  const handleLeftArrowClick = (index: number) => {
    if (refs.current[index] && refs.current[index].current) {
      (refs.current[index].current as any).scrollBy({ left: -cardWidth - 16 });
    }
  };

  const handleRightArrowClick = (index: number) => {
    if (refs.current[index] && refs.current[index].current) {
      (refs.current[index].current as any).scrollBy({ left: cardWidth + 16 });
    }
  };

  const handleScroll = (index: number) => {
    const wrapper = refs.current[index].current;
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

  const handleScrollMain = () => {
    if (mainRef.current) {
      setScrollPosition(mainRef.current.scrollTop);
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

  const onGroupClick = async (group: any) => {
    setSelectedGroup(group);
    getGroupCategories(group.uuid, 1);
    localStorage.setItem('selectedGroup', JSON.stringify(group));
    if (group?.uuid !== 'all') {
      window.location.hash = '#selected_group';
    } else {
      window.location.hash = '';
    }
  };

  const onGroupBackHandler = () => {
    setSelectedGroup(GroupAll);
    setPageDataGroup(null);
    localStorage.removeItem('selectedGroup');
    window.location.hash = '';
  };

  useEffect(() => {
    setPageDataGroup(groupCategories || []);
  }, [groupCategories]);

  useEffect(() => {
    getGroups();
    localStorage.removeItem('fromAddThisClientID');
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setScrollState(
      pageData?.map((item: any) => ({
        isAtStart: true,
        isAtEnd: item?.exercises.length < 6,
      })),
    );
  }, [pageData]);

  useEffect(() => {
    getExercises(data?.isActiveChat?.email);
    getFavoriteExercises(data?.isActiveChat?.email);
  }, [isChanged]);

  useEffect(() => {
    setPageData([]);
    if (exercises && favoriteExercises) {
      if (exercises?.length) {
        refs.current = exercises?.map(() => React.createRef());
      }
      if (
        favoriteExercises?.length &&
        getFavoriteExercisesStatus === 'SUCCESS' &&
        getExercisesStatus === 'SUCCESS'
      ) {
        exercises?.splice(1, 0, {
          category: { id: new Date(), name: 'Favorites' },
          exercises: favoriteExercises,
        });
        setPageData(exercises);
      } else {
        setPageData(exercises);
      }
    }
  }, [exercises, favoriteExercises]);

  useEffect(() => {
    if (pageData.length) {
      const selectedCategory = JSON.parse(
        localStorage.getItem('selectedCategory') ?? '{}',
      );
      if (selectedCategory?.category) {
        setSelectedCategory(selectedCategory);
      } else {
        const savedScrollPosition = localStorage.getItem(
          'scrollPositionAddModal',
        );
        if (mainRef.current && savedScrollPosition) {
          mainRef.current.scrollTo({
            top: parseInt(savedScrollPosition, 10),
            behavior: 'smooth',
          });
          setTimeout(() => {
            localStorage.removeItem('scrollPositionAddModal');
          }, 5000);
        }
      }
      localStorage.removeItem('selectedCategory');
    }
  }, [pageData]);

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
    if (groups && groups.length > 0) {
      // Small timeout to ensure DOM is fully rendered
      setTimeout(checkScrollAvailability, 0);
    }

    const selectedGroup = JSON.parse(
      localStorage.getItem('selectedGroup') ?? '{}',
    );

    if (selectedGroup.name && groups?.length && getGroupsStatus === 'SUCCESS') {
      setSelectedGroup(selectedGroup);
      getGroupCategories(selectedGroup.uuid, 1);
      setTimeout(() => {
        localStorage.removeItem('selectedGroup');
      }, 1000);
    }
  }, [groups]);

  return (
    <div
      ref={mainRef}
      onScroll={handleScrollMain}
      className={cn(styles.pageWrapper, {
        [styles.selectedCategoryWrapper]: selectedCategory,
      })}
    >
      <div className={styles.titleWrapper}>
        <span className={styles.title}>Add to this client</span>
      </div>
      {selectedGroup &&
        !selectedCategory &&
        selectedGroup.uuid !== 'all' &&
        isMobileScreen && (
          <div className={styles.groupBackWrapper}>
            <i
              className={cn('icon-left-arrow', styles.groupBackMobile)}
              onClick={onGroupBackHandler}
            />
            <span className={styles.groupNameTitleMobile}>
              {selectedGroup?.name}
            </span>
          </div>
        )}
      {!selectedCategory &&
        ((isMobileScreen &&
          (selectedGroup?.uuid === 'all' || !selectedGroup)) ||
          !isMobileScreen) &&
        !!groups?.length && (
          <div className={styles.groupsMain}>
            {!isMobileScreen && (
              <span
                className={cn(styles.groupArrowWrapper, styles.firstWrapper, {
                  [styles.disabled]: scrollStateGroups.isAtStart,
                })}
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
              {[{ uuid: 'all', name: 'All' }, ...groups]?.map((group: any) => (
                <div
                  className={cn(styles.groupWrapper, {
                    [styles.active]: selectedGroup?.uuid === group?.uuid,
                  })}
                  onClick={() => {
                    onGroupClick(group);
                  }}
                >
                  <span className={styles.groupName}>{group?.name}</span>
                </div>
              ))}
            </div>
            {!isMobileScreen && (
              <span
                className={cn(styles.groupArrowWrapper, styles.secondWrapper, {
                  [styles.disabled]: scrollStateGroups.isAtEnd,
                })}
                onClick={handleRightArrowClickGroups}
              >
                <i className={cn('icon-right-arrow')} />
              </span>
            )}
          </div>
        )}
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
                              [styles.disabled]: scrollState?.[index]?.isAtEnd,
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
                          isAddable={user?.type === USER_TYPES.THERAPIST}
                          cardData={exercise}
                          onActionClick={onAction}
                          onFavoriteClick={onFavorite}
                          onCardClick={onCardClick}
                          size={isMobileScreen ? 'small' : 'large'}
                          isFavoritable={!!user?.uuid}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ))}
          </>
        )}
      {getGroupCategoriesStatus === 'LOADING' && <LoadingScreen />}
      {selectedCategory ? (
        <div className={styles.selectedWrapper}>
          <div className={styles.iconWrapper} onClick={onBackHandler}>
            <i className={cn('icon-left-arrow')} />
          </div>
          <div className={styles.categoryNameWrapper}>
            <span className={styles.subtitle}>
              {selectedCategory?.category?.name}
            </span>
          </div>
          <div className={styles.selectedCardMain}>
            {selectedCategory?.exercises?.map((item: any) => (
              <ExerciseCard
                isAddable
                cardData={item}
                onCardClick={onCardClick}
                onActionClick={onAction}
                onFavoriteClick={onFavorite}
                size={isMobileScreen ? 'medium' : 'large'}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.main} ref={mainRef} onScroll={handleScrollMain}>
          {(getExercisesStatus === 'LOADING' ||
            getFavoriteExercisesStatus === 'LOADING') &&
            !pageData?.length && <LoadingScreen />}

          {!selectedCategory &&
            (selectedGroup?.uuid === 'all' || !selectedGroup) && (
              <>
                {pageData?.map((item, index) => (
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
                        ref={refs.current[index]}
                        onScroll={() => handleScroll(index)}
                      >
                        {item?.exercises?.map((exercise: any) => (
                          <ExerciseCard
                            isAddable={!exercise?.isJoined}
                            isDeletable={exercise?.isJoined}
                            cardData={exercise}
                            onActionClick={onAction}
                            onFavoriteClick={onFavorite}
                            onCardClick={onCardClick}
                            size={isMobileScreen ? 'small' : 'large'}
                          />
                        ))}
                        <div style={{ display: 'flex', width: 100 }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
        </div>
      )}
    </div>
  );
};
export default AddThisClientModal;
