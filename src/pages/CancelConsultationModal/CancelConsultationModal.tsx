import React from 'react';
import cn from 'classnames';

import { Button } from '@shared/ui';
import styles from './CancelConsultationModal.module.scss';
import { CancelConsultationModalModalProps } from './CancelConsultationModal.types.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { CanceledBookingModal } from '@pages/index.ts';
import { useBook } from '@store/book.ts';
import { getTypeCall, modifyWord, timeToLongFormat } from '@utils/helpers.ts';

const CancelConsultationModal: React.FC<CancelConsultationModalModalProps> = (
  props,
) => {
  const { data, setShow, setThreeModalsShow } = props;

  const modalHandlers = useAppModalSimpleHandlers();
  const cancelBooking = useBook((state) => state.cancelBooking);
  const cancelBookingStatus = useBook((state) => state.cancelBookingStatus);
  const getBookings = useBook((state) => state.getBookings);

  const onConfirmHandler = async () => {
    try {
      await cancelBooking({ id: data?.id });
      await getBookings()
      modalHandlers.show(data);
    } catch (e) {
      console.log(e);
    }
  };
  const dontCancelHandler = () => {
    setShow(false);
  };

  const onClickDone = () => {
    //modalHandlers.onClose(data)
      if (setThreeModalsShow) {
          setThreeModalsShow(false);
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
          {data?.startTime},
          {timeToLongFormat(data?.day, data?.startTime)}
        </span>
      </div>
      {data?.note && <span className={styles.label2}>Notes: {data?.note}</span>}
      <div className={styles.actionWrapper}>
        <div className={styles.actions}>
          <span className={styles.boldLabel}>
            Are you sure you want to cancel?
          </span>
          <Button fullWidth label={'Confirm'} onClick={onConfirmHandler} isLoading={cancelBookingStatus === 'LOADING'} />
          <span className={styles.text} onClick={dontCancelHandler}>
            Don’t cancel
          </span>
        </div>
      </div>

      <AppModal width={389} {...modalHandlers} disableClosingModal>
        <CanceledBookingModal
          onClickDone={onClickDone}
          data={modalHandlers.metaData}
        />
      </AppModal>
    </div>
  );
};
export default CancelConsultationModal;
