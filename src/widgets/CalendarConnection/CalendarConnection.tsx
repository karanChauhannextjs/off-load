import React from 'react';
import cn from 'classnames';

import { Button } from '@shared/ui';
import calendar from '@assets/images/google-calendar.png';
import styles from './CalendarConnection.module.scss';
import { CalendarConnectionProps } from './CalendarConnection.types.ts';

const CalendarConnection: React.FC<CalendarConnectionProps> = (props) => {
  const { className, connected, onClickConnect, onClickDisconnect } = props;
  return (
    <div className={cn(styles.wrapper, className)}>
      <span className={styles.title}>Calendar connections</span>
      <div className={styles.connectWrapper}>
        <div className={styles.calendarWrapper}>
          <img src={calendar} alt="calendar" />
          <span className={styles.label}>Google Calendar</span>
        </div>
        {connected ? (
          <div>
            <i
              className={cn('icon-bin', styles.iconBin)}
              onClick={onClickDisconnect}
            />
          </div>
        ) : (
          <Button
            className={styles.button}
            label={'Connect'}
            onClick={onClickConnect}
          />
        )}
      </div>
    </div>
  );
};
export default CalendarConnection;
