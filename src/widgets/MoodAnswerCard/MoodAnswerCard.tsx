import React from 'react';
import styles from './MoodAnswerCard.module.scss';
import { MoodAnswerCardProps } from './MoodAnswerCard.types.ts';
import CryptoJS from 'crypto-js';
import {encodeDecodeSecretKey, formatDate} from '@utils/helpers.ts';
import { FeelingStates } from '@constants/constants.ts';
import {format, parseISO} from 'date-fns';
import checkin1 from '../../assets/svg/mood1.svg';
import checkin2 from '../../assets/svg/mood2.svg';
import checkin3 from '../../assets/svg/mood3.svg';
import checkin4 from '../../assets/svg/mood4.svg';
import checkin5 from '../../assets/svg/mood5.svg';

const MoodAnswerCard: React.FC<MoodAnswerCardProps> = (props) => {
  const { data, shouldPrintDate } = props;

  const images: { [key: number]: string } = {
    1: checkin1,
    2: checkin2,
    3: checkin3,
    4: checkin4,
    5: checkin5,
  };

  return (
    <div className={styles.moodCardWrapper}>
      {data?.date && shouldPrintDate && (
        <span className={styles.date}>{formatDate(data?.date)}</span>
      )}
      <div className={styles.mainCard}>
        <div className={styles.cardTopWrapper}>
          <figure className={styles.figure}>
            <img src={images[data?.feeling]} alt="Mood" />
          </figure>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>Mood Check in</span>
            <span className={styles.time}>
              {format(parseISO(data?.createdAt), 'h:mm a')}
            </span>
          </div>
        </div>
        <div className={styles.cardInfoWrapper}>
          <span className={styles.title}>
            {FeelingStates?.[data?.feeling - 1]}
          </span>
          {data?.note && (
            <span className={styles.label}>
              {CryptoJS.AES.decrypt(data?.note, encodeDecodeSecretKey).toString(
                CryptoJS.enc.Utf8,
              )}
            </span>
          )}
        </div>
        <div className={styles.cardCheckinsWrapper}>
          {data?.causes?.map((item: any) => (
            <div className={styles.checkinWrapper}>
              <span className={styles.checkinLabel}>{item?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default MoodAnswerCard;
