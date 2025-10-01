import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import styles from './StartBookingModal.module.scss';
import { Button } from '@shared/ui';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { StartBookingModalProps } from './StartBookingModal.types.ts';
import { CancelConsultationModal, ModifyModal } from '@pages/index.ts';
import {
  getTimezoneDifferenceInSeconds,
  getTypeCall,
  modifyWord,
  timeToLongFormat,
} from '@utils/helpers.ts';
import {
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
} from '@routes/Routes.types.ts';
import { useBook } from '@store/book.ts';

const StartBookingModal: React.FC<StartBookingModalProps> = (props) => {
  const { data } = props;
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const [show, setShow] = useState<boolean>(false);
  const [showModifyModal, setShowModifyModal] = useState<boolean>(false);
  const therapistCheckBooking = useBook((state) => state.therapistCheckBooking);
  const therapistCheckBookingStatus = useBook(
    (state) => state.therapistCheckBookingStatus,
  );

  const startEnable =
    data?.date * 1000 - 5 * 60 * 1000 <
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
      localStorage.setItem(
        'fromStartMessaging',
        JSON.stringify({
          email: data?.creator?.email ? data?.creator?.email : data.email,
        }),
      );
      //redirect to conversation
      if (data?.isInvited) {
        navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.CLIENTS}`);
      } else {
        navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.INBOX}`);
      }
    } else {
      //check conversation creating
      await therapistCheckBooking({
        name: data?.creator?.name ? data?.creator?.name : data.name,
        email: data?.creator?.email ? data?.creator?.email : data.email,
      });
      localStorage.setItem(
        'fromStartMessaging',
        JSON.stringify({
          email: data?.creator?.email ? data?.creator?.email : data.email,
        }),
      );
      if (data?.isInvited) {
        navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.CLIENTS}`);
      } else {
        navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.INBOX}`);
      }
    }
  };

  const onClickStart = () => {
    if (data?.isVoiceCall || data?.isVideoCall) {
      navigate(`/call/${data?.channelName}`, {
        state: {
          type: data?.isVoiceCall ? 'voice-call' : 'video-call',
          name: data?.name,
          otherName: data?.name,
        },
      });
    }
    if (data?.isLiveText && data?.isInvited) {
      localStorage.setItem(
        'fromStartMessaging',
        JSON.stringify({
          email: data?.creator?.email ? data?.creator?.email : data.email,
        }),
      );
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.CLIENTS}`);
    }
    if (data?.isLiveText && !data?.isInvited) {
      localStorage.setItem(
        'fromStartMessaging',
        JSON.stringify({
          email: data?.creator?.email ? data?.creator?.email : data.email,
        }),
      );
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.INBOX}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      <span>{data?.name}</span>
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
      {data?.note && <span className={styles.label2}>Notes: {data?.note}</span>}
      {data?.type !== 3 && (
        <div className={styles.priceWrapper}>
          <span>Total</span>
          <span style={{ marginRight: 13 }} className={styles.boldLabel}>
            {data.therapist?.userSessions?.[0]?.priceCurrency}
            {data?.type === 1
              ? data?.therapist?.userSessions?.[0]?.price
              : data?.therapist?.userSessions?.[1]?.price}
          </span>
        </div>
      )}
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
          isLoading={therapistCheckBookingStatus === 'LOADING'}
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
export default StartBookingModal;
