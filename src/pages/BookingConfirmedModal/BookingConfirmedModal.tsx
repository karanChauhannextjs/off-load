import React from 'react';
import cn from 'classnames';

import { Button } from '@shared/ui';
import { toZonedTime } from 'date-fns-tz';
import Hands from '@assets/svg/twoHands.svg';
import { format } from 'date-fns';
import styles from './BookingConfirmedModal.module.scss';
import {
  getLongDay,
  getLongMonth,
  getTimezoneDifferenceInSeconds,
  modifyWord2
} from '@utils/helpers.ts';
import { formattedHours, formattedWeekdays } from '@constants/daysAndTime.ts';
import { BookingConfirmedModalProps } from '@pages/BookingConfirmedModal/BookingConfirmedModal.types.ts';
import {useNavigate} from "react-router-dom";

const BookingConfirmedModal: React.FC<BookingConfirmedModalProps> = (props) => {
  const {
    data,
    setShowBookingConfirmed,
    setBookModalShow,
    setShowBookingPayment,
  } = props;
  const navigate = useNavigate();
  const day = formattedWeekdays.find((e) => e.id === data?.bookData?.day);
  const time = formattedHours.find(
    (e: { id: number; label: string }) => e.id === data?.bookData?.time,
  );

  const onDoneClick = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('from');
    localStorage.removeItem('bookingData');
    setShowBookingConfirmed(false);
    navigate('/');
    if (setShowBookingPayment) {
      setShowBookingPayment(false);
    }
    if (setBookModalShow) {
      setBookModalShow(false);
    }
  };

  const timestampToIso = (date: number) => {
    const dateObj = new Date(date * 1000);
    return dateObj.toISOString();
  };

  const endTimestampPlus =
    data?.body?.type === 1 ? 30 * 60 : data?.body?.type === 2 ? 50 * 60 : 15 * 60;

  const eventTitle = `${!!data?.bookData?.duration ? 'Session' : 'Consultation'} booking with ${data?.therapistData?.name}`;
  const eventDetails = `Booking Link: <br/>${modifyWord2(data?.bookData?.type) === 'In Person' ? data?.therapistData?.address : data?.body?.bookingLink} <br/><br/>To start, change or cancel your booking please go to the booking confirmation email or log in: <br/><a href="https://stage.offloadweb.com/auth/login">Offload</a>`;
  const eventDetailsIcal = `Booking Link: \\n${modifyWord2(data?.bookData?.type) === 'In Person' ? data?.therapistData?.address : data?.body?.bookingLink} \\n\\nTo start, change or cancel your booking please go to the booking confirmation email or log in: \\nhttps://stage.offloadweb.com/auth/login`;
  const eventLocation = `${modifyWord2(data?.bookData?.type)}`;
  const eventStartDate = new Date(
    timestampToIso(data?.body?.date + getTimezoneDifferenceInSeconds()),
  );
  const eventEndDate = new Date(
    timestampToIso(
      data?.body?.date + endTimestampPlus + getTimezoneDifferenceInSeconds(),
    ),
  );

  const formatDateForICS = (date: any) => {
    // Assuming date is a JavaScript Date object, convert it to the required format
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const start = formatDateForICS(
    new Date(timestampToIso(data?.body?.date + getTimezoneDifferenceInSeconds())),
  ); // UTC time
  const end = formatDateForICS(
    new Date(
      timestampToIso(
        data?.body?.date + endTimestampPlus + getTimezoneDifferenceInSeconds(),
      ),
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

  const icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//YourApp//NONSGML v1.0//EN\r\nBEGIN:VEVENT\r\nUID:${new Date()}\r\nSEQUENCE:0\r\nDTSTAMP:${start}\r\nDTSTART:${start}\r\nDTEND:${end}\r\nSUMMARY:${eventTitle}\r\nDESCRIPTION:${eventDetailsIcal}\r\nLOCATION:${eventLocation}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
  const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  const fileName = `booking${new Date().getTime()}.ics`

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleWrapper}>
        <img src={Hands} alt="Img" />
        <span className={styles.bold}>Booking Confirmed</span>
      </div>
      <span>We emailed you a calendar invitation with all the details.</span>
      <div className={styles.line}></div>
      <span>{data?.therapistData?.name}</span>
      <span className={styles.bold}>
        {!!data?.bookData?.duration ? 'Session' : 'Consultation'}
      </span>
      <div className={styles.infoWrapper}>
        <div className={styles.row}>
          <i
            className={cn(
              `icon-${data?.bookData?.type.toLowerCase().replace('_', '-')}`,
              styles.icon,
            )}
          />
          <span className={styles.label}>
            {modifyWord2(data?.bookData?.type)}
          </span>
        </div>
        <div className={styles.row}>
          <i className={cn(`icon-time`, styles.icon)} />
          <>
            {!!data?.bookData?.duration ? (
              <>
                {
                  <span className={styles.label}>
                    {data?.bookData?.duration === 1
                      ? '30 minutes'
                      : '50 minutes'}
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
            {time?.label}, {getLongDay(day?.label)}, {getLongMonth(day?.month)}{' '}
            {day?.secondLabel}th
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
        {data?.bookData?.type === 'IN_PERSON' && (
          <div className={styles.locationBlock}>
            <span>Location</span>
            <span className={styles.boldLabel}>{data?.therapistData?.address}</span>
          </div>
        )}
        <Button fullWidth label={'Done'} onClick={onDoneClick}/>
      </div>
    </div>
  );
};
export default BookingConfirmedModal;