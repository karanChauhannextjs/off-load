import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Badge, Button, Input } from '@shared/ui';
import styles from './Onboarding.module.scss';
import { schema } from './Onboarding.validation.ts';
import { ONBOARDING_FORM_FIELDS } from './Onboarding.types.ts';
import { ISpeciality } from '@models/global.ts';
import {getSpecialities} from "@api/global.ts";
import {updateProfile} from "@api/profile.ts";
import { PLANS_AND_BILLINGS } from '@routes/Routes.types.ts';
import {useNavigate} from "react-router-dom";
import {IOnboardingForm} from "@models/auth.ts";

export type FormData = yup.InferType<typeof schema>;
const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const [isActiveIds, setIsActiveIds] = useState<number[]>([]);
  const [specialities,setSpecialities] = useState<ISpeciality[]>([])
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onClickBadge = (id: number) => {
    const includesId = isActiveIds?.includes(id);
    if (includesId) {
      const filteredArr = isActiveIds?.filter((e) => e !== id);
      setIsActiveIds(filteredArr);
    } else if (isActiveIds?.length < 6) {
      isActiveIds?.push(id);
      setIsActiveIds([...isActiveIds]);
    }
  };

  const handleFormSubmit = async (data: IOnboardingForm) => {
    try{
      const body = {
        name:data?.name,
        specialities:isActiveIds,
      }
      const response = await updateProfile(body)
      if(!!response){
        localStorage.setItem('user', JSON.stringify(response));
        localStorage.setItem('fromOnboarding', 'yes');
        // navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`)
        navigate(`${PLANS_AND_BILLINGS}`);
      }
    } catch (e) {
      console.log(e)

    }
  };

  useEffect(() => {
    getSpecialities().then(res=>{
      setSpecialities(res)
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>Tell us about yourself</span>
        <span>This will personalise your Offload experience</span>
      </div>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        <span className={styles.boldText}>What’s your name?</span>
        <Input
          placeholder={'Your name'}
          {...register(ONBOARDING_FORM_FIELDS.NAME)}
          errorMessage={errors[ONBOARDING_FORM_FIELDS.NAME]?.message}
        />
        <div className={styles.infosWrapper}>
          <span className={styles.boldText}>What do you specialise in?</span>
          <span>
            Select up to 6. You can change these later and add your own
          </span>
        </div>
        <div className={styles.badgesWrapper}>
          {specialities?.map((item: ISpeciality) => {
            const { id, name } = item;
            return (
              <Badge
                id={id}
                key={id}
                label={name}
                isActive={isActiveIds?.includes(id)}
                className={styles.badge}
                onClick={() => {
                  onClickBadge(id);
                }}
              />
            );
          })}
        </div>
        <Button
          fullWidth
          type={'submit'}
          label={'Continue'}
          className={styles.button}
        />
      </form>
    </div>
  );
};

export default Onboarding;
