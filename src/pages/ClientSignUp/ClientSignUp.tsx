import React, {useEffect, useState} from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button, Input } from '@shared/ui';
import styles from './ClientSignUp.module.scss';
import { schema } from './ClientSignUp.validation.ts';
import { CLIENT_SIGNUP_FORM_FIELDS } from './ClientSignUp.types.ts';
import { useNavigate } from 'react-router-dom';
import { RoutesEnum, USER_PUBLIC_BASE_URL } from '@routes/Routes.types.ts';
import { useUserAuthStore } from '@store/auth.ts';
import { IClientSignupForm } from '@models/auth.ts';
import cn from "classnames";

export type FormData = yup.InferType<typeof schema>;
const ClientSignUp: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<any>();
  const registration = useUserAuthStore((state) => state.registration);
  const registrationStatus = useUserAuthStore(
    (state) => state.registrationStatus,
  );
  const exerciseCompleteData = JSON.parse(localStorage.getItem('exerciseCompleteData') ?? '{}');
  const checkinCompleteData = JSON.parse(localStorage.getItem('checkinCompleteData') ?? '{}');

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleFormSubmit = async (data: IClientSignupForm) => {
    try {
      const response = await registration({
        name: data.name,
        email: data.email,
        password: data.password,
        type: 2,
      });
      if (response) {
        navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.VERIFICATION}`, {
          state: {
            email: data.email,
            fromClientSignUp: true,
          },
        });
      }
    } catch (error:any) {
      if (error.message === 'User inactive' || error.message === 'Go to verification') {
        navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.VERIFICATION}`, {
          state: {
            email: data.email,
            fromClientSignUp: true,
          },
        });
      }
      setError(error);
    }
  };

  const onLogin = () => {
    navigate('/auth/login');
  };

  const onForgot = () => {
    navigate('/auth/forgot-password');
  };

  // const onTherapistSignUp = () => {
  //   navigate('/auth/therapist-sign-up');
  // };

  const onTermsOfUse = () => {
    window.open('https://www.offloadweb.com/terms-of-service-client', '_blanc')
  };

  const onPrivacyPolicy = () => {
    window.open('https://www.offloadweb.com/privacy-policy', '_blanc')
  };

  const onSignupClose = () => {
    if (exerciseCompleteData?.answers || checkinCompleteData?.feeling) {
      navigate(-2);
      localStorage.removeItem('exerciseCompleteData');
      localStorage.removeItem('checkinCompleteData');
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    localStorage.setItem('clientSignup', 'true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.wrapper}>
      <span className={styles.closeWrapper} onClick={onSignupClose}>
        <i className={cn('icon-plus',styles.closeIcon)} />
      </span>
      <div className={styles.titleBlock}>
        <span className={styles.title}>Client Sign up</span>
        <span className={styles.subtitle}>
          Sign up to save your progress across devices.
        </span>
      </div>
      {/*<div className={styles.therapistSignupWrapper} onClick={onTherapistSignUp}>*/}
      {/*  <span className={styles.linkLabel}>Are you a therapist?</span>*/}
      {/*  <div className={styles.iconSide}>*/}
      {/*    <span className={styles.linkLabel}>Sign up here</span>*/}
      {/*    <i className={cn('icon-right-arrow')} />*/}
      {/*  </div>*/}
      {/*</div>*/}
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {error?.message && (
          <span className={styles.error}>{error?.message}</span>
        )}
        <Input
          placeholder={'Name'}
          {...register(CLIENT_SIGNUP_FORM_FIELDS.NAME)}
          errorMessage={errors[CLIENT_SIGNUP_FORM_FIELDS.NAME]?.message}
        />
        <div className={styles.emailInfo}>
          <span className={styles.emailInfoLabel}>
            Use the email where you received the connection code
          </span>
        </div>
        <Input
          placeholder={'Email'}
          {...register(CLIENT_SIGNUP_FORM_FIELDS.EMAIL)}
          errorMessage={errors[CLIENT_SIGNUP_FORM_FIELDS.EMAIL]?.message}
        />
        <Input
          type={'password'}
          placeholder={'Password'}
          {...register(CLIENT_SIGNUP_FORM_FIELDS.PASSWORD)}
          errorMessage={errors[CLIENT_SIGNUP_FORM_FIELDS.PASSWORD]?.message}
        />
        <span className={styles.forgot} onClick={onForgot}>
          Forgot Password?
        </span>
        <Button
          fullWidth
          type={'submit'}
          label={'Continue'}
          isLoading={registrationStatus === 'LOADING'}
        />
      </form>
      <div className={styles.linksWrapper}>
        <span className={styles.label}>
          Already have an account? <span onClick={onLogin}>Log in</span>
        </span>
        <span className={styles.label}>
          By proceeding you agree to our{' '}
          <span onClick={onTermsOfUse}>Terms</span> and{' '}
          <span onClick={onPrivacyPolicy}>Privacy Policy</span>
        </span>
      </div>
    </div>
  );
};

export default ClientSignUp;
