import cn from 'classnames';
import { useNavigate } from 'react-router-dom';

import styles from './Plan.module.scss';
import {
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
} from '@routes/Routes.types.ts';
import { useEffect, useState } from 'react';

const Plan = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );

  const includesMock = [
    { id: 1, label: '1.5% Stripe fee for payments' },
    { id: 2, label: 'Fully featured personal web page' },
    { id: 3, label: 'Automated session scheduling' },
    { id: 4, label: 'Connect your calendar' },
    { id: 5, label: 'Automatic session reminders' },
    { id: 6, label: 'Many session payment options inc. Apple pay' },
    { id: 7, label: 'Configure video calls, voice calls, live text and in-person sessions' },
    { id: 8, label: 'Secure messaging' },
    { id: 9, label: 'And more!' },
  ];
  const goBack = () => {
    navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.ACCOUNT}`);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {isMobileScreen && (
        <div className={styles.topWrapper}>
          <span className={styles.accountLabel}>Account</span>
          <div className={styles.line}></div>
        </div>
      )}
      <i className={cn('icon-left-arrow', styles.icon)} onClick={goBack} />
      <div className={styles.mainWrapper}>
        <span className={styles.title}>Plan</span>
        <div className={styles.planCardWrapper}>
          <span className={styles.subtitle}>Growth</span>
          <span className={styles.label3}>
              Only pay when you get paid.
            </span>
          <div className={styles.pricesWrapper}>
            <div>
              <span className={styles.boldLabel}>£0 </span>
              <span className={styles.label2}>per month forever</span>
            </div>
            <div>
              <span className={styles.boldLabel}>{user?.commission}% </span>
              <span className={styles.label2}>per session fee</span>
            </div>
          </div>
          <span className={styles.label4}>Includes:</span>
          <div className={styles.includesWrapper}>
            {includesMock.map((item) => {
              return (
                <div key={item.id} className={styles.includeRow}>
                    <span className={styles.checkWrapper}>
                      <i className={cn('icon-check', styles.iconCheck)} />
                    </span>
                  <span className={styles.labelInclude}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Plan;
