import React, { useEffect, useState } from 'react';
import styles from './ExerciseAnswerCard.module.scss';
import { MoodAnswerCardProps } from './ExerciseAnswerCard.types.ts';
import { dateFormatter2, encodeDecodeSecretKey } from '@utils/helpers.ts';
import { format } from 'date-fns';
import CryptoJS from 'crypto-js';
import cn from 'classnames';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { MultiExerciseModal } from '@features/index.ts';
import { useNavigate } from 'react-router-dom';
import { RoutesEnum, USER_PUBLIC_BASE_URL } from '@routes/Routes.types.ts';

const ExerciseAnswerCard: React.FC<MoodAnswerCardProps> = (props) => {
  const { data, shouldPrintDate } = props;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const modalHandlers = useAppModalSimpleHandlers();
  const [showMultiAnswerModal, setShowMultiAnswerModal] = useState(false);
  const [findScore, setFindScore] = useState<any>(null);
  const [orderedQuestions, setOrderedQuestions] = useState<any[]>([]);

  const onSeeHandler = () => {
    if (user?.uuid) {
      setShowMultiAnswerModal(true);
      modalHandlers.show();
    } else {
      navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
    }
  };

  useEffect(() => {
    if (data) {
      const array = [
        ...data?.exercise?.questions,
        ...data?.exercise?.multiQuestions,
      ].sort((a, b) => a.order - b.order);
      setOrderedQuestions(array);
      const findScore = data?.exercise?.scores?.find((el: any) => {
        return data?.score >= el?.from && data?.score <= el?.to;
      });
      setFindScore(findScore);
    }
  }, [data]);

  return (
    <div className={styles.moodCardWrapper}>
      {data?.date && shouldPrintDate && (
        <span className={styles.date}>{dateFormatter2(data?.date * 1000)}</span>
      )}
      <div className={styles.mainCard}>
        <div className={styles.cardTopWrapper}>
          {data?.exercise?.exercise?.icon && (
            <div className={styles.figure}>
              <img
                src={data?.exercise?.exercise?.icon}
                alt="Mood"
                className={styles.exerciseIcon}
              />
            </div>
          )}
          <div className={styles.titleWrapper}>
            {data?.exercise?.exercise?.name && (
              <span className={styles.title}>
                {data?.exercise?.exercise?.name}
              </span>
            )}
            {data?.date && (
              <span className={styles.time}>
                {format(new Date(data?.date * 1000), 'h:mm a')}
              </span>
            )}
          </div>
        </div>
        {!data.exercise?.exercise?.isMultiValueable ? (
          <div className={styles.answersWrapper}>
            {orderedQuestions.map((item: any) => (
              <div key={item?.id}>
                {item.question && (
                  <div className={styles.answerBlock}>
                    {item?.question?.question && (
                      <span className={styles.title}>
                        {item?.question?.question}
                      </span>
                    )}
                    {CryptoJS.AES.decrypt(
                      item?.answer,
                      encodeDecodeSecretKey,
                    )?.toString(CryptoJS.enc.Utf8) ? (
                      <div className={styles.label}
                           dangerouslySetInnerHTML={{
                             __html: CryptoJS.AES.decrypt(
                               item?.answer,
                               encodeDecodeSecretKey,
                             )?.toString(CryptoJS.enc.Utf8).replace(/\n/g, '<br/>'),
                           }}
                      >
                      </div>
                    ) : (
                      <span className={styles.label}>No answer here</span>
                    )}
                  </div>
                )}
                {item.multiQuestion && (
                  <div className={styles.answerBlock}>
                    {item.multiQuestion.intro && (
                      <span className={styles.title}>
                        {item.multiQuestion.intro}
                      </span>
                    )}
                    <div className={styles.answerBlock}>
                      {item?.answers?.length > 0 ? (
                        item?.answers?.map((item: any) => (
                          <span
                            key={item?.title}
                            className={styles.answersBlock}
                          >
                            {item?.title}
                          </span>
                        ))
                      ) : (
                        <span className={styles.label}>No answer here</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.multiAnswerWrapper}>
            <div className={styles.seeWrapper} onClick={onSeeHandler}>
              <span>See all answers</span>
              <i className={cn('icon-right-arrow')} />
            </div>
            <div className={styles.scoresWrapper}>
              <span className={styles.scoreLabel}>
                Scored {data?.exercise?.score}/
                {data?.exercise?.exercise?.maxScore}: {findScore?.header}
              </span>
            </div>
          </div>
        )}
      </div>
      {showMultiAnswerModal && (
        <AppModal
          width={552}
          {...modalHandlers}
          withBorder={false}
          className={styles.multiAnswerModal}
          setStateAction={setShowMultiAnswerModal}
        >
          <MultiExerciseModal data={data?.exercise} date={data?.date} />
        </AppModal>
      )}
    </div>
  );
};
export default ExerciseAnswerCard;
