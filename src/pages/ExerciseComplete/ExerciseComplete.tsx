import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { Avatar, Button } from '@shared/ui';
import Red from '@assets/svg/redSosinski.svg';
import RedStar from '@assets/svg/redStar.svg';
import {
  AddClientModal,
  ExerciseCard,
  ExerciseCloseModal,
  ExerciseShareModal,
} from '@features/index.ts';
import BlueGround from '@assets/svg/blueRound.svg';
import BlackCross from '@assets/svg/blackCross.svg';
import styles from './ExerciseComplete.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExercises } from '@store/exercises.ts';
import { USER_TYPES } from '@constants/user.ts';
import { RoutesEnum, USER_PUBLIC_BASE_URL } from '@routes/Routes.types.ts';
import CryptoJS from 'crypto-js';
import {
  currentBaseUrl,
  encodeDecodeSecretKey,
  getYouTubeEmbedUrl,
  isNumberIncluded,
} from '@utils/helpers.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { LoadingScreen } from '@pages/index.ts';
import { format } from 'date-fns';
import ExerciseAnswerShareModal from '@features/ExerciseAnswerShareModal';
import { Helmet } from 'react-helmet';

const ExerciseComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const modalHandlers = useAppModalSimpleHandlers();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const stepOneScrollable = useRef<HTMLDivElement>(null);
  const questionTitle = useRef<HTMLSpanElement>(null);
  const questionLabel = useRef<HTMLSpanElement>(null);
  // const [textareaHeight, setTextareaHeight] = useState('auto');
  const [closeModalShow, setCloseModalShow] = useState(false);
  const [step, setStep] = useState(1);
  const [updated, setUpdated] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const getExercise = useExercises((state) => state.getExercise);
  const getExerciseStatus = useExercises((state) => state.getExerciseStatus);
  const exercise = useExercises((state) => state.exercise);
  const createExerciseAnswer = useExercises(
    (state) => state.createExerciseAnswer,
  );
  const createExerciseAnswerStatus = useExercises(
    (state) => state.createExerciseAnswerStatus,
  );
  const favoriteExercise = useExercises((state) => state.favoriteExercise);
  const unFavoriteExercise = useExercises((state) => state.unFavoriteExercise);
  const reset = useExercises((state) => state.reset);
  const [answers, setAnswers] = useState<string[]>([]);
  const { therapistUuid, clientUuid } = location?.state || {};
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isReferencesOpened, setIsReferencesOpened] = useState(false);
  const [isLastMultiSingle, setIsLastMultiSingle] = useState(false);
  const [orderedQuestions, setOrderedQuestions] = useState<any[]>([]);
  const [multiQuestionAnswers, setMultiQuestionAnswers] = useState<any[]>([]);
  const [findScore, setFindScore] = useState<any>(null);
  const [titleHeight, setTitleHeight] = useState<number>(0);
  const [labelHeight, setLabelHeight] = useState<number>(0);
  const [addCardShow, setAddCardShow] = useState<boolean>(false);
  const [shareShow, setShareShow] = useState<boolean>(false);
  const [answerShareShow, setAnswerShareShow] = useState<boolean>(false);
  let scrollTimeout: any;
  const [navDirection, setNavDirection] = useState('right');
  const shareUrl = `${currentBaseUrl}/exercise/${exercise?.uuid}`;
  const title = 'Check out this therapy tool';
  const description = '100s of science-backed therapy tools | Offload';

  const handleScroll = () => {
    setIsScrolling(true);
    if (!isScrolling) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  const onFavorite = async (isFavorite: boolean, uuid: string) => {
    if (user?.uuid) {
      try {
        if (!isFavorite) {
          await favoriteExercise(uuid);
        } else {
          await unFavoriteExercise(uuid);
        }
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  const onStart = async () => {
    // const isAnsweredSome = answers.some((answer) => !!answer);
    const filteredAnswers = answers.filter((e) => e !== undefined);

    const answersArray = exercise?.questions?.map(
      (question: any, idx: number) => {
        return {
          questionId: question?.id,
          answer: CryptoJS.AES.encrypt(
            filteredAnswers?.[idx],
            encodeDecodeSecretKey,
          ).toString(),
        };
      },
    );
    const body = {
      answers: answersArray,
      multiQuestionAnswers: multiQuestionAnswers,
      exerciseUuid: exercise?.uuid,
      ...(typeof therapistUuid === 'string' &&
        user?.type === USER_TYPES?.CLIENT && { therapistUuid }),
    };
    try {
      setNavDirection('right');
      if (
        step === orderedQuestions.length + 1 &&
        user?.type
        // isAnsweredSome
      ) {
        await createExerciseAnswer(body);
        setStep(step + 1);
        const findScore = exercise.scores.find((el: any) => {
          return calculateTotalSum() >= el.from && calculateTotalSum() <= el.to;
        });
        setFindScore(findScore);
      } else if (
        step === orderedQuestions.length + 1 &&
        !user?.type
        // isAnsweredSome
      ) {
        // localStorage.setItem('exerciseCompleteData', JSON.stringify(body));
        await createExerciseAnswer(body);
        setStep(step + 1);
        const findScore = exercise.scores.find((el: any) => {
          return calculateTotalSum() >= el.from && calculateTotalSum() <= el.to;
        });
        setFindScore(findScore);
      } else {
        setStep(step + 1);
      }
    } catch (error) {
      console.log('Err', error);
    }
  };

  const onBack = () => {
    setNavDirection('left');
    setStep(step - 1);
  };

  useEffect(() => {
    if (
      step > 1 &&
      step < orderedQuestions.length + 2 &&
      !orderedQuestions[step - 2].multiAnswers &&
      !orderedQuestions?.[step - 2]?.text
    ) {
      setTimeout(() => {
        setIsKeyboardOpen(true);
      }, 150);
    } else {
      setIsKeyboardOpen(false);
    }
  }, [textareaRef, step]);

  const onClose = () => {
    if (
      user?.type === USER_TYPES.CLIENT &&
      step > 1 &&
      step < exercise?.questions?.length + 2
    ) {
      setShareShow(false);
      setAddCardShow(false);
      setCloseModalShow(true);
      modalHandlers.show();
    } else {
      reset();
      const urlParams = new URLSearchParams(location.search);
      const isFromInternal = urlParams.get('from') === 'internal';

      if (isFromInternal) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  const onChangeTextarea = (e: any) => {
    const newAnswers = [...answers];
    newAnswers[step - 2] = e.target.value;
    setAnswers(newAnswers);
  };

  const onDone = () => {
    reset();
    const urlParams = new URLSearchParams(location.search);
    const isFromInternal = urlParams.get('from') === 'internal';

    if (isFromInternal) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const onReferencesHandler = () => {
    if (!isReferencesOpened) {
      setTimeout(() => {
        if (stepOneScrollable.current) {
          stepOneScrollable.current.scrollBy({ top: 300, behavior: 'smooth' });
        }
      }, 0);
    }
    setIsReferencesOpened((prev) => !prev);
  };

  useEffect(() => {
    getExercise(location?.pathname?.split('/')[2]);
  }, []);

  useEffect(() => {
    if (exercise && getExerciseStatus === 'SUCCESS') {
      if (exercise) {
        const array = [
          ...exercise?.questions,
          ...exercise?.multiQuestions,
          ...exercise?.imageQuestions,
        ].sort((a, b) => a.order - b.order);
        setOrderedQuestions(array);
      }
      if (exercise && !exercise?.showIntro) {
        setStep(2);
      } else {
        setStep(1);
      }
      setUpdated(true);
    }
  }, [exercise, getExerciseStatus]);

  const calculateTextareaHeight = () => {
    const plussedHeight = !user?.type ? 190 : 270;
    if (textareaRef.current && nextButtonRef.current) {
      const textareaRect = textareaRef.current.getBoundingClientRect();
      const nextButtonRect = nextButtonRef.current.getBoundingClientRect();
      const availableHeight = nextButtonRect.top - textareaRect.bottom;
      // setTextareaHeight(`${availableHeight > 0 ? availableHeight + 50 : 0}px`);
      const finallyPlus = !isKeyboardOpen ? plussedHeight : 0;
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = `${availableHeight + finallyPlus}px`;
        }
      }, 200);
    }
  };

  const handleAnswerClick = (
    questionId: number,
    answerId: number,
    multiSelected: boolean,
  ) => {
    const isSelected = isAnswerSelected(questionId, answerId);

    // Early return for single-select already selected answers
    if (!multiSelected && isSelected) {
      setTimeout(() => setStep((prev) => prev + 1), 300);
      return;
    }

    setMultiQuestionAnswers((prevAnswers) => {
      const questionIndex = prevAnswers.findIndex(
        (qa) => qa.questionId === questionId,
      );
      const questionAnswers =
        questionIndex !== -1 ? prevAnswers[questionIndex] : null;

      if (multiSelected) {
        // Multi-select: toggle answer
        if (questionAnswers) {
          const answerIndex = questionAnswers.answerids.indexOf(answerId);
          const newAnswerIds =
            answerIndex === -1
              ? [...questionAnswers.answerids, answerId]
              : questionAnswers.answerids.filter((id: any) => id !== answerId);

          return prevAnswers.map((qa, index) =>
            index === questionIndex ? { ...qa, answerids: newAnswerIds } : qa,
          );
        } else {
          return [...prevAnswers, { questionId, answerids: [answerId] }];
        }
      } else {
        // Single-select: replace or add answer
        const newAnswerIds = isSelected ? [] : [answerId];

        if (questionAnswers) {
          return prevAnswers.map((qa, index) =>
            index === questionIndex ? { ...qa, answerids: newAnswerIds } : qa,
          );
        } else {
          return [...prevAnswers, { questionId, answerids: newAnswerIds }];
        }
      }
    });

    // Auto-advance for single-select new selections
    if (!multiSelected && !isSelected) {
      setTimeout(() => setStep((prev) => prev + 1), 300);
    }
  };

  const isAnswerSelected = (questionId: number, answerId: number) => {
    const questionAnswers = multiQuestionAnswers.find(
      (qa) => qa.questionId === questionId,
    );
    return !!questionAnswers && questionAnswers.answerids.includes(answerId);
  };

  const calculateTotalSum = () => {
    let totalSum = 0;
    multiQuestionAnswers.forEach((qa) => {
      const question = exercise.multiQuestions.find(
        (q: any) => q.id === qa.questionId,
      );
      if (question) {
        qa.answerids.forEach((answerId: any) => {
          const answer = question.multiAnswers.find(
            (a: any) => a.id === answerId,
          );
          if (answer && answer.value) {
            totalSum += answer.value;
          }
        });
      }
    });
    return totalSum;
  };

  const onAddClick = () => {
    if (!user.type) {
      navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
    } else {
      setAnswerShareShow(false);
      setCloseModalShow(false);
      setShareShow(false);
      setAddCardShow(true);
      modalHandlers.show(exercise);
    }
  };

  const onShareClick = async () => {
    if (!isMobileScreen) {
      setAnswerShareShow(false);
      setCloseModalShow(false);
      setAddCardShow(false);
      setShareShow(true);
      modalHandlers.show();
    } else {
      const shareData = {
        title: title,
        text: description,
        url: shareUrl,
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

  const onAnswerShareClick = async () => {
    if (!isMobileScreen) {
      setCloseModalShow(false);
      setAddCardShow(false);
      setShareShow(false);
      setAnswerShareShow(true);
      modalHandlers.show();
    } else {
      const shareData = {
        title: '',
        text: formatExerciseForSharing(
          orderedQuestions,
          answers,
          multiQuestionAnswers,
          exercise?.name,
        ),
        url: '',
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
    const element = document.getElementById('exerciseLayout');
    if (isKeyboardOpen && isMobileScreen) {
      if (element) {
        element.style.height = '60svh';
      }
    } else {
      if (element) {
        element.style.height = '100svh';
      }
    }
    const timerId = setTimeout(() => {
      window.scrollTo({
        top: -document.documentElement.offsetHeight,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);

    return () => {
      clearTimeout(timerId);
    };
  }, [isKeyboardOpen]);

  useEffect(() => {
    if (isMobileScreen) {
      calculateTextareaHeight();
    }
  }, [isKeyboardOpen, isMobileScreen]);

  useEffect(() => {
    if (questionTitle.current) {
      setTitleHeight(questionTitle.current.clientHeight);
    }
    if (questionLabel.current) {
      setLabelHeight(questionLabel.current.clientHeight);
    }
    if (
      orderedQuestions[step - 2]?.multiAnswers &&
      orderedQuestions[step - 2]?.multiSelected === false &&
      step === orderedQuestions?.length + 1
    ) {
      setIsLastMultiSingle(true);
    }
  }, [step]);

  useEffect(() => {
    if (isLastMultiSingle && step === orderedQuestions?.length + 2) {
      const filteredAnswers = answers.filter((e) => e !== undefined);
      const answersArray = exercise?.questions?.map(
        (question: any, idx: number) => {
          return {
            questionId: question?.id,
            answer: CryptoJS.AES.encrypt(
              filteredAnswers?.[idx],
              encodeDecodeSecretKey,
            ).toString(),
          };
        },
      );
      const body = {
        answers: answersArray,
        multiQuestionAnswers: multiQuestionAnswers,
        exerciseUuid: exercise?.uuid,
        ...(typeof therapistUuid === 'string' &&
          user?.type === USER_TYPES?.CLIENT && { therapistUuid }),
      };
      if (user?.type) {
        createExerciseAnswer(body);
        const findScore = exercise.scores.find((el: any) => {
          return calculateTotalSum() >= el.from && calculateTotalSum() <= el.to;
        });
        setFindScore(findScore);
      } else if (!user?.type) {
        localStorage.setItem('exerciseCompleteData', JSON.stringify(body));
        createExerciseAnswer(body);
        const findScore = exercise.scores.find((el: any) => {
          return calculateTotalSum() >= el.from && calculateTotalSum() <= el.to;
        });
        setFindScore(findScore);
      }
    }
  }, [isLastMultiSingle, step]);

  const introLength = exercise?.intro?.length || 0;

  const autoplayConfig = isMobileScreen
    ? '?autoplay=1&mute=1'
    : '?autoplay=1&mute=0';

  function isYouTubeShort(url: string) {
    return url.includes('/shorts/') || url.includes('youtube.com/shorts');
  }

  const formatExerciseForSharing = (
    orderedQuestions: any,
    answers: any,
    multiQuestionAnswers: any,
    exerciseName: string,
  ) => {
    let formattedText = `Entry from Offload:\n\n${exerciseName || '<Exercise Name>'}\n\n`;

    orderedQuestions.forEach((item: any, idx: number) => {
      const findedMultiAnswer = multiQuestionAnswers?.find(
        (el: any) => el?.questionId === item?.id,
      );

      // Handle single question/answer
      if (item?.question) {
        const answer = answers?.[idx];

        // Always add the question, show "No answer here" if no answer
        if (answer && answer.trim()) {
          formattedText += `${item.question}\n${answer}\n\n`;
        } else {
          formattedText += `${item.question}\nNo answer here\n\n`;
        }
      }

      // Handle multi-answer questions
      if (item?.multiAnswers && item?.intro) {
        const selectedAnswers: any = [];

        if (findedMultiAnswer?.answerids?.length) {
          findedMultiAnswer.answerids.forEach((answerId: number) => {
            const findedAnswer = item.multiAnswers.find(
              (el: any) => el?.id === answerId,
            );
            if (findedAnswer?.title) {
              selectedAnswers.push(findedAnswer.title);
            }
          });
        }

        // Always add the intro/question, show "No answer here" if no answers selected
        if (selectedAnswers.length > 0) {
          formattedText += `${item.intro}\n${selectedAnswers.join('\n')}\n\n`;
        } else {
          formattedText += `${item.intro}\nNo answer here\n\n`;
        }
      }
    });

    return formattedText.trim();
  };

  return (
    <>
      <Helmet>
        <title>
          {exercise?.name ? `Offload | ${exercise.name}` : 'Offload'}
        </title>
      </Helmet>
      {exercise && getExerciseStatus === 'SUCCESS' && updated ? (
        <div className={styles.pageWrapper}>
          {step > 1 &&
            !(isMobileScreen && step !== orderedQuestions.length + 2) && (
              <figure className={styles.blueWrapper}>
                <img src={BlueGround} alt="blue" />
              </figure>
            )}
          <div
            className={cn(styles.mainBlock, {
              [styles.mainBlockVideo]: exercise?.isVideo,
              [styles.fullWidth]: !!orderedQuestions?.[step - 2]?.text,
            })}
          >
            <div
              className={cn(styles.topActions, {
                [styles.stepOneActions]:
                  user?.type !== USER_TYPES.CLIENT && !isMobileScreen,
                [styles.topActionsImageQuestion]:
                  !!orderedQuestions?.[step - 2]?.text,
                [styles.lastStepActionsWrapper]:
                  step === orderedQuestions.length + 2,
              })}
            >
              {!(step === 1 || (!exercise?.showIntro && step === 2)) && (
                <span className={styles.iconWrapper} onClick={onBack}>
                  <i className={cn('icon-left-arrow', styles.arrow)} />
                </span>
              )}
              <div className={styles.shareButtonWrapper} onClick={onShareClick}>
                <i className={cn('icon-share', styles.share)} />
              </div>
              {step !== orderedQuestions.length + 2 && (
                <span className={cn(styles.iconWrapper)} onClick={onClose}>
                  <i className={cn('icon-plus', styles.plus)} />
                </span>
              )}
            </div>
            {exercise.isVideo ? (
              <div className={cn(styles.mainBody, styles.videoContainer)}>
                {user.type == USER_TYPES.THERAPIST && !isMobileScreen && (
                  <div className={styles.addButtonWrapper} onClick={onAddClick}>
                    <i className={cn('icon-plus', styles.plus)} />
                  </div>
                )}
                <iframe
                  className={`${styles.youtubeIframe} ${isYouTubeShort(exercise?.url) && !user?.type ? styles.shortsVideoSignout : ''} ${isYouTubeShort(exercise?.url) ? styles.shortsVideo : styles.regularVideo}`}
                  src={`${getYouTubeEmbedUrl(exercise.url)}${autoplayConfig}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className={styles.mainBody}>
                {user.type === USER_TYPES.THERAPIST && !isMobileScreen && (
                  <div
                    className={cn(styles.addButtonWrapper, {
                      [styles.addButtonWrapperLastStep]:
                        step > 1 && step === orderedQuestions.length + 2,
                    })}
                    onClick={onAddClick}
                  >
                    <i className={cn('icon-plus', styles.plus)} />
                  </div>
                )}
                {step === 1 && (
                  <div
                    className={cn(styles.stepOneWrapper, {
                      [styles.stepOneWrapperSignout]: !user.type,
                    })}
                  >
                    <div
                      ref={stepOneScrollable}
                      onScroll={handleScroll}
                      className={cn(styles.stepOneScrollable, {
                        [styles.scrollbarVisible]: isScrolling,
                        [styles.stepOneScrollableReference]:
                          isReferencesOpened && !user?.type,
                        [styles.stepOneScrollableReferenceSignin]:
                          isReferencesOpened && user?.type,
                        [styles.scrollableSignout]: !user?.type,
                      })}
                    >
                      <div>
                        <ExerciseCard
                          cardData={exercise}
                          onFavoriteClick={onFavorite}
                          withName={false}
                        />
                      </div>
                      <span className={styles.exerciseName}>
                        {exercise?.name}
                      </span>
                      {((exercise?.reviewFirst &&
                        exercise?.reviewFirst !== 'null') ||
                        (exercise?.reviewSecond &&
                          exercise?.reviewSecond !== 'null')) && (
                        <div className={styles.reviewWrapper}>
                          {exercise?.reviewerImage && (
                            <div className={styles.avatarWrapper}>
                              <Avatar
                                photoUrl={exercise?.reviewerImage}
                                className={styles.avatarReviewer}
                              />
                              <div className={styles.checkWrapper}>
                                <i
                                  className={cn('icon-check', styles.checkIcon)}
                                />
                              </div>
                            </div>
                          )}
                          <div className={styles.reviewInfoWrapper}>
                            <span className={styles.revLabel}>Reviewed by</span>
                            <div className={styles.reviewTexts}>
                              {exercise?.reviewFirst &&
                                exercise?.reviewFirst !== 'null' && (
                                  <strong>{exercise?.reviewFirst} </strong>
                                )}
                              {exercise?.reviewSecond &&
                                exercise?.reviewSecond !== 'null' && (
                                  <span> {exercise?.reviewSecond}</span>
                                )}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={styles.viewWrapper}>
                        <span className={styles.viewLabel}>
                          <span>
                            {exercise.formattedViewCount
                              ? exercise.formattedViewCount
                              : 1}{' '}
                            views
                          </span>
                          {exercise?.tag && exercise?.tag !== 'null' && (
                            <div className={styles.row}>
                              <span className={styles.dot}></span>
                              <span>{exercise?.tag}</span>
                            </div>
                          )}
                        </span>
                      </div>
                      {exercise?.intro && (
                        <div className={styles.introWrapper}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: exercise?.intro,
                            }}
                          />
                        </div>
                      )}
                      {exercise.reference && (
                        <div
                          className={styles.referencesWrapper}
                          onClick={onReferencesHandler}
                        >
                          <span className={styles.referenceLabel}>
                            References
                          </span>
                          <i
                            className={cn('icon-down-arrow', styles.arrowIcon, {
                              [styles.arrowUp]: isReferencesOpened,
                            })}
                          />
                        </div>
                      )}
                      {isReferencesOpened && (
                        <span className={styles.referenceText}>
                          {exercise.reference}
                        </span>
                      )}
                      {introLength > 510 && (
                        <div className={cn(styles.actionWrapperShortIntro)}>
                          <Button
                            label={'Next'}
                            onClick={onStart}
                            className={styles.longButton}
                          />
                        </div>
                      )}
                    </div>
                    {introLength <= 510 && (
                      <div
                        className={cn(styles.actionWrapper, {
                          [styles.actionWrapperSignIn]: user?.type,
                          [styles.actionReference]:
                            isReferencesOpened && step === 1,
                          [styles.actionReferenceLogIn]:
                            isReferencesOpened && step === 1 && user?.type,
                        })}
                      >
                        <Button
                          label={'Next'}
                          onClick={onStart}
                          className={styles.longButton}
                        />
                      </div>
                    )}
                  </div>
                )}
                {step > 1 &&
                  step < orderedQuestions.length + 2 &&
                  !orderedQuestions[step - 2].multiAnswers &&
                  !orderedQuestions[step - 2].text && (
                    <div
                      key={step}
                      className={cn(styles.questionsWrapper, {
                        [styles.questionsWrapperOpenedKeyboard]: isKeyboardOpen,
                        [styles.questionWrapperLoggedIn]: !!user?.uuid,
                        [styles.slideEnterFromRight]: navDirection === 'right',
                        [styles.slideEnterFromLeft]: navDirection === 'left',
                      })}
                    >
                      <span className={styles.question}>
                        {orderedQuestions[step - 2]?.question}
                      </span>
                      <span className={styles.answer}>
                        {orderedQuestions[step - 2]?.answer}
                      </span>
                      <textarea
                        id={'textarea'}
                        ref={textareaRef}
                        className={cn(styles.textArea)}
                        placeholder={'Start writing...'}
                        value={answers[step - 2] || ''}
                        maxLength={500}
                        autoFocus={true}
                        // style={{
                        //   height: !isMobileScreen ? textareaHeight : '180px',
                        // }}
                        onChange={(e) => {
                          onChangeTextarea(e);
                        }}
                        onFocus={() => {
                          setTimeout(() => {
                            setIsKeyboardOpen(true);
                          }, 80);
                        }}
                        onBlur={() => {
                          setTimeout(() => setIsKeyboardOpen(false), 100);
                        }}
                      />
                      <div
                        ref={nextButtonRef}
                        className={cn(styles.stepsButtonWrapper, {
                          [styles.stepsButtonWrapperOpenedKeyboard]:
                            isKeyboardOpen,
                        })}
                      >
                        <Button
                          label={'Next'}
                          onClick={onStart}
                          className={styles.nextButton}
                          isLoading={createExerciseAnswerStatus === 'LOADING'}
                        />
                      </div>
                    </div>
                  )}
                {step > 1 &&
                  step < orderedQuestions.length + 2 &&
                  orderedQuestions[step - 2].multiAnswers && (
                    <div
                      key={`${step}-${navDirection}`}
                      style={{ display: 'flex', width: '100%' }}
                      className={cn({
                        [styles.slideEnterFromRight]: navDirection === 'right',
                        [styles.slideEnterFromLeft]: navDirection === 'left',
                      })}
                    >
                      <div
                        key={step}
                        className={cn(
                          styles.questionsWrapper,
                          styles.multiQuestionWrapper,
                          {
                            [styles.questionWrapperLoggedIn]: !!user?.uuid,
                          },
                        )}
                      >
                        <span ref={questionTitle} className={styles.answer}>
                          {orderedQuestions[step - 2]?.title}
                        </span>
                        <span ref={questionLabel} className={styles.question}>
                          {orderedQuestions[step - 2]?.intro}
                        </span>
                        <div
                          className={styles.multiAnswersWrapper}
                          style={{
                            top:
                              titleHeight +
                              labelHeight +
                              (isMobileScreen ? 20 : 130),
                            maxHeight: `calc(100svh - ${user?.uuid ? titleHeight + labelHeight + (isMobileScreen ? 90 : 235) : titleHeight + labelHeight + (isMobileScreen ? 155 : 250)}px)`,
                          }}
                        >
                          {orderedQuestions[step - 2]?.multiAnswers.map(
                            (answer: any) => (
                              <div
                                className={cn(styles.multiAnswerRow, {
                                  [styles.selectedRow]: isAnswerSelected(
                                    orderedQuestions[step - 2].id,
                                    answer.id,
                                  ),
                                })}
                                key={answer.id}
                                onClick={() =>
                                  handleAnswerClick(
                                    orderedQuestions[step - 2].id,
                                    answer.id,
                                    orderedQuestions[step - 2].multiSelected,
                                  )
                                }
                              >
                                <span className={styles.multiAnswerLabel}>
                                  {answer.title}
                                </span>
                                <div className={styles.checkWrapper}>
                                  {isAnswerSelected(
                                    orderedQuestions[step - 2].id,
                                    answer.id,
                                  ) && (
                                    <i
                                      className={cn(
                                        'icon-check',
                                        styles.checkIcon,
                                      )}
                                    />
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                        {!(
                          orderedQuestions[step - 2].multiAnswers &&
                          orderedQuestions[step - 2].multiSelected === false
                        ) && (
                          <div
                            ref={nextButtonRef}
                            className={cn(styles.stepsButtonWrapper, {
                              [styles.stepsButtonWrapperOpenedKeyboard]:
                                isKeyboardOpen,
                            })}
                          >
                            <Button
                              label={'Next'}
                              onClick={onStart}
                              className={styles.nextButton}
                              isLoading={
                                createExerciseAnswerStatus === 'LOADING'
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                {step > 1 &&
                  step < orderedQuestions.length + 2 &&
                  !orderedQuestions[step - 2].multiAnswers &&
                  orderedQuestions[step - 2].text && (
                    <div
                      key={step}
                      className={cn(styles.imageQuestionWrapper, {
                        [styles.imageQuestionWrapperLoggedIn]: !!user?.uuid,
                        [styles.slideEnterFromRight]: navDirection === 'right',
                        [styles.slideEnterFromLeft]: navDirection === 'left',
                      })}
                    >
                      {!!orderedQuestions[step - 2].image && (
                        <div className={styles.imageWrapper}>
                          <img
                            src={orderedQuestions[step - 2].image}
                            alt="img"
                            className={styles.image}
                          />
                        </div>
                      )}
                      <div className={styles.imageQuestionText}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: orderedQuestions[step - 2].text,
                          }}
                        />
                      </div>
                      <div className={cn(styles.stepsButtonWrapper)}>
                        <Button
                          label={'Next'}
                          onClick={onStart}
                          className={styles.nextButton}
                          isLoading={createExerciseAnswerStatus === 'LOADING'}
                        />
                      </div>
                    </div>
                  )}
                {step > 1 && step === orderedQuestions.length + 2 && (
                  <div className={styles.lastStepWrapperMain}>
                    <div
                      className={cn(styles.lastStepWrapper, {
                        [styles.lastStepWrapperSignout]: !user?.type,
                      })}
                    >
                      <div className={styles.imagesWrapper}>
                        <figure>
                          <img src={RedStar} alt="blue" />
                        </figure>
                        <figure>
                          <img src={BlackCross} alt="blue" />
                        </figure>
                      </div>
                      {(exercise.isEnabledOutcome && calculateTotalSum() > 0) ||
                      (calculateTotalSum() === 0 &&
                        isNumberIncluded(exercise.scores, 0)) ? (
                        <div className={styles.scoredWrapper}>
                          <span className={styles.boldText}>
                            Scored {calculateTotalSum()}/
                            {exercise.scores[exercise.scores.length - 1]?.to}:{' '}
                            {findScore?.header}
                          </span>
                          <span className={styles.label}>
                            {findScore?.subheader}
                          </span>
                        </div>
                      ) : (
                        <div className={styles.wellDoneWrapper}>
                          <span className={styles.boldText}>Well done!</span>
                          <span className={styles.label}>
                            {exercise?.name} Complete
                          </span>
                        </div>
                      )}
                      {!exercise.isVedoe &&
                        (!!exercise?.questions?.length ||
                          !!exercise.multiQuestions?.length) && (
                          <div className={styles.mainCard}>
                            <div className={styles.cardTopRow}>
                              <div className={styles.cardTopWrapper}>
                                {exercise?.icon && (
                                  <div className={styles.figure}>
                                    <img
                                      src={exercise?.icon}
                                      alt="Icon"
                                      className={styles.exerciseIcon}
                                    />
                                  </div>
                                )}
                                <div className={styles.titleWrapper}>
                                  {exercise?.name && (
                                    <span className={styles.title}>
                                      {exercise?.name}
                                    </span>
                                  )}
                                  <span className={styles.time}>
                                    {format(new Date(Date.now()), 'h:mm a')}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant={'tertiary'}
                                className={cn(styles.shareButton)}
                                icon={'share'}
                                label={'Share'}
                                onClick={onAnswerShareClick}
                              />
                            </div>
                            <div className={styles.answersWrapper}>
                              {/*.filter((e) => !e?.text && !e.image)*/}
                              {orderedQuestions.map(
                                (item: any, idx: number) => {
                                  const findedMultiAnswer =
                                    multiQuestionAnswers?.find(
                                      (el: any) => el?.questionId === item?.id,
                                    );
                                  return (
                                    <div key={item?.id}>
                                      {item?.question && (
                                        <div className={styles.answerBlock}>
                                          {item?.question && (
                                            <span className={styles.title}>
                                              {item?.question}
                                            </span>
                                          )}
                                          {answers?.[idx] ? (
                                            // <span className={styles.label}>
                                            //   {answers?.[idx]}
                                            // </span>
                                            <div
                                              className={styles.label}
                                              dangerouslySetInnerHTML={{
                                                __html: answers?.[idx]?.replace(
                                                  /\n/g,
                                                  '<br/>',
                                                ),
                                              }}
                                            ></div>
                                          ) : (
                                            <span className={styles.label}>
                                              No answer here
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      {item?.multiAnswers && (
                                        <div className={styles.answerBlock}>
                                          {item?.intro && (
                                            <span className={styles.title}>
                                              {item.intro}
                                            </span>
                                          )}
                                          <div className={styles.answerBlock}>
                                            {findedMultiAnswer?.answerids?.map(
                                              (answerId: any) => {
                                                const findedAnswer =
                                                  item?.multiAnswers?.find(
                                                    (el: any) =>
                                                      el?.id === answerId,
                                                  );
                                                return (
                                                  <span
                                                    className={styles.label}
                                                  >
                                                    {findedAnswer?.title}
                                                  </span>
                                                );
                                              },
                                            )}
                                            {!findedMultiAnswer?.answerids
                                              ?.length && (
                                              <span className={styles.label}>
                                                No answer here
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                    <div className={styles.lastStepActionWrapper}>
                      <Button
                        className={cn(styles.longButton, styles.doneButton)}
                        label={'Done'}
                        onClick={onDone}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {step > 1 &&
            !(isMobileScreen && step !== orderedQuestions.length + 2) && (
              <figure
                className={cn(styles.redWrapper, {
                  [styles.redWrapperSignIn]: !!user?.type,
                })}
              >
                <img src={Red} alt="blue" />
              </figure>
            )}
          {closeModalShow && (
            <AppModal
              width={389}
              {...modalHandlers}
              withBorder={false}
              closeIcon={false}
              disableClosingModal
            >
              <ExerciseCloseModal
                users={{ therapistUuid, clientUuid }}
                setCloseModalShow={setCloseModalShow}
              />
            </AppModal>
          )}

          {addCardShow && (
            <AppModal width={706} {...modalHandlers} withBorder={false}>
              <AddClientModal
                data={modalHandlers.metaData}
                setAddCardShow={setAddCardShow}
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
                exercise={exercise}
              />
            </AppModal>
          )}
          {answerShareShow && (
            <AppModal
              width={375}
              {...modalHandlers}
              withBorder={false}
              className={styles.shareModal}
            >
              <ExerciseAnswerShareModal
                setCloseModalShow={setAnswerShareShow}
                data={formatExerciseForSharing(
                  orderedQuestions,
                  answers,
                  multiQuestionAnswers,
                  exercise?.name,
                )}
              />
            </AppModal>
          )}
        </div>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
};
export default ExerciseComplete;
