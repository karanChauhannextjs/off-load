import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import styles from './ModifyModal.module.scss';
import { Avatar, Badge, Button } from '@shared/ui';
import { ModifyModalProps } from './ModifyModal.types.ts';
import { BadgeSlider } from '@features/index.ts';
import {
  formattedHours,
  formattedWeekdays,
  startTimestampNextMonth,
  startTimestampToday,
} from '@constants/daysAndTime.ts';
import { BookingCardDataTypes } from '@widgets/BookingCard/BookingCard.types.ts';
import { CardDataType } from '@widgets/BookingCard/BookingCard.tsx';
import {
  combineDateTime,
  getEnumKeysFromNumbers,
  getNextSessions,
  getTimezoneDifferenceInSeconds,
  getTypeCall,
  modifyWord,
  timeToLongFormat,
  timeToLongFormat2,
} from '@utils/helpers.ts';
import { useBook } from '@store/book.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { BookingUpdatedModal } from '@pages/index.ts';
import { useAvailability } from '@store/availability.ts';
import { ITimeItem } from '@models/availability.ts';
import { keyToEnumMapping } from '@constants/constants.ts';
import toast from 'react-hot-toast';
import { format, parse, set } from 'date-fns';
import {USER_TYPES} from "@constants/user.ts";

const ModifyModal: React.FC<ModifyModalProps> = (props) => {
  const { data, setShowModifyModal, setThreeModalsShow } = props;
  const modalHandlers = useAppModalSimpleHandlers();
  const [showBookingUpdated, setShowBookingUpdated] = useState(false);
  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
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
  const [isAvailabilityIds, setIsAvailabilityIds] = useState<number[]>([]);
  const [sessionDefId, setSessionDefId] = useState(0);
  const [consDefId, setConsDefId] = useState(0);
  const [therapistAvailabilityFormatted, setTherapistAvailabilityFormatted] =
    useState<any[]>([]);
  const [times, setTimes] = useState<ITimeItem[]>([]);
  const [timeData, setTimeData] = useState<ITimeItem[]>([]);
  const getTherapistAvailability = useAvailability(
    (state) => state.getTherapistAvailability,
  );
  const therapistAvailability = useAvailability(
    (state) => state.therapistAvailability,
  );

  const editBook = useBook((state) => state.editBook);
  const editBookStatus = useBook((state) => state.editBookStatus);

  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const type = data?.type === 3 ? 'consultation' : 'session';

  const bookCardMockData: BookingCardDataTypes = {
    session_type: 'session',
    session_types: [1, 2, 3],
  };
  const bookCardMockData2: BookingCardDataTypes = {
    session_type: 'consultation',
    session_types: [1, 2, 3],
  };

  const onBack = () => {
    setShowModifyModal(false);
  };

  const onClickType = (id: number | string) => {
    setCardData({ ...cardData, type: id });
  };
  const onClickDay = (id: number | string) => {
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

  const formatTime = (time: any) => {
    const [hour, minute, period] = time
      .toLowerCase()
      .match(/(\d{1,2}):(\d{2})(am|pm)/)
      .slice(1);
    return `${hour % 12 || 12}:${minute} ${period.toUpperCase()}`;
  };

  const onConfirm = async () => {
    const day = formattedWeekdays.find((e) => e.id === cardData?.day);
    const time = formattedHours.find(
      (e: { id: number; label: string }) => e.id === cardData?.time,
    );
    // Combine date and time into a single Date object
    const dateString = combineDateTime(day, time);
    const date = new Date(dateString);
    // Get the time in milliseconds since January 1, 1970, 00:00:00 UTC
    const milliseconds = date.getTime();

    const dataTypes = data.type !== 3 ? bookCardMockData : bookCardMockData2;
    const hasEmptyValues = Object.values(cardData).some(
      (value) => value === '',
    );
    const updatedError = {
      duration:
        hasEmptyValues &&
        !cardData.duration &&
        dataTypes.session_type === 'session',
      type: hasEmptyValues && !cardData.type,
      date_and_type: hasEmptyValues && (!cardData.day || !cardData.time),
    };

    if (Object.values(updatedError).some((value) => value)) {
      setError(updatedError);
    }
    const newLabel = `${day?.secondLabel} ${day?.month}`;
    const formattedString = timeToLongFormat2(
      newLabel,
      formatTime(time?.label),
    );
    const formatStr = "h:mma, EEEE, MMMM do '(GMT)'";
    const dateStrModified = formattedString.replace('th', '');
    const parsedDate = parse(dateStrModified, formatStr, new Date());
    const finalDate = set(parsedDate, { year: new Date().getFullYear() });
    const formattedDateNew = format(finalDate, "MMMM d, yyyy HH:mm:ss 'GMT'");
    const body = {
      dateGMT: formattedDateNew,
      id: data?.id,
      type: data?.type,
      date: Math.floor(milliseconds / 1000) - getTimezoneDifferenceInSeconds(),
      isVideoCall: cardData?.type === 'VIDEO_CALL',
      isInPerson: cardData?.type === 'IN_PERSON',
      isVoiceCall: cardData?.type === 'VOICE_CALL',
      isLiveText: cardData?.type === 'LIVE_TEXT',
    };
    if (!updatedError.type && !updatedError.date_and_type) {
      if (!data.creator && cardData?.type === 'LIVE_TEXT') {
        toast.error(
          'Client has not signed up yet so can’t be booked onto this session type',
        );
      } else {
        try {
          const response = await editBook(body);
          setShowBookingUpdated(true);
          modalHandlers.show({
            ...data,
            ...body,
            day: `${day?.secondLabel} ${day?.month}`,
            startTime: formatTime(time?.label),
            // @ts-ignore
            bookingLink: response?.bookingLink,
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  useEffect(() => {
    if (data?.therapist?.username) {
      getTherapistAvailability(
        data?.therapist?.username,
        Math.ceil(startTimestampToday / 1000),
        Math.ceil(startTimestampNextMonth / 1000 + 2592000),
      );
    }
  }, [data?.therapist?.username]);

  useEffect(() => {
    if (!!data?.therapist?.userSessions?.length) {
      const object =
        type === 'consultation'
          ? data?.therapist?.userSessions?.[2]
          : type === 'session' && data?.type === 1
            ? data?.therapist?.userSessions?.[0]
            : data?.therapist?.userSessions?.[1];
      const array: number[] = Object.keys(object)
        .filter(
          (key) =>
            object?.[key] === true &&
            key !== 'isActive' &&
            key !== 'showActive',
        )
        // @ts-ignore
        .map((key) => keyToEnumMapping[key]);
      setSessionTypes(getEnumKeysFromNumbers(array));
    }
  }, [data, type, cardData]);

  useEffect(() => {
    setIsAvailabilityIds(
      getIdsBasedOnType(type, therapistAvailabilityFormatted),
    );
    setCardData({ ...cardData, day: isAvailabilityIds?.[0] });
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
    setTimes(times);
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
    <div className={styles.wrapper}>
      <i className={cn('icon-left-arrow', styles.iconBack)} onClick={onBack}/>
      {user?.type !== 1 && (
        <Avatar photoUrl={data?.therapist?.image} className={styles.avatar}/>
      )}
      <span>{user?.type === USER_TYPES.THERAPIST ? data?.name : data?.therapist?.name}</span>
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
        <i className={cn('icon-time', styles.icon)}/>
        <span className={styles.label}>
          {data.type === 1
            ? '30 minutes'
            : data.type === 2
              ? '50 minutes'
              : '15 minutes'}
        </span>
      </div>
      <div className={styles.row}>
        <i className={cn('icon-calendar', styles.icon)}/>
        <span className={styles.label}>
          {data?.startTime},{timeToLongFormat(data?.day, data?.startTime)}
        </span>
      </div>
      <div className={styles.line}></div>
      <div className={styles.block}>
        <span className={styles.boldLabel}>Modify booking</span>
        <div className={styles.block2}>
          <div className={styles.labelsBlock}>
            <span className={styles.label}>Type:</span>
            {error.type && (
              <span className={styles.error}> Please select a type</span>
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
        <div className={styles.block2}>
          <div className={styles.labelsBlock}>
            <span className={styles.label}>Date and time:</span>
            {error.date_and_type && (
              <span className={styles.error}> Please select a time</span>
            )}
          </div>
          <BadgeSlider
            isAvailabilityId={isAvailabilityIds}
            className={styles.badgeSlider}
            isActiveId={cardData.day}
            onClickItem={onClickDay}
            showItemsNumber={7}
            data={formattedWeekdays}
          />
          <BadgeSlider
            className={styles.badgeSlider}
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
          />
        </div>
        <Button
          fullWidth
          label={'Confirm'}
          onClick={onConfirm}
          className={styles.button}
          isLoading={editBookStatus === 'LOADING'}
        />
      </div>
      {user?.type === USER_TYPES.THERAPIST && (
        <span className={styles.label3}>
          Please contact the client and check they are available at the modified
          booking time before confirming.
        </span>
      )}

      {showBookingUpdated && (
        <AppModal
          width={389}
          {...modalHandlers}
          disableClosingModal
          closeIcon={false}
        >
          <BookingUpdatedModal
            data={modalHandlers.metaData}
            setShowBookingUpdated={setShowBookingUpdated}
            setThreeModalsShow={setThreeModalsShow}
          />
        </AppModal>
      )}
    </div>
  );
};
export default ModifyModal;
