import styles from './BurgerMenu.module.scss';
import Logo from '@assets/svg/logo.svg';
import cn from 'classnames';
import React, { useEffect, useState } from 'react';
import { BurgerMenuProps } from '@widgets/BurgerMenu/BurgerMenu.types.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { FeedbackModal } from '@pages/index.ts';
import {
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
  USER_PUBLIC_BASE_URL,
  USER_PUBLIC_URL,
} from '@routes/Routes.types.ts';
import { USER_TYPES } from '@constants/user.ts';
import Smile from '@assets/images/thinking-face.svg';

const BurgerMenu: React.FC<BurgerMenuProps> = (props) => {
  let { isVisible, onClose, className } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const modalHandlers = useAppModalSimpleHandlers();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);

  const onTabClick = (tab: string) => {
    navigate(`/therapist/${tab}`);
    if (onClose) {
      onClose();
    }
  };

  const onLogin = () => {
    navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.LOGIN}`);
  };

  const onSignup = () => {
    navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
  };

  const onFeedback = () => {
    modalHandlers.show();
    setFeedbackShow(true);
  };

  const onLogoClick = () => {
    if (user?.type === USER_TYPES.THERAPIST) {
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`);
    } else if (!user?.type) {
      navigate(`${USER_PUBLIC_URL}/${RoutesEnum.CARE}`);
    }
    if (onClose) {
      onClose();
    }
  };

  const onAboutClick = () => {
    window.open('https://www.offloadweb.com/', '_blanc');
  };

  const onPrivacyPolicy = () => {
    window.open('https://www.offloadweb.com/privacy-policy', '_blanc');
  };

  const onTermsOfUse = () => {
    window.open(
      'https://www.offloadweb.com/terms-of-service-professionals',
      '_blanc',
    );
  };

  useEffect(() => {
    if (isVisible) {
      const scrollY = window.scrollY;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        window.scrollTo(0, scrollY);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    const element = document.getElementById('therapistLayoutContainer');
    if (element && isVisible && user.type === USER_TYPES.THERAPIST) {
      if (window.innerWidth < 768) {
        element.style.paddingTop = '0px';
      }
      return () => {
        element.style.paddingTop = '8px';
      };
    }
  }, [location, isVisible]);

  return (
    <div
      className={cn(styles.burgerWrapper, className, {
        [styles.visible]: isVisible,
      })}
    >
      <div className={styles.burgerMain}>
        <div className={styles.burgerTop}>
          <div className={styles.logoWrapper} onClick={onLogoClick}>
            <img src={Logo} alt="Logo" className={styles.logo} />
            <span className={styles.title}>Offload</span>
          </div>
          <div className={styles.actionsWrapper}>
            {!user?.uuid && (
              <button className={styles.signUpButton} onClick={onSignup}>
                Sign up Free
              </button>
            )}
            <i
              className={cn('icon-plus', styles.closeIcon)}
              onClick={onClose}
            />
          </div>
        </div>
        <div className={styles.burgerTabs}>
          {!user?.uuid && (
            <span className={cn(styles.label, styles.login)} onClick={onLogin}>
              Log in
            </span>
          )}
          {!user?.uuid && (
            <span
              className={cn(styles.label, styles.about)}
              onClick={onAboutClick}
            >
              About
            </span>
          )}
          {user?.type === USER_TYPES.THERAPIST && (
            <div className={styles.tabsWrapper}>
              <div
                className={styles.row}
                onClick={() => {
                  onTabClick('schedule');
                }}
              >
                <i className={cn('icon-calendar')} />
                <span className={styles.label}>Schedule</span>
              </div>
              <div
                className={styles.row}
                onClick={() => {
                  onTabClick('availability');
                }}
              >
                <i className={cn('icon-time')} />
                <span className={styles.label}>Availability</span>
              </div>
              <div
                className={styles.row}
                onClick={() => {
                  onTabClick('account');
                }}
              >
                <i className={cn('icon-settings')} />
                <span className={styles.label}>Account</span>
              </div>
            </div>
          )}
        </div>
        <div className={styles.line} />
        <div className={styles.burgerBottom}>
          <div className={styles.feedbackWrapper} onClick={onFeedback}>
            <span className={styles.label}>Feedback</span>
            <img src={Smile} alt="smile" />
          </div>
          <a className={styles.label} href="mailto:edwin@offloadweb.com">
            Support
          </a>
          <div className={styles.privacyRow}>
            <span className={styles.lightLabel} onClick={onPrivacyPolicy}>
              Privacy
            </span>
            <span className={styles.dot}></span>
            <span className={styles.lightLabel} onClick={onTermsOfUse}>
              Terms
            </span>
          </div>
          <div>
            <p className={styles.lightLabel}>© 2025 Offload</p>
            <p className={styles.lightLabel}>All rights reserved</p>
          </div>
        </div>
      </div>
      {feedbackShow && (
        <AppModal width={389} {...modalHandlers}>
          <FeedbackModal setFeedbackShow={setFeedbackShow} />
        </AppModal>
      )}
    </div>
  );
};
export default BurgerMenu;
