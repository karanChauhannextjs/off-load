import styles from './MultiExerciseModal.module.scss';
import React, { useEffect, useState } from 'react';
import { MultiExerciseModalProps } from '@features/MultiExerciseModal/MultiExerciseModal.types.ts';
import { dateFormatter2, encodeDecodeSecretKey } from '@utils/helpers.ts';
import { format } from 'date-fns';
import CryptoJS from 'crypto-js';

const MultiExerciseModal: React.FC<MultiExerciseModalProps> = (props) => {
  const { data, date } = props;
  const [findScore, setFindScore] = useState<any>(null);
  const [orderedQuestions, setOrderedQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      const array = [...data?.questions, ...data?.multiQuestions].sort(
        (a, b) => a.order - b.order,
      );
      setOrderedQuestions(array);
      const findScore = data?.exercise?.scores?.find((el: any) => {
        return data?.score >= el?.from && data?.score <= el?.to;
      });
      setFindScore(findScore);
    }
  }, [data]);

  return (
    <div className={styles.moodCardWrapper}>
      <div className={styles.mainCard}>
        <div className={styles.cardTopWrapper}>
          {data?.exercise?.icon && (
            <div className={styles.figure}>
              <img
                src={data?.exercise?.icon}
                alt="Mood"
                className={styles.exerciseIcon}
              />
            </div>
          )}
          <div className={styles.titleWrapper}>
            {data?.exercise?.name && (
              <span className={styles.title}>{data?.exercise?.name}</span>
            )}
            {date && (
              <span className={styles.time}>
                {dateFormatter2(date * 1000)},<span> </span>
                {format(new Date(date * 1000), 'h:mm a')}
              </span>
            )}
          </div>
        </div>
        <div className={styles.scoresWrapper}>
          <span className={styles.scoreLabel}>
            Scored {data?.score}/{data?.exercise?.maxScore}: {findScore?.header}
          </span>
        </div>
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
                      item?.answers?.map((item :any) => (
                        <span key={item?.title} className={styles.answersBlock}>
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
      </div>
    </div>
  );
};
export default MultiExerciseModal;
