import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';

import styles from './CodeGenerationModal.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from './CodegenerationModal.validation';
import {
  CODE_GENERATION_FIELDS,
  CodeGenerationModalProps,
} from './CodegenerationModal.types';
import PlusPerson from '@assets/images/code-plus-person.svg';
import cn from 'classnames';
import { Button, Input } from '@shared/ui';
import { generateRandomString } from '@utils/helpers.ts';
import toast from "react-hot-toast";
import {useInvite} from "@store/invite.ts";
import {useProfileStore} from "@store/profile.ts";

export type FormData = yup.InferType<typeof schema>;

const CodeGenerationModal: React.FC<CodeGenerationModalProps> = (props) => {
  const { page, data, setCodeGenerationShow } = props;
  const [generated, setGenerated] = useState(false);
  const [code, setCode] = useState('');
  const inviteClient = useInvite(state => state.inviteClient)
  const inviteClientStatus = useInvite(state => state.inviteClientStatus)
  const getCurrentUser = useProfileStore(state => state.getCurrentUser)

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onGenerate = () => {
    setCode(generateRandomString());
    setGenerated(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const body = {
        name: data.name,
        email: data.email,
        code
      }
      const result = await inviteClient(body)
      if(result.status){
        const profileResult = await getCurrentUser();
        localStorage.setItem('user', JSON.stringify(profileResult?.result));
        localStorage.setItem('invitedClient', data.email);
        toast.success('Client invite sent!', {
          style:{width:335}
        })
      }
      setCodeGenerationShow(false);
    }
    catch (err){
      console.log('err', err)
    }
  };

  useEffect(() => {
    if (page === 'inbox') {
      setValue('name', data?.name);
      setValue('email', data?.email);
    }
  }, [page]);

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.plusIconWrapper}>
        <img src={PlusPerson} alt="plus" />
      </div>
      <span className={styles.title}>Share your connection code</span>
      <span className={styles.label}>
        Your client will receive a link to the Offload client app. They’ll then
        use the code to connect and share their care plan answers with you.
      </span>
      {!generated && <div className={styles.codeExample}>XXXXXX</div>}
      {!generated && (
        <span className={cn(styles.label, styles.shortLabel)}>
          Offload is free for clients to use and their data is encrypted.
        </span>
      )}
      {!generated && (
        <Button
          fullWidth
          label={'Generate connection code'}
          onClick={onGenerate}
        />
      )}
      {generated && (
        <div
          className={cn(styles.codeExample, {
            [styles.blackLabel]: generated,
          })}
        >
          {code}
        </div>
      )}
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {generated && page === 'clients' && (
          <>
            <Input
              placeholder={'Name'}
              {...register(CODE_GENERATION_FIELDS.NAME)}
              errorMessage={errors[CODE_GENERATION_FIELDS.NAME]?.message}
            />
            <Input
              placeholder={'Email'}
              {...register(CODE_GENERATION_FIELDS.EMAIL)}
              errorMessage={errors[CODE_GENERATION_FIELDS.EMAIL]?.message}
            />
          </>
        )}
        {generated && (
          <Button
            fullWidth
            className={styles.button}
            type={'submit'}
            label={'Add to clients'}
            isLoading={inviteClientStatus === 'LOADING'}
          />
        )}
      </form>
    </div>
  );
};
export default CodeGenerationModal;
