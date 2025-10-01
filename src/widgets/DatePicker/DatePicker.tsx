import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useClickAway } from '@uidotdev/usehooks';
import {
  format,
  addDays,
  subWeeks,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
} from 'date-fns';

import styles from './DatePicker.module.scss';
import DateItem from './DateItem';
import DatePickerPopup, {
  DatePickerVerticalPlacement,
} from './DatePickerPopup.tsx';
import { formatDateToSec } from '@constants/daysAndTime.ts';
import { ITime } from '@models/availability.ts';

export interface DatePickerProps {
  value?: number | string | Date;
  minDate?: Date;
  maxDate?: Date;
  onChange: (date: string) => void;
  invalid?: boolean;
  label?: string;
  placeholder?: string;
  invalidMessage?: string;
  data?: any;
  onChangeMonth?: any
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, data, onChangeMonth }) => {
  const dateFormat = 'yyyy-MM-dd';
  const datePickerRef = useRef<HTMLDivElement>(null);
  const popupRef = useClickAway<HTMLDivElement>(() => {
    onCancelHandler();
  });

  const [verticalPlacement, setVerticalPlacement] =
    useState<DatePickerVerticalPlacement>('bottom');
  const [showPopup, setShowPopup] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth(),
  );

  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      setSelectedDate(format(dateObj, dateFormat));
      setCurrentMonth(dateObj.getMonth());
      setCurrentYear(dateObj.getFullYear());
    }
  }, [value]);

  const getDateSlots = (currentMonth: number, currentYear: number) => {
    const startMonthDay = startOfMonth(new Date(currentYear, currentMonth, 1));
    const lastMonthDay = endOfMonth(new Date(currentYear, currentMonth, 1));

    let startDate = addDays(startOfWeek(startMonthDay), 1);
    let endDate = addDays(endOfWeek(lastMonthDay), 1);

    if (startMonthDay.getDay() === 0) {
      startDate = subWeeks(startDate, 1);
    }
    if (lastMonthDay.getDay() === 0) {
      endDate = subWeeks(endDate, 1);
    }

    return eachDayOfInterval({ start: startDate, end: endDate }).map((d) =>
      format(d, dateFormat),
    );
  };

  const navigateMonthHandler = (navigateBy = 1) => {
    onChangeMonth()
    setSelectedDate(null)
    if (currentMonth + navigateBy === 12) {
      setCurrentMonth(0);
      setCurrentYear((currentState) => {
        return currentState + 1;
      });
    } else if (currentMonth + navigateBy === -1) {
      setCurrentMonth(11);
      setCurrentYear((currentState) => {
        return currentState - 1;
      });
    } else {
      setCurrentMonth((currentState) => {
        return currentState + navigateBy;
      });
    }
  };

  const selectDateHandler = (date: string) => {
    setSelectedDate(date);
    onChange(date);
  };

  const onCancelHandler = () => {
    resetValues();
    setShowPopup(false);
  };

  const resetValues = () => {
    if (value) {
      const dateObj = new Date(value);
      //setCurrentMonth(dateObj.getMonth());
      setCurrentYear(dateObj.getFullYear());
    } else {
      setCurrentYear(new Date().getFullYear());
      //setCurrentMonth(new Date().getMonth());
    }
  };

  const dateArray = useMemo<Array<string>>(
    () => getDateSlots(currentMonth, currentYear),
    [currentMonth, currentYear],
  );

  const horizontalPlacement =
    popupRef?.current?.getBoundingClientRect() &&
    popupRef?.current?.getBoundingClientRect().x + 350 >
      document.documentElement.clientWidth
      ? 'left'
      : 'right';

  useEffect(() => {
    if (showPopup) {
      if (datePickerRef.current) {
        const { top, height } = datePickerRef.current.getBoundingClientRect();
        const clientHeight = document?.documentElement?.clientHeight;
        if (top + height > clientHeight) {
          setVerticalPlacement('top');
        } else {
          setVerticalPlacement('bottom');
        }
      }
    } else {
      setVerticalPlacement('bottom');
    }
  }, [showPopup]);

  return (
    <div ref={popupRef} className={styles.datePicker}>
      <DatePickerPopup
        ref={datePickerRef}
        currentYear={currentYear}
        currentMonth={currentMonth}
        verticalPlacement={verticalPlacement}
        horizontalPlacement={horizontalPlacement}
        navigateMonth={navigateMonthHandler}
      >
        {dateArray.map((dateText, index) => {
          const date = new Date(dateText);
          const inIsThisMonth = date.getMonth() === currentMonth;
          const isDisabled = date < new Date();

          const includesDate = data.some(
            (obj: { date: number; ranges: ITime[] }) =>
              obj.date === formatDateToSec(dateText) && !!obj.ranges.length,
          );

          return (
            <DateItem
              key={index}
              isDisabled={isDisabled}
              selected={selectedDate === dateText}
              notInSelectedMonth={!inIsThisMonth}
              onClick={() => {
                if(selectedDate !== dateText) {
                  selectDateHandler(dateText)
                }
              }}
              dateObj={dateText ? new Date(dateText) : null}
              isOverrided={includesDate}
            />
          );
        })}
      </DatePickerPopup>
    </div>
  );
};

export default DatePicker;
