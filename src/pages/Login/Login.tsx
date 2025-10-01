import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import hand from '@assets/svg/hand.svg';
import styles from './Login.module.scss';
import { Button, Input } from '@shared/ui';
import { schema } from './Login.validation.ts';
import { LOGIN_FORM_FIELDS } from './Login.types.ts';
import { useUserAuthStore } from '@store/auth.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import { IParamsLogin } from '@models/auth.ts';
import { USER_TYPES } from '@constants/user.ts';
import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
  USER_PUBLIC_BASE_URL,
  VIEW_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import { getTimezoneDifferenceInSeconds } from '@utils/helpers.ts';
import toast from 'react-hot-toast';

export type FormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
  const { state, pathname } = useLocation();
  const [error, setError] = useState<any>();
  const navigate = useNavigate();
  const login = useUserAuthStore((state) => state.login);
  const loginStatus = useUserAuthStore((state) => state.loginStatus);
  const from = localStorage.getItem('from');
  const username = localStorage.getItem('username');
  const bookingData = JSON.parse(localStorage.getItem('bookingData') ?? '{}');
  const newChatItem = JSON.parse(localStorage.getItem('newChatItem') ?? '{}');

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleFormSubmit = async (data: IParamsLogin) => {
    const timeZoneOffset = getTimezoneDifferenceInSeconds();
    try {
      const result = await login({ ...data, timeZoneOffset });
      if (result) {
        localStorage.setItem('user', JSON.stringify(result));
        localStorage.setItem('ACCESS_TOKEN', result.token);
        if (
          from &&
          username &&
          (from === 'view' || from === 'viewSession') &&
          newChatItem?.therapist &&
          result.token &&
          result.type === USER_TYPES.CLIENT
        ) {
          navigate(`${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_MESSAGES}`);
        } else if (
          from &&
          username &&
          (from === 'view' || from === 'viewSession') &&
          bookingData?.therapistData &&
          result.token &&
          result.type === USER_TYPES.CLIENT
        ) {
          navigate(`${VIEW_PUBLIC_BASE_URL}${username}`);
        } else {
          const redirectPath =
            result.token && result.type === USER_TYPES.THERAPIST
              ? `${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`
              : result.token && result.type === USER_TYPES.CLIENT
                ? `${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_HOME}`
                : '/';
          navigate(redirectPath);
        }
      }
    } catch (error: any) {
      if (error.message === 'User inactive' || error.message === 'Go to verification') {
        navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.VERIFICATION}`, {
          state: {
            email: data.email,
            fromSignUp: true,
          },
        });
      }
      setError(error);
    }
  };

  const onForgot = () => {
    navigate('/auth/forgot-password');
  };

  const onSignUp = (type: string) => {
    if (type === 'therapist') {
      navigate('/auth/therapist-sign-up');
    } else {
      navigate('/auth/client-sign-up');
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    localStorage.removeItem('clientSignup');
    if (state?.startCallError) {
      toast.error('You can start five minutes before the start time');
      navigate(pathname, { replace: true });
    }
    if (state?.startCallExpireError) {
      toast.error('The booking time has expired.');
      navigate(pathname, { replace: true });
    }
  }, [state]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>Log in</span>
        <img src={hand} alt="hand" />
      </div>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {error?.message && (
          <span className={styles.error}>{error?.message}</span>
        )}
        <Input
          placeholder={'Email'}
          {...register(LOGIN_FORM_FIELDS.EMAIL)}
          errorMessage={errors[LOGIN_FORM_FIELDS.EMAIL]?.message}
        />
        <Input
          type={'password'}
          placeholder={'Password'}
          {...register(LOGIN_FORM_FIELDS.PASSWORD)}
          errorMessage={errors[LOGIN_FORM_FIELDS.PASSWORD]?.message}
        />
        <span className={styles.forgot} onClick={onForgot}>
          Forgot Password?
        </span>
        <Button
          fullWidth
          type={'submit'}
          label={'Continue'}
          isLoading={loginStatus === 'LOADING'}
        />
      </form>
      <span className={styles.label}>Don’t have an account?</span>
      <div className={styles.actionsWrapper}>
        <span
          className={styles.action}
          onClick={() => {
            onSignUp('client');
          }}
        >
          Client sign up
        </span>
        <span
          className={styles.action}
          onClick={() => {
            onSignUp('therapist');
          }}
        >
          Therapist sign up
        </span>
      </div>
    </div>
  );
};

export default Login;
