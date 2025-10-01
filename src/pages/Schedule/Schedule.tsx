import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import cn from 'classnames';

import styles from './Schedule.module.scss';
import { ScheduleCard } from '@shared/ui';
import { useBook } from '@store/book.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import {IScheduleCard} from "@models/book.ts";
import {LoadingScreen, StartBookingModal} from '@pages/index.ts';
import {getTypeCall} from '@utils/helpers.ts';
import { PaidStatus } from '@constants/plans.ts';

const Schedule: React.FC = () => {
  const modalHandlers = useAppModalSimpleHandlers();
  const [threeModalsShow, setThreeModalsShow] = useState<boolean>(true);
  const getBookings = useBook((state) => state.getBookings);
  const bookingData = useBook((state) => state.bookingData);
  const getBookingsStatus = useBook((state) => state.getBookingsStatus);
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const onScheduleCardClick = (item: IScheduleCard) => {
    setThreeModalsShow(true);
    modalHandlers.show(item);
  };
  useEffect(() => {
    getBookings();
  }, [threeModalsShow]);

  useEffect(() =>{
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },[])

  const sorted = bookingData?.sort((a: IScheduleCard, b: IScheduleCard) => {
    return b.date - a.date;
  });
  return (
    <div className={styles.pageWrapper}>
      <div className={cn(styles.wrapper, {[styles.wrapperWithUpgradeBanner]: !user?.isSubscribed || user?.paidStatus !== PaidStatus.Paid})}>
        <span className={styles.title}>Schedule</span>
        <div className={styles.line}></div>
        {getBookingsStatus === 'LOADING' ? (
          <LoadingScreen />
        ) : (<>
          {!!bookingData?.length ?
          <div className={styles.cardsWrapper}>
            {sorted?.map((item: IScheduleCard, idx: number) => {
              const today = new Date();
              const formattedToday = format(today, 'dd MMM');
              const {
                date,
                id,
                type,
                creator,
                name,
                day,
                startTime,
                endTime,
                isInPerson,
                isLiveText,
                isVideoCall,
                isVoiceCall,
              } = item;

              const duration = type === 1 ? 30 : type === 2 ? 50 : 15
              const disabled = Date.now() > (date * 1000 + duration * 60 * 1000);

              return (
                <div key={id} className={styles.block}>
                  {sorted[idx]?.day !== sorted[idx - 1]?.day ? (
                    <div
                      className={cn(styles.badge, {
                        [styles.activeDay]: day === formattedToday,
                        [styles.disabledBadge]: disabled,
                      })}
                    >
                      <span className={styles.day}>{day?.split(' ')[0]}</span>
                      <span className={styles.mount}>{day?.split(' ')[1]}</span>
                    </div>
                  ) : (
                    <div className={styles.space} />
                  )}
                  <div className={styles.cardsBlock}>
                    <ScheduleCard
                      onClick={() => {
                        onScheduleCardClick(item);
                      }}
                      key={id}
                      // disabled={disabled}
                      className={styles.card}
                      name={creator?.name ? creator?.name : name ? name : ''}
                      end_time={endTime?.toLowerCase()}
                      start_time={startTime?.toLowerCase()}
                      session_type={type === 3 ? 'consultation' : 'session'}
                      type={getTypeCall(
                        isInPerson,
                        isLiveText,
                        isVideoCall,
                        isVoiceCall,
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
              :
              <span className={styles.label}>No bookings yet</span>
          }
        </>)}
      </div>
      {threeModalsShow && (
        <AppModal width={389} {...modalHandlers} disableClosingModal>
          <StartBookingModal
            setThreeModalsShow={setThreeModalsShow}
            data={modalHandlers.metaData}
          />
        </AppModal>
      )}
    </div>
  );
};
export default Schedule;
