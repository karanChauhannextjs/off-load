import React, {useState} from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button, Input } from '@shared/ui';
import styles from './ForgotPassword.module.scss';
import { schema } from './ForgotPassword.validation.ts';
import { FORGOT_PASSWORD_FORM_FIELDS } from './ForgotPassword.types.ts';
import { useNavigate } from 'react-router-dom';
import {RoutesEnum, USER_PUBLIC_BASE_URL} from "@routes/Routes.types.ts";
import {useUserAuthStore} from "@store/auth.ts";
import {IForgotForm} from "@models/auth.ts";

export type FormData = yup.InferType<typeof schema>;
const ForgotPassword: React.FC = () => {
  const [error, setError] = useState<any>();
  const navigate = useNavigate();
  const forgotPassword = useUserAuthStore(state=>state.forgotPassword);
  const forgotPasswordStatus = useUserAuthStore(state=>state.forgotPasswordStatus);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleFormSubmit = async (data: IForgotForm) => {
    try {
      const response = await forgotPassword({
        email: data.email,
      });
      if (response.status) {
        navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.VERIFICATION}`, {
          state: {
            email: data.email,
            fromForgot: true,
          },
        });
      }
    } catch (error) {
      setError(error);
    }
  };

  const onLogin = () =>{
    navigate('/auth/login')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>Forgot Password?</span>
        <span>
          It happens! Please enter the email associated with your account.
        </span>
      </div>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {error?.message && <span className={styles.error}>{error?.message}</span>}
        <Input
          placeholder={'Email'}
          {...register(FORGOT_PASSWORD_FORM_FIELDS.EMAIL)}
          errorMessage={errors[FORGOT_PASSWORD_FORM_FIELDS.EMAIL]?.message}
        />
        <Button
          fullWidth
          className={styles.button}
          isLoading={forgotPasswordStatus === 'LOADING'}
          type={'submit'}
          label={'Send Code'}
        />
      </form>
      <span className={styles.label}>
        Remember Password? <span onClick={onLogin}>Log in</span>
      </span>
    </div>
  );
};

export default ForgotPassword;
