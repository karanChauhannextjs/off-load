import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import styles from './BookingCard.module.scss';
import { BadgeSlider } from '@features/index.ts';
import { Badge, Button, Checkbox } from '@shared/ui';
import { keyToEnumMapping } from '@constants/constants.ts';
import { BookingCardProps } from './BookingCard.types.ts';
import {
  formattedHours,
  formattedWeekdays,
  startTimestampNextMonth,
  startTimestampToday,
} from '@constants/daysAndTime.ts';
import {
  getEnumKeysFromNumbers,
  getNextSessions,
  modifyWord,
} from '@utils/helpers.ts';
import { useAvailability } from '@store/availability.ts';
import { ITimeItem } from '@models/availability.ts';
import { format } from 'date-fns';

export interface CardDataType {
  duration?: string | number;
  type?: string | number;
  day?: string | number;
  time?: string | number;
}

const BookingCard: React.FC<BookingCardProps> = (props) => {
  const {
    className,
    type,
    data,
    buttonDisabled,
    onClickBook,
    show,
    onChangeRadio,
    username,
    onClickCard,
  } = props;
  const [isAvailabilityIds, setIsAvailabilityIds] = useState<number[]>([]);
  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
  const [sessionDefId, setSessionDefId] = useState(0);
  const [consDefId, setConsDefId] = useState(0);
  const [error, setError] = useState({
    duration: false,
    type: false,
    date_and_type: false,
  });
  const [cardData, setCardData] = useState<CardDataType>({
    duration: '',
    type: '',
    day: '',
    time: '',
  });
  const [times, setTimes] = useState<ITimeItem[]>([]);
  const [timeData, setTimeData] = useState<ITimeItem[]>([]);
  const [therapistAvailabilityFormatted, setTherapistAvailabilityFormatted] =
    useState<any[]>([]);

  const getTherapistAvailability = useAvailability(
    (state) => state.getTherapistAvailability,
  );
  const therapistAvailability = useAvailability(
    (state) => state.therapistAvailability,
  );
  const [isChangedDay, setIsChangedDay] = useState<boolean>(false)

  const durationMock = [
    {
      id: 1,
      label: '30 mins',
      isActive: data?.[0]?.isActive,
      price: data?.[0]?.isActive ? data?.[0]?.price : '',
    },
    {
      id: 2,
      label: '50 mins',
      isActive: data?.[1]?.isActive,
      price: data?.[1]?.isActive ? data?.[1]?.price : '',
    },
  ];

  const onBookHandler = () => {
    const hasEmptyValues = Object.values(cardData).some(
      (value) => value === '',
    );
    const updatedError = {
      duration: hasEmptyValues && !cardData.duration && type === 'session',
      type: hasEmptyValues && !cardData.type,
      date_and_type: hasEmptyValues && (!cardData.day || !cardData.time),
    };

    if (Object.values(updatedError).some((value) => value)) {
      setError(updatedError);
    } else if (onClickBook) {
      setError(updatedError);
      onClickBook(cardData);
    }
  };

  const onClickDuration = (id: number | string) => {
    setCardData({ ...cardData, duration: id });
    setError({
      ...error,
      duration: false,
    });
  };
  const onClickType = (id: number | string) => {
    setCardData({ ...cardData, type: id });
    setError({
      ...error,
      type: false,
    });
  };

  const onClickDay = (id: number | string) => {
    setIsChangedDay(!isChangedDay);
    setCardData({ ...cardData, day: id });
    const times = [];
    const uniqueConsultations = new Set();
    const range = type === 'consultation' ? 'consultations' : 'sessions';

    for (let i = 0; i < therapistAvailability.length; i++) {
      const item = therapistAvailability[i];
      if (item?.ranges && item?.ranges[range] && id === i + 1) {
        const consultations = item.ranges[range];
        for (const consultation of consultations) {
          const matchingTimeHour = formattedHours.find(
            (timeHour: { id: number; label: string }) =>
              timeHour.label ===
              consultation.toString().toLowerCase().replace(' ', ''),
          );
          if (matchingTimeHour && !uniqueConsultations.has(consultation)) {
            times.push({
              id: matchingTimeHour.id,
              label: matchingTimeHour.label,
            });
            uniqueConsultations.add(consultation);
          }
        }
      }
    }
    setTimeData(times);
  };
  const onClickTime = (id: number | string) => {
    setCardData({ ...cardData, time: id });
    setError({
      ...error,
      date_and_type: false,
    });
  };

  const getIdsBasedOnType = (type: string, data: any) => {
    return data?.reduce((acc: number[], item: any, index: number) => {
      if (type === 'session' && item?.ranges?.sessions?.length > 0) {
        acc?.push(index + 1);
      } else if (
        type === 'consultation' &&
        item.ranges.consultations.length > 0
      ) {
        acc?.push(index + 1);
      }
      return acc;
    }, []);
  };

  useEffect(() => {
    if (!!data.length) {
      const object =
        type === 'consultation'
          ? data?.[2]
          : type === 'session' && cardData?.duration === 1
            ? data?.[0]
            : data?.[1];
      const array: number[] = Object.keys(object)
        .filter(
          (key) =>
            object?.[key] === true &&
            key !== 'isActive' &&
            key !== 'showActive',
        )
        // @ts-ignore
        .map((key) => keyToEnumMapping[key]).sort();
      setSessionTypes(getEnumKeysFromNumbers(array));
    }
  }, [data, type, cardData]);

  useEffect(() => {
    if (username) {
      getTherapistAvailability(
        username,
        Math.ceil(startTimestampToday / 1000),
        Math.ceil(startTimestampNextMonth / 1000 + 2592000),
      );
    }
  }, [username]);

  useEffect(() => {
    setIsAvailabilityIds(
      getIdsBasedOnType(type, therapistAvailabilityFormatted),
    );
    setCardData({...cardData, day:isAvailabilityIds?.[0]})
    const foundedSession = therapistAvailabilityFormatted?.find(
      (day: any) => day.ranges?.sessions?.length,
    );
    const foundedCons = therapistAvailabilityFormatted?.find(
      (day: any) => day.ranges?.consultations?.length,
    );
    const dateSession = new Date(foundedSession?.date * 1000);
    const dateCons = new Date(foundedCons?.date * 1000);
    const daySession = dateSession.getDate();
    const monthSession = dateSession.toLocaleString('en-US', {
      month: 'short',
    });
    const dayCons = dateCons.getDate();
    const monthCons = dateCons.toLocaleString('en-US', { month: 'short' });
    const matchingObjectSession = formattedWeekdays.find(
      (obj) =>
        obj.secondLabel === daySession.toString() && obj.month === monthSession,
    );
    if (matchingObjectSession) {
      setSessionDefId(matchingObjectSession?.id);
    }
    const matchingObjectCons = formattedWeekdays.find(
      (obj) =>
        obj.secondLabel === dayCons.toString() && obj.month === monthCons,
    );
    if (matchingObjectCons) {
      setConsDefId(matchingObjectCons?.id);
    }
  }, [therapistAvailabilityFormatted, times]);

  useEffect(() => {
    const id = type === 'consultation' ? consDefId : sessionDefId;
    const times = [];
    const uniqueConsultations = new Set();
    const range = type === 'consultation' ? 'consultations' : 'sessions';

    for (let i = 0; i < therapistAvailabilityFormatted?.length; i++) {
      const item = therapistAvailabilityFormatted[i];
      if (item?.ranges && item?.ranges[range] && id === i + 1) {
        const consultations = item.ranges[range];
        for (const consultation of consultations) {
          const matchingTimeHour = formattedHours.find(
            (timeHour: { id: number; label: string }) =>
              timeHour.label ===
              consultation.toString().toLowerCase().replace(' ', ''),
          );
          if (matchingTimeHour && !uniqueConsultations.has(consultation)) {
            times.push({
              id: matchingTimeHour.id,
              label: matchingTimeHour.label,
            });
            uniqueConsultations.add(consultation);
          }
        }
      }
    }
    setTimes(times)
    setTimeData(times);
  }, [sessionDefId, consDefId, therapistAvailabilityFormatted]);

  useEffect(() => {
    const currentTime = format(new Date(), 'hh:mm a');
    if (therapistAvailability?.[0]?.ranges?.sessions?.length) {
      therapistAvailability[0].ranges.sessions = getNextSessions(
        therapistAvailability?.[0]?.ranges?.sessions,
        currentTime,
      );
    }
    if (therapistAvailability?.[0]?.ranges?.consultations?.length) {
      therapistAvailability[0].ranges.consultations = getNextSessions(
        therapistAvailability?.[0]?.ranges?.consultations,
        currentTime,
      );
    }
    setTherapistAvailabilityFormatted(therapistAvailability);
  }, [therapistAvailability]);

  return (
    <div
      onClick={() => {
        if (!show) {
          if (onClickCard) {
            onClickCard();
          }
        }
      }}
      className={cn(styles.wrapper, { [styles.hidden]: !show }, className)}
    >
      <div className={styles.row}>
        <span className={styles.boldText}>{`Book a ${modifyWord(type)}`}</span>
        <Checkbox checked={show} onChange={onChangeRadio} />
      </div>
      {type === 'session' && !show && (
        <div className={styles.infoBlock}>
          <span className={styles.label}>30 mins</span>
          <span className={styles.label}>50 mins</span>
        </div>
      )}
      {type === 'consultation' && (
        <div className={styles.infoBlock}>
          <span className={styles.cyanLabel}>Free</span>
          <span className={styles.label}>15 mins</span>
        </div>
      )}
      {show && (
        <>
          {type === 'session' && (
            <div className={styles.block}>
              <div className={styles.labelsBlock}>
                <span className={styles.label}>Duration:</span>
                {error.duration && (
                  <span className={styles.error}>Please select a duration</span>
                )}
              </div>
              <div className={styles.badgesWrapper}>
                {durationMock.map((item) => {
                  return (
                    <>
                      {item?.isActive && item?.price && (
                        <Badge
                          id={item.id}
                          key={item.label}
                          className={styles.badge}
                          price={item.price}
                          label={item.label}
                          isActive={item.id === cardData.duration}
                          onClick={() => {
                            onClickDuration(item.id);
                          }}
                          variant={'secondary'}
                        />
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          )}
          <div className={styles.block}>
            <div className={styles.labelsBlock}>
              <span className={styles.label}>Type:</span>
              {error.type && (
                <span className={styles.error}>Please select a type</span>
              )}
            </div>
            <div className={styles.badgesWrapper}>
              {sessionTypes.map((item, index) => {
                return (
                  <Badge
                    id={index}
                    key={item}
                    className={styles.badge}
                    variant={'secondary'}
                    isActive={item === cardData.type}
                    label={modifyWord(item.toLowerCase())?.replace('_', ' ')}
                    onClick={() => {
                      onClickType(item);
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.labelsBlock}>
              <span className={styles.label}>Date and time:</span>
              {error.date_and_type && (
                <span className={styles.error}>Please select a time</span>
              )}
            </div>
            <BadgeSlider
              isAvailabilityId={isAvailabilityIds}
              isActiveId={
                cardData.day
                  ? cardData.day
                  : type === 'consultation'
                    ? consDefId
                    : sessionDefId
              }
              onClickItem={onClickDay}
              showItemsNumber={7}
              data={formattedWeekdays}
              className={styles.daysSlider}
            />
            {isAvailabilityIds?.length ? (
              <BadgeSlider
                className={styles.timesSlider}
                isActiveId={cardData.time}
                variant={'secondary'}
                onClickItem={onClickTime}
                showItemsNumber={
                  timeData?.length > 4
                    ? 4
                    : timeData?.length === 0
                      ? 4
                      : timeData?.length
                }
                data={!!timeData?.length ? timeData : formattedHours}
                isChanged={isChangedDay}
              />
            ) : (
              <span className={styles.noAvaText}>No availability</span>
            )}
          </div>
          <div className={styles.rowButton}>
            <Button
              disabled={buttonDisabled}
              className={styles.bookButton}
              fullWidth
              label={`Book ${modifyWord(type)}`}
              onClick={onBookHandler}
            />
          </div>
        </>
      )}
    </div>
  );
};
export default BookingCard;
