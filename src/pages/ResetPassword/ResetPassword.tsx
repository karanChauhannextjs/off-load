import React from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button, Input } from '@shared/ui';
import styles from './ResetPassword.module.scss';
import { schema } from './ResetPassword.validation.ts';
import { RESET_PASSWORD_FORM_FIELDS } from './ResetPassword.types.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import {CLIENT_PRIVATE_BASE_URL, RoutesEnum, THERAPIST_PRIVATE_BASE_URL} from "@routes/Routes.types.ts";
import {USER_TYPES} from "@constants/user.ts";
import {useUserAuthStore} from "@store/auth.ts";
import {ISetPasswordForm} from "@models/auth.ts";

export type FormData = yup.InferType<typeof schema>;
const ResetPassword: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const setPassword = useUserAuthStore( state => state.setPassword)
  const setPasswordStatus = useUserAuthStore( state => state.setPasswordStatus)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleFormSubmit = async (data: ISetPasswordForm) => {
    try {
      const response = await setPassword({
        code: state.code,
        password: data.repeat_password,
      });
      if (response.token) {
        localStorage.setItem('user', JSON.stringify(response));
        localStorage.setItem('ACCESS_TOKEN', response.token);
        if (response.type === USER_TYPES.THERAPIST) {
          navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`);
        } else if (response.type === 2) {
          navigate(`${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_HOME}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onLogin = () => {
    navigate('/auth/login')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>Reset Password</span>
      </div>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        <Input
          type={'password'}
          placeholder={'New password (min 8 characters)'}
          {...register(RESET_PASSWORD_FORM_FIELDS.NEW_PASSWORD)}
          errorMessage={
            errors[RESET_PASSWORD_FORM_FIELDS.NEW_PASSWORD]?.message
          }
        />
        <Input
          type={'password'}
          placeholder={'Repeat password'}
          {...register(RESET_PASSWORD_FORM_FIELDS.REPEAT_PASSWORD)}
          errorMessage={
            errors[RESET_PASSWORD_FORM_FIELDS.REPEAT_PASSWORD]?.message
          }
        />
        <Button
          fullWidth
          className={styles.button}
          type={'submit'}
          label={'Reset Password'}
          isLoading={setPasswordStatus === 'LOADING'}
        />
      </form>
      <span className={styles.label}>
        Remember Password? <span onClick={onLogin}>Log in</span>
      </span>
    </div>
  );
};

export default ResetPassword;
