import React from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';

import styles from './FeedbackModal.module.scss';
import { Button, Input, Textarea } from '@shared/ui';
import { schema } from './FeedbackModal.validation.ts';
import {
  FEEDBACK_MODAL_FIELDS,
  FeedbackModalProps,
} from './FeedbackModal.types.ts';
import { IBodyFeedback } from '@models/global.ts';
import { useGlobalStore } from '@store/global.ts';

export type FormData = yup.InferType<typeof schema>;

const FeedbackModal: React.FC<FeedbackModalProps> = (props) => {
  const { setFeedbackShow } = props;
  const createFeedback = useGlobalStore((state) => state.createFeedback);
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const createFeedbackStatus = useGlobalStore(
    (state) => state.createFeedbackStatus,
  );
  const {
    //getValues,
    watch,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  let descriptionLength = watch('text')?.length || 0;

  const handleFormSubmit = async (data: IBodyFeedback) => {
    try {
      if(user?.uuid){
        const body ={
          ...data,
          email: user?.email
        }
        await createFeedback(body);
      }else {
        await createFeedback(data);
      }
      toast.success('Feedback sent, thank you!');
      if (setFeedbackShow) {
        setFeedbackShow(false);
      }
    } catch (e) {
      // @ts-ignore
      toast.error(e);
      console.log(e);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <span className={styles.title}>Send Feedback</span>
        <span>
          Hello, thanks for being here. Let us know your feedback below
        </span>
      </div>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {!user?.uuid && (
          <Input
            className={styles.input}
            placeholder={'Email (optional)'}
            {...register(FEEDBACK_MODAL_FIELDS.EMAIL)}
            errorMessage={errors[FEEDBACK_MODAL_FIELDS.EMAIL]?.message}
          />
        )}
        <Textarea
          variant={'secondary'}
          maxLength={350}
          className={styles.textarea}
          placeholder={'How could Offload be improved for you?'}
          {...register(FEEDBACK_MODAL_FIELDS.TEXT)}
          errorMessage={errors[FEEDBACK_MODAL_FIELDS.TEXT]?.message}
        />
        <span className={styles.label}>{descriptionLength}/350</span>
        <Button
          fullWidth
          type={'submit'}
          label={'Send Feedback'}
          isLoading={createFeedbackStatus === 'LOADING'}
        />
      </form>
    </div>
  );
};
export default FeedbackModal;
