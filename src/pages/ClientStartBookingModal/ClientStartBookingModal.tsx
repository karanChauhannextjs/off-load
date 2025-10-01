import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import styles from './ClientStartBookingModal.module.scss';
import { Avatar, Button } from '@shared/ui';
import { CancelConsultationModal, ModifyModal } from '@pages/index.ts';
import { ClientStartBookingModalProps } from './ClientStartBookingModal.types.ts';
import {
  getTimezoneDifferenceInSeconds,
  getTypeCall,
  modifyWord,
  timeToLongFormat,
} from '@utils/helpers.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const ClientStartBookingModal: React.FC<ClientStartBookingModalProps> = (
  props,
) => {
  const { data } = props;
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const [show, setShow] = useState<boolean>(false);
  const [showModifyModal, setShowModifyModal] = useState<boolean>(false);

  //TODO do it after testing call functionality
  //5 minutes before call callers can start call
  const startEnable =
    data.date * 1000 - 5 * 60 * 1000 <
    Date.now() - getTimezoneDifferenceInSeconds() * 1000;

  const onCancelClick = () => {
    setShow(true);
    modalHandlers.show(data);
    setShowModifyModal(false);
  };

  const onModifyHandler = () => {
    setShowModifyModal(true);
    modalHandlers.show(data);
    setShow(false);
  };

  const onSendMessage = async () => {
    if (data?.isConversationCreated) {
      //redirect to conversation
      localStorage.setItem(
        'fromStartMessaging',
        JSON.stringify({
          email: data?.creator?.email ? data?.creator?.email : data.email,
        }),
      );
      navigate(`/client/client-messages`);
    }
  };

  const onClickStart = () => {
    if (data?.isVoiceCall || data?.isVideoCall) {
      navigate(`/call/${data?.channelName}`, {
        state: {
          type: data?.isVoiceCall ? 'voice-call' : 'video-call',
          name: data?.name,
          otherName: data?.therapist?.name,
        },
      });
    }
    if (data?.isLiveText) {
      localStorage.setItem(
        'fromStartMessaging',
        JSON.stringify({
          email: data?.creator?.email ? data?.creator?.email : data.email,
        }),
      );
      navigate(`/client/client-messages`);
    }
  };

  const timestampToIso = (date: number) => {
    const dateObj = new Date(date * 1000);
    return dateObj.toISOString();
  };

  const endTimestampPlus =
    data?.type === 1 ? 30 * 60 : data?.type === 2 ? 50 * 60 : 15 * 60;

  const eventTitle = `${data.type === 3 ? 'Consultation' : 'Session'} booking with ${data?.therapist?.name}`;
  const eventDetails = `Bookig Link:<br/>${data?.isInPerson ? data?.therapist?.address : data?.bookingLink}<br/><br/>To start, change or cancel your booking please go to the booking confirmation email or log in:<br/><a href="https://stage.offloadweb.com/auth/login">Offload</a>`;
  const eventDetailsIcal =`Booking Link: \\n${data?.isInPerson ? data?.therapist?.address : data?.bookingLink} \\n\\nTo start, change or cancel your booking please go to the booking confirmation email or log in: \\nhttps://stage.offloadweb.com/auth/login`;
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

  const formatDateForICS = (date: any) => {
    // Assuming date is a JavaScript Date object, convert it to the required format
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const start = formatDateForICS(
    new Date(timestampToIso(data?.date + getTimezoneDifferenceInSeconds())),
  ); // UTC time
  const end = formatDateForICS(
    new Date(
      timestampToIso(
        data?.date + endTimestampPlus + getTimezoneDifferenceInSeconds(),
      ),
    ),
  ); // UTC time

  const icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//YourApp//NONSGML v1.0//EN\r\nBEGIN:VEVENT\r\nUID:${new Date()}\r\nSEQUENCE:0\r\nDTSTAMP:${start}\r\nDTSTART:${start}\r\nDTEND:${end}\r\nSUMMARY:${eventTitle}\r\nDESCRIPTION:${eventDetailsIcal}\r\nLOCATION:${eventLocation}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
  const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  const fileName = `booking${new Date().getTime()}.ics`

  return (
    <div className={styles.wrapper}>
      <div className={styles.imageWrapper}>
        <Avatar photoUrl={data?.therapist?.image} />
      </div>
      <span>{data?.therapist?.name}</span>
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
        <i className={cn('icon-time', styles.icon)} />
        <span className={styles.label}>
          {data?.type === 1
            ? '30 minutes'
            : data?.type === 2
              ? '50 minutes'
              : '15 minutes'}
        </span>
      </div>
      <div className={styles.row}>
        <i className={cn('icon-calendar', styles.icon)} />
        <span className={styles.label}>
          {data?.startTime},{timeToLongFormat(data?.day, data?.startTime)}
        </span>
      </div>
      <div className={styles.addBlock}>
        <span>Add to calendar</span>
        <div className={styles.addActions}>
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
      </div>
      <div className={styles.block}>
        {data?.isInPerson ? (
          <>
            <span>Location</span>
            <span className={styles.boldLabel}>{data?.therapist?.address}</span>
          </>
        ) : (
          <>
            <Button
              fullWidth
              label={'Start'}
              onClick={onClickStart}
              disabled={!startEnable}
            />
            <span className={styles.label3}>
              You can start five minutes before the start time
            </span>
          </>
        )}
      </div>
      <div className={styles.actions}>
        <Button
          variant={'secondary'}
          label={'Send Message'}
          className={styles.sendButton}
          onClick={onSendMessage}
        />
        <Button
          variant={'secondary'}
          label={'Modify'}
          onClick={onModifyHandler}
        />
        <Button
          variant={'secondary'}
          label={'Cancel'}
          onClick={onCancelClick}
        />
      </div>
      {data?.type !== 3 && (
        <span className={cn(styles.label3, styles.cancellationLabel)}>
          For cancellations, please make them 48 hrs in advance of the booking
          to qualify for a refund
        </span>
      )}
      {show && (
        <AppModal width={389} {...modalHandlers} disableClosingModal>
          <CancelConsultationModal
            setThreeModalsShow={props.setThreeModalsShow}
            data={modalHandlers.metaData}
            setShow={setShow}
            show={show}
          />
        </AppModal>
      )}
      {showModifyModal && (
        <AppModal
          width={410}
          {...modalHandlers}
          disableClosingModal
          closeIcon={false}
          className={styles.modifyModal}
        >
          <ModifyModal
            setThreeModalsShow={props.setThreeModalsShow}
            data={modalHandlers.metaData}
            setShowModifyModal={setShowModifyModal}
            showModifyModal={showModifyModal}
          />
        </AppModal>
      )}
    </div>
  );
};
export default ClientStartBookingModal;
