import React from 'react';
import cn from 'classnames';

import { ScheduleCardProps } from '@shared/ui/ScheduleCard/ScheduleCard.types.ts';
import styles from './ScheduleCard.module.scss';
import {modifyWord} from "@utils/helpers.ts";

const ScheduleCard: React.FC<ScheduleCardProps> = (props) => {
  const {
    className,
    disabled,
    name,
    end_time,
    start_time,
    day,
    session_type,
    type,
    onClick,
  } = props;

  return (
    <div
      className={cn(styles.wrapper, { [styles.disabled]: disabled }, className)}
      onClick={() => {
        if (onClick && !disabled) {
          onClick();
        }
      }}
    >
      <div className={styles.row}>
        <span className={styles.time}>
          {day ? day+',' : ''} {' '}
          {start_time + ' - ' + end_time}
        </span>
        <i
          className={cn(`icon-${type}`, styles.icon, {
            [styles.inPersonIcon]: type === 'live-text',
          })}
        />
      </div>
      <span className={styles.label}>{name}</span>
      <div className={styles.typeWrapper}>
        <span className={cn(styles.colorCircle, styles[session_type])}></span>
        {session_type && (
          <span className={styles.sessionType}>{modifyWord(session_type)}</span>
        )}
      </div>
    </div>
  );
};

export default ScheduleCard;
