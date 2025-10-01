import React from 'react';
import classNames from 'classnames';

import styles from './DatePicker.module.scss';

interface DateItemProps {
  dateObj: Date | null;
  selected?: boolean;
  notInSelectedMonth?: boolean;
  onClick: () => void;
  isDisabled?: boolean;
  isOverrided?: boolean;
}

export const DateItem: React.FC<DateItemProps> = ({
  dateObj,
  selected,
  onClick,
  notInSelectedMonth,
  isDisabled,
  isOverrided,
}) => {
  const displayDate = dateObj?.getDate();

  return (
    <div
      onClick={() => !isDisabled && onClick()}
      className={classNames([
        styles.dateItem,
        { [styles.disabled]: isDisabled },
        { [styles.selected]: selected },
        { [styles.notInSelectedMonth]: notInSelectedMonth },
      ])}
    >
      {displayDate}
      {isOverrided && <span className={styles.dot} />}
    </div>
  );
};

export default DateItem;
