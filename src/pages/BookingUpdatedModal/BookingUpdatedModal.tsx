import React from 'react';
import styles from './BookingUpdatedModal.module.scss';
import Hands from '@assets/svg/twoHands.svg';
import cn from 'classnames';
import { Button } from '@shared/ui';
import {
  getTimezoneDifferenceInSeconds,
  getTypeCall,
  modifyWord,
  timeToLongFormat,
} from '@utils/helpers.ts';
import { BookingUpdatedModalProps } from '@pages/BookingUpdatedModal/BookingUpdatedModal.types.ts';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {USER_TYPES} from "@constants/user.ts";

const BookingUpdatedModal: React.FC<BookingUpdatedModalProps> = (props) => {
  const { data, setShowBookingUpdated, setThreeModalsShow } = props;
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const onDoneClick = () => {
    setShowBookingUpdated(false);
    if (setThreeModalsShow) {
      setThreeModalsShow(false);
    }
  };

  const timestampToIso = (date: number) => {
    const dateObj = new Date(date * 1000);
    return dateObj.toISOString();
  };

  const endTimestampPlus =
    data?.type === 1 ? 30 * 60 : data?.type === 2 ? 50 * 60 : 15 * 60;

  const eventTitle = `${data?.type !== 3 ?  'Session' : 'Consultation'} booking with ${data?.therapist?.name}`;
  const eventDetails = `Booking Link: <br/>${data?.isInPerson ? data?.therapist?.address : data?.bookingLink} <br/><br/>To start, change or cancel your booking please go to the booking confirmation email or log in: <br/><a href="https://stage.offloadweb.com/auth/login">Offload</a>`;
  const eventDetailsIcal = `Booking Link: \\n${data?.isInPerson ? data?.therapist?.address : data?.bookingLink} \\n\\nTo start, change or cancel your booking please go to the booking confirmation email or log in: \\nhttps://stage.offloadweb.com/auth/login`;
  const eventLocation = `${modifyWord(
    getTypeCall(
      data?.isInPerson,
      data?.isLiveText,
      data?.isVideoCall,
      data?.isVoiceCall,
    ),
  )}`;
  const eventStartDate = new Date(
    timestampToIso(data?.date + getTimezoneDifferenceInSeconds()),
  );
  const eventEndDate = new Date(
    timestampToIso(
      data?.date + endTimestampPlus + getTimezoneDifferenceInSeconds(),
    ),
  );

  const generateGoogleCalendarLink = (
    title: string,
    startDate: Date,
    endDate: Date,
    details: string,
    location: string,
  ) => {
    const formattedStartDate = format(
      toZonedTime(startDate, 'UTC'),
      "yyyyMMdd'T'HHmmss'Z'",
    );
    const formattedEndDate = format(
      toZonedTime(endDate, 'UTC'),
      "yyyyMMdd'T'HHmmss'Z'",
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedStartDate}/${formattedEndDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
  };

  const calendarLink = generateGoogleCalendarLink(
    eventTitle,
    eventStartDate,
    eventEndDate,
    eventDetails,
    eventLocation,
  );

  const start = format(
    toZonedTime(timestampToIso(data?.date + getTimezoneDifferenceInSeconds()), 'UTC'),
    "yyyyMMdd'T'HHmmss'Z'",
  );
  const end = format(
    toZonedTime(timestampToIso(data?.date + endTimestampPlus + getTimezoneDifferenceInSeconds()), 'UTC'),
    "yyyyMMdd'T'HHmmss'Z'",
  );

  const icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//YourApp//NONSGML v1.0//EN\r\nBEGIN:VEVENT\r\nUID:${new Date()}\r\nSEQUENCE:1\r\nDTSTAMP:${start}\r\nDTSTART:${start}\r\nDTEND:${end}\r\nSUMMARY:${eventTitle}\r\nDESCRIPTION:${eventDetailsIcal}\r\nLOCATION:${eventLocation}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
  const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  const fileName = `booking${new Date().getTime()}.ics`

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleWrapper}>
        <img src={Hands} alt="Img" />
        <span className={styles.bold}>Booking Updated</span>
      </div>
      <span>We emailed you a calendar invitation with all the details.</span>
      <div className={styles.line}></div>
      <span>
        {user && user?.type === USER_TYPES.THERAPIST ? data?.creator?.name : data?.therapist?.name}
      </span>
      <span className={styles.bold}>
        {data?.type !== 3 ? 'Session' : 'Consultation'}
      </span>
      <div className={styles.infoWrapper}>
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
          <i className={cn(`icon-time`, styles.icon)} />
          <>
            {data?.type !== 3 ? (
              <>
                {
                  <span className={styles.label}>
                    {data?.type === 1 ? '30 minutes' : '50 minutes'}
                  </span>
                }
              </>
            ) : (
              <span className={styles.label}>15 minutes</span>
            )}
          </>
        </div>
        <div className={styles.row}>
          <i className={cn(`icon-calendar`, styles.icon)} />
          <span className={styles.label}>
            {data?.startTime},{timeToLongFormat(data?.day, data?.startTime)}
          </span>
        </div>
      </div>
      <div className={styles.line}></div>
      <div className={styles.addBlock}>
        <span>Add to calendar</span>
        <div className={styles.actions}>
          <a
            className={styles.link}
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className={styles.button}
              variant={'tertiary'}
              label={'Google'}
            />
          </a>
          <a className={styles.link} href={dataUrl} download={fileName}>
            <Button
              className={styles.button}
              variant={'tertiary'}
              label={'iCal'}
            />
          </a>
          <a className={styles.link} href={dataUrl} download={fileName}>
            <Button
              className={styles.button}
              variant={'tertiary'}
              label={'Outlook'}
            />
          </a>
        </div>
        <div className={styles.line}></div>
        <Button fullWidth label={'Done'} onClick={onDoneClick} />
      </div>
    </div>
  );
};
export default BookingUpdatedModal;