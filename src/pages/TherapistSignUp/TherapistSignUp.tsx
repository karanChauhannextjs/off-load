import React, {useEffect, useState} from 'react';
import cn from 'classnames';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

import styles from './TherapistSignUp.module.scss';
import { Button, Checkbox, Input } from '@shared/ui';
import { schema } from './TherapistSignUp.validatio.ts';
import { signupInfoData } from '@constants/signupInfoData.ts';
import { THERAPIST_SIGNUP_FORM_FIELDS } from './TherapistSignUp.types.ts';
import {RoutesEnum, USER_PUBLIC_BASE_URL} from "@routes/Routes.types.ts";
import {useUserAuthStore} from "@store/auth.ts";
import {ITherapistSignupForm} from "@models/auth.ts";
import BlackStar from '@assets/svg/blackStar2.svg'

export type FormData = yup.InferType<typeof schema>;
const TherapistSignUp: React.FC = () => {
  const [error, setError] = useState<any>()
  const navigate = useNavigate();
  const registration = useUserAuthStore(state=>state.registration)
  const registrationStatus = useUserAuthStore(state=>state.registrationStatus)
  const exerciseCompleteData = JSON.parse(localStorage.getItem('exerciseCompleteData') ?? '{}');
  const checkinCompleteData = JSON.parse(localStorage.getItem('checkinCompleteData') ?? '{}');

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleFormSubmit = async (data: ITherapistSignupForm) => {
    try {
      const response = await registration({
        username: data.username,
        email: data.email,
        password: data.password,
        agreeUpdates: data.agreeUpdates,
        type: 1,
      });
      if (response) {
        navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.VERIFICATION}`, {
          state: {
            email: data.email,
            fromSignUp: true,
          },
        });
      }
    } catch (error:any) {
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

  const onLogin = () =>{
    navigate('/auth/login')
  }

  const onClientSignUp = () =>{
    navigate('/auth/client-sign-up')
  }

  const onTermsOfUse = () =>{
    window.open('https://www.offloadweb.com/terms-of-service-professionals', '_blanc')
  }

  const onPrivacyPolicy = () =>{
    window.open('https://www.offloadweb.com/privacy-policy', '_blanc')
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onSignupClose = () => {
    if (exerciseCompleteData?.answers || checkinCompleteData?.feeling) {
      navigate(-2);
      localStorage.removeItem('exerciseCompleteData');
      localStorage.removeItem('checkinCompleteData');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.closeWrapper} onClick={onSignupClose}>
        <i className={cn('icon-plus',styles.closeIcon)} />
      </span>
      <div className={styles.leftWrapper}>
        <img src={BlackStar} alt="bs" className={styles.blackStar} />
        <div className={styles.infoBlock}>
          {signupInfoData.map((item) => {
            const { title, description } = item;
            return (
              <div key={item.id} className={styles.itemWrapper}>
                <div className={styles.checkWrapper}>
                  <div className={styles.yellowCircle}>
                    <i className={cn('icon-check', styles.icon)} />
                  </div>
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.infoTitle}>{title}</span>
                  <span className={styles.infoDescription}>{description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.rightWrapper}>
        <div className={styles.titleBlock}>
          <span className={styles.title}>Create your free therapist account</span>
          <span className={styles.subtitle}>
            Choose your Offload username. You can always change it later
          </span>
        </div>
        <form autoComplete={'off'} className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
          {error?.message && (
            <span className={styles.error}>{error?.message}</span>
          )}
          <div className={styles.usernameBlock}>
            <div className={styles.webLinkWrapper}>
              <span className={styles.webLink}>Offloadweb.com/</span>
            </div>
            <Input
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              className={styles.username}
              placeholder={'username'}
              {...register(THERAPIST_SIGNUP_FORM_FIELDS.USERNAME)}
              errorMessage={
                errors[THERAPIST_SIGNUP_FORM_FIELDS.USERNAME]?.message
              }
            />
          </div>

          <Input
            placeholder={'Email'}
            {...register(THERAPIST_SIGNUP_FORM_FIELDS.EMAIL)}
            errorMessage={errors[THERAPIST_SIGNUP_FORM_FIELDS.EMAIL]?.message}
          />
          <Input
            type={'password'}
            placeholder={'Password (min 8 characters)'}
            {...register(THERAPIST_SIGNUP_FORM_FIELDS.PASSWORD)}
            errorMessage={
              errors[THERAPIST_SIGNUP_FORM_FIELDS.PASSWORD]?.message
            }
          />
          <Checkbox
            className={styles.checkbox}
            {...register(THERAPIST_SIGNUP_FORM_FIELDS.AGREE_UPDATES)}
            label={'I agree to the occasional update from Offload'}
          />
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
            Are you a client?{' '}
            <span onClick={onClientSignUp}>Sign up or Log in </span>
          </span>
          <span className={styles.label}>
            By proceeding you agree to our{' '}
            <span onClick={onTermsOfUse}>Terms</span> and{' '}
            <span onClick={onPrivacyPolicy}>Privacy Policy</span>
          </span>
        </div>
      </div>
    </div>
  );
};
export default TherapistSignUp;
