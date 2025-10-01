import React, { PropsWithChildren, useMemo } from 'react';
import classNames from 'classnames';

import styles from './DatePicker.module.scss';
import DatePickerControl from './DatePickerControl.tsx';
import { useIntl } from 'react-intl';

export type DatePickerVerticalPlacement = 'top' | 'bottom';
export type DatePickerHorizontalPlacement = 'left' | 'right';

interface DateInputPopupProps extends PropsWithChildren {
  currentYear: number;
  currentMonth: number;
  horizontalPlacement: DatePickerHorizontalPlacement;
  verticalPlacement: DatePickerVerticalPlacement;
  navigateMonth: (dir: -1 | 1) => void;
}

const DatePickerPopup = React.forwardRef<HTMLDivElement, DateInputPopupProps>(
  function DatePickerPopup(
    {
      currentMonth,
      currentYear,
      navigateMonth,
      children,
      verticalPlacement = 'bottom',
      horizontalPlacement = 'right',
    },
    ref,
  ) {
    const intl = useIntl();

    const days = useMemo(() => {
      return [
        intl.formatMessage({
          id: 'datepicker.monday',
          defaultMessage: 'Monday',
        }),
        intl.formatMessage({
          id: 'datepicker.tuesday',
          defaultMessage: 'Tuesday',
        }),
        intl.formatMessage({
          id: 'datepicker.wednesday',
          defaultMessage: 'Wednesday',
        }),
        intl.formatMessage({
          id: 'datepicker.thursday',
          defaultMessage: 'Thursday',
        }),
        intl.formatMessage({
          id: 'datepicker.friday',
          defaultMessage: 'Friday',
        }),
        intl.formatMessage({
          id: 'datepicker.saturday',
          defaultMessage: 'Saturday',
        }),
        intl.formatMessage({
          id: 'datepicker.sunday',
          defaultMessage: 'Sunday',
        }),
      ];
    }, []);

    return (
      <div
        ref={ref}
        className={classNames([
          styles.datePopup,
          styles[horizontalPlacement],
          styles[verticalPlacement],
        ])}
      >
        <DatePickerControl
          currentYear={currentYear}
          currentMonth={currentMonth}
          navigateToNextMonth={() => navigateMonth(1)}
          navigateToPrevMonth={() => navigateMonth(-1)}
        />
        <div className={styles.datePopupGrid}>
          {days.map((day) => {
            return (
              <span key={day} className={styles.weekCode}>
                {day.slice(0, 3)}
              </span>
            );
          })}
          {children}
        </div>
      </div>
    );
  },
);

export default DatePickerPopup;
