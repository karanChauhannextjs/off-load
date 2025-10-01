import React from 'react';
import cn from 'classnames';

import { Button } from '@shared/ui';
import styles from './CanceledBookingModal.module.scss';
import { CanceledBookingModalProps } from './CanceledBookingModal.types.ts';
import { getTypeCall, modifyWord, timeToLongFormat } from '@utils/helpers.ts';

const CanceledBookingModal: React.FC<CanceledBookingModalProps> = (props) => {
  const { data } = props;

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>Booking Canceled</span>
      <div className={styles.block}>
        <span>{data?.name}</span>
        {data?.type && (
          <span className={styles.title}>
            {data.type === 3 ? 'Consultation' : 'Session'}
          </span>
        )}
        <div className={styles.row}>
          <i
            className={cn(
              `icon-${getTypeCall(
                data?.isInPerson,
                data?.isLiveText,
                data?.isVideoCall,
                data?.isVoiceCall,
              )}`,
              styles.icon,
            )}
          />
          {data?.type && (
            <span className={styles.label}>
              {modifyWord(
                getTypeCall(
                  data?.isInPerson,
                  data?.isLiveText,
                  data?.isVideoCall,
                  data?.isVoiceCall,
                ),
              )}
            </span>
          )}
        </div>
        <div className={styles.row}>
          <i className={cn('icon-time', styles.icon)} />
          <span className={styles.label}>
            {data.type === 1
              ? '30 minutes'
              : data.type === 2
                ? '50 minutes'
                : '15 minutes'}
          </span>
        </div>
        <div className={styles.row}>
          <i className={cn('icon-calendar', styles.icon)} />
          <span className={styles.label}>
            {data?.startTime},{timeToLongFormat(data?.day, data?.startTime)}
          </span>
        </div>
      </div>
      <div className={styles.actionWrapper}>
        <Button fullWidth label={'Done'} onClick={props.onClickDone} />
      </div>
    </div>
  );
};
export default CanceledBookingModal;
