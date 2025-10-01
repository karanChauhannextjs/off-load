import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from '@shared/ui';
import styles from './Verification.module.scss';
import { schema } from './Verification.validation.ts';
import { VerificationInput } from '@features/index.ts';
import { VERIFICATION_FORM_FIELDS } from './Verification.types.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  USER_PUBLIC_BASE_URL, VIEW_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import { formatSecondsToMinutesAndSeconds } from '@utils/helpers.ts';
import { useUserAuthStore } from '@store/auth.ts';
import {USER_TYPES} from "@constants/user.ts";

export type FormData = yup.InferType<typeof schema>;
const Verification: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const checkCode = useUserAuthStore((state) => state.checkCode);
  const confirm = useUserAuthStore((state) => state.confirm);
  const resendCode = useUserAuthStore((state) => state.resendCode);
  const checkCodeStatus = useUserAuthStore((state) => state.checkCodeStatus);
  const confirmStatus = useUserAuthStore((state) => state.confirmStatus);
  const resendCodeStatus = useUserAuthStore((state) => state.resendCodeStatus);
  const isLoadingButton =
    checkCodeStatus === 'LOADING' ||
    confirmStatus === 'LOADING' ||
    resendCodeStatus === 'LOADING';
  const optCodeLength = 5;

  const from = localStorage.getItem('from');
  const username = localStorage.getItem('username');
  const bookingData = JSON.parse(localStorage.getItem('bookingData') ?? '{}');
  const newChatItem = JSON.parse(localStorage.getItem('newChatItem') ?? '{}');

  const {
    setValue,
    watch,
    // formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onVerifyChange = (data: string) => {
    setValue(VERIFICATION_FORM_FIELDS.CODE, data);
  };
  const isDisabled =
    watch(VERIFICATION_FORM_FIELDS.CODE)?.length !== optCodeLength;

  const handleFormSubmit = async (data: any) => {
    if (state.fromSignUp) {
      try {
        const response = await confirm({ code: data.code });
        if (response.token) {
          // localStorage.setItem('user', JSON.stringify(response));
           localStorage.setItem('ACCESS_TOKEN', response?.token);
          navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.ONBOARDING}`);
        }
      } catch (error: any) {
        setError(error.message);
      }
    }
    if (state.fromClientSignUp) {
      try {
        const response = await confirm({ code: data.code });
        if (response.token) {
          localStorage.setItem('user', JSON.stringify(response));
          localStorage.setItem('ACCESS_TOKEN', response.token);
          if (
            from &&
            username &&
            (from === 'view' || from === 'viewSession') &&
            newChatItem?.therapist &&
            response.token &&
            response.type === USER_TYPES.CLIENT
          ) {
            navigate(
              `${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_MESSAGES}`,
            );
          } else if (
            from &&
            username &&
            (from === 'view' || from === 'viewSession') &&
            bookingData?.therapistData &&
            response.token &&
            response.type === USER_TYPES.CLIENT
          ) {
            navigate(`${VIEW_PUBLIC_BASE_URL}${username}`);
          } else {
            navigate(`${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_HOME}`);
          }
        }
      } catch (error: any) {
        setError(error.message);
      }
    }
    if (state.fromForgot) {
      try {
        const response = await checkCode({ code: data.code });
        if (response.status) {
          navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.RESET_PASSWORD}`, {
            state: { code: data.code },
          });
        }
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleResendCode = async () => {
    setTimer(60);
    setIsTimerRunning(true);
    try {
      await resendCode({ email: state?.email });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    localStorage.removeItem('clientSignup')

    if (isTimerRunning && timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }

    return () => clearInterval(intervalId);
  }, [isTimerRunning, timer]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>Enter code</span>
        <span>
          We’ve sent a code to
          <br />
          <span className={styles.boldText}>{state?.email}</span>
        </span>
      </div>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        <VerificationInput
          error={!!error}
          onChange={onVerifyChange}
          length={optCodeLength}
        />

        <span className={styles.error}>{error}</span>
        {!!timer ? (
          <span className={styles.text}>
            Send code again {formatSecondsToMinutesAndSeconds(timer)}
          </span>
        ) : (
          <span className={styles.text}>
            I didn’t receive a code (check junk){' '}
            <span className={styles.boldText} onClick={handleResendCode}>
              Resend
            </span>
          </span>
        )}

        <Button
          fullWidth
          className={styles.button}
          type={'submit'}
          label={'Done'}
          disabled={isDisabled}
          isLoading={isLoadingButton}
        />
      </form>
    </div>
  );
};

export default Verification;
