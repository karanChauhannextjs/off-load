import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import styles from './Header.module.scss';
import Logo from '@assets/svg/logo.svg';
import { HeaderProps } from './Header.types.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
  USER_PUBLIC_BASE_URL,
  USER_PUBLIC_URL,
} from '@routes/Routes.types.ts';
import { USER_TYPES } from '@constants/user.ts';
import { UpgradeBanner } from '@features/index.ts';
import { PaidStatus } from '@constants/plans.ts';

const Header: React.FC<HeaderProps> = (props) => {
  const { className } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );

  const onLogin = () => {
    navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.LOGIN}`);
  };

  const onSignup = () => {
    navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
  };

  const onSignupClose = () => {
    navigate(-1);
  };

  const onLogoClick = () => {
    if (user?.type === USER_TYPES.THERAPIST) {
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`);
    } else if (user?.type === USER_TYPES.CLIENT) {
      navigate(`${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_HOME}`);
    } else if (!user?.type) {
      navigate(`${USER_PUBLIC_URL}/${RoutesEnum.CARE}`);
    }
  };

  const onAboutClick = () => {
    window.open('https://www.offloadweb.com/', '_blanc')
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
    <div className={cn(styles.header, className)}>
      <div className={styles.logoWrapper} onClick={onLogoClick}>
        <img src={Logo} alt="Logo" />
        <span className={styles.title}>Offload</span>
      </div>
      {!user?.uuid && location?.pathname.includes('auth/client-sign-up') && (
        <span className={styles.closeWrapper} onClick={onSignupClose}>
          <i className={cn('icon-plus', styles.closeIcon)} />
        </span>
      )}
      {!user?.uuid && !location?.pathname.includes('auth') && (
        <div className={styles.actionsWrapper}>
          {!isMobileScreen && (
            <span className={styles.aboutLabel} onClick={onAboutClick}>
              About
            </span>
          )}
          {!isMobileScreen && (
            <button
              className={cn(styles.loginButton, styles.button)}
              onClick={onLogin}
            >
              Log in
            </button>
          )}
          <button
            className={cn(styles.signupButton, styles.button)}
            onClick={onSignup}
          >
            Sign up Free
          </button>
        </div>
      )}
      {user?.type === USER_TYPES.THERAPIST &&
        (!user?.isSubscribed || user?.paidStatus !== PaidStatus.Paid) &&
        !location.pathname.includes('exercise') && <UpgradeBanner />}
    </div>
  );
};
export default Header;
