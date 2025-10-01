import React from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import cn from 'classnames';

import { Header } from '@features/index.ts';
import red from '@assets/svg/red.svg';
import styles from './AuthLayout.module.scss';

const AuthLayout: React.FC = () => {
  const location = useLocation();

  const isRedShow = location?.pathname?.includes('auth/client-sign-up') || location?.pathname?.includes('auth/verification');

  return (
    <div className={styles.container}>
      <Header />
      <figure className={cn(styles.red, {[styles.isShow]:isRedShow})}>
        <img src={red} alt="Logo" className={styles.img} />
      </figure>
      <i className={cn('icon-auth-two-line', styles.twoLine, {[styles.isShow]:isRedShow})} />
      <i className={cn('icon-auth-long-line', styles.longLine)} />
      <div className={styles.body}>
        <Outlet />
      </div>
    </div>
  );
};
export default AuthLayout;
