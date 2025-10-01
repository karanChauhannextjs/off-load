import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import cn from 'classnames';

import styles from './SignoutSidebar.module.scss';
import { SignoutSidebarData } from '@constants/constants.ts';
import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  USER_PUBLIC_BASE_URL,
  USER_PUBLIC_URL,
} from '@routes/Routes.types.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { FeedbackModal } from '@pages/index.ts';
import Smile from '@assets/images/thinking-face.svg';
import { useExerciseComplete } from '@store/exerciseComplete.ts';
import { useExercises } from '@store/exercises.ts';
import { Button } from '@shared/ui';

const SignoutSidebar = () => {
  const [activeId, setActiveId] = useState<number>(1);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const token = localStorage.getItem('ACCESS_TOKEN');
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const modalHandlers = useAppModalSimpleHandlers();
  const reset = useExerciseComplete((state: any) => state.reset);
  const resetExercises = useExercises((state: any) => state.reset);

  const onFeedback = () => {
    modalHandlers.show();
    setFeedbackShow(true);
  };

  const onClickSidebarItem = (id: number, path: string) => {
    if (activeId !== id) {
      reset();
      resetExercises();
      localStorage.removeItem('selectedGroup');
      localStorage.removeItem('selectedCategory');
      localStorage.removeItem('savedScrollForHome');
      localStorage.removeItem('scrollPositionFromCare');
      if (!token && user?.type !== 2) {
        if (path === 'messages' || path === 'account') {
          navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
        } else {
          navigate(`${USER_PUBLIC_URL}/${path}`);
        }
      } else {
        navigate(`${CLIENT_PRIVATE_BASE_URL}/${path}`);
        setActiveId(id);
      }
    }
  };

  const onAddClient = () => {
    navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
  };

  const onPrivacyPolicy = () => {
    window.open('https://www.offloadweb.com/privacy-policy', '_blanc')
  };

  const onTermsOfUse = () => {
    window.open('https://www.offloadweb.com/terms-of-service-professionals', '_blanc')
  };

  useEffect(() => {
    const activeTab = SignoutSidebarData.find(
      (e) => e?.path === pathname.split('/')[2],
    );
    if (activeTab) {
      setActiveId(activeTab?.id);
    }
  }, [pathname]);

  return (
    <ul className={styles.sidebarWrapper}>
      {activeId === 1 && (
        <Button
          className={styles.button}
          label={'Add Client'}
          variant={'secondary'}
          onClick={onAddClient}
        />
      )}
      {SignoutSidebarData.map((el) => {
        const { id, label, icon, path } = el;
        return (
          <li
            key={id}
            className={cn(styles.row, { [styles.active]: id === activeId })}
            onClick={() => {
              onClickSidebarItem(id, path);
            }}
          >
            <i className={cn(`icon-${icon}`, styles.icon)} />
            <span className={styles.label}>{label}</span>
          </li>
        );
      })}
      <div className={styles.burgerBottom}>
        <div className={styles.feedbackWrapper} onClick={onFeedback}>
          <span className={styles.label}>Feedback</span>
          <img src={Smile} alt="smile" />
        </div>
        <a className={styles.label} href="mailto:edwin@offloadweb.com">Support</a>
        <div className={styles.privacyRow}>
          <span className={styles.lightLabel} onClick={onPrivacyPolicy}>Privacy</span>
          <span className={styles.dot}></span>
          <span className={styles.lightLabel} onClick={onTermsOfUse}>Terms</span>
        </div>
        <div>
          <p className={styles.lightLabel}>© 2025 Offload</p>
          <p className={styles.lightLabel}>All rights reserved</p>
        </div>
      </div>
      {feedbackShow && (
        <AppModal width={389} {...modalHandlers}>
          <FeedbackModal setFeedbackShow={setFeedbackShow} />
        </AppModal>
      )}
    </ul>
  );
};
export default SignoutSidebar;
