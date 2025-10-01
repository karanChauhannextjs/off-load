import React, { useMemo } from 'react';

import styles from './DatePicker.module.scss';
import { useIntl } from 'react-intl';
import cn from "classnames";

interface DateInputControlProps {
  currentYear: number;
  currentMonth: number;
  navigateToPrevMonth: () => void;
  navigateToNextMonth: () => void;
}

const DatePickerControl: React.FC<DateInputControlProps> = ({
                                                              currentYear,
                                                              currentMonth,
                                                              navigateToPrevMonth,
                                                              navigateToNextMonth,
                                                            }) => {
  const intl = useIntl();
  const monthNames = useMemo(() => [
    intl.formatMessage({ id: 'datepicker.january', defaultMessage: 'Jan' }),
    intl.formatMessage({ id: 'datepicker.february', defaultMessage: 'Feb' }),
    intl.formatMessage({ id: 'datepicker.march', defaultMessage: 'Mar' }),
    intl.formatMessage({ id: 'datepicker.april', defaultMessage: 'Apr' }),
    intl.formatMessage({ id: 'datepicker.may', defaultMessage: 'May' }),
    intl.formatMessage({ id: 'datepicker.june', defaultMessage: 'Jun' }),
    intl.formatMessage({ id: 'datepicker.july', defaultMessage: 'Jul' }),
    intl.formatMessage({ id: 'datepicker.august', defaultMessage: 'Aug' }),
    intl.formatMessage({ id: 'datepicker.september', defaultMessage: 'Sep' }),
    intl.formatMessage({ id: 'datepicker.october', defaultMessage: 'Oct' }),
    intl.formatMessage({ id: 'datepicker.november', defaultMessage: 'Nov' }),
    intl.formatMessage({ id: 'datepicker.december', defaultMessage: 'Dec' }),
  ], []);


  return (
      <div className={styles.dateControl}>
          <div className={styles.dateControlPreview}>
              <span>{monthNames[currentMonth]}</span>{' '}
              <span>{currentYear}</span>
          </div>
          <div className={styles.dateControlAction}>
              <i className={cn('icon-left-arrow', styles.arrowIcon)} onClick={navigateToPrevMonth}/>
              <i className={cn('icon-right-arrow', styles.arrowIcon)} onClick={navigateToNextMonth}/>
          </div>
      </div>
  );
};

export default DatePickerControl;
