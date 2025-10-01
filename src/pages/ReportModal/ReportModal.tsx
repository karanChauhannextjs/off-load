import React, { useEffect } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { yupResolver } from '@hookform/resolvers/yup';

import styles from './ReportModal.module.scss';
import { Button, Input, Textarea } from '@shared/ui';
import { schema } from './ReportModal.validation.ts';
import { IBodyReport } from '@models/global.ts';
import { REPORT_MODAL_FIELDS, ReportModalProps } from './ReportModal.types.ts';
import { useGlobalStore } from '@store/global.ts';

export type FormData = yup.InferType<typeof schema>;

const ReportModal: React.FC<ReportModalProps> = (props) => {
  const { setReportShow } = props;
  const createReport = useGlobalStore((state) => state.createReport);
  const createReportStatus = useGlobalStore(
    (state) => state.createReportStatus,
  );
  const {
    setValue,
    watch,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  let descriptionLength = watch('text')?.length || 0;
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const handleFormSubmit = async (data: IBodyReport) => {
    try {
      await createReport(data);
      toast.success('Report submitted');
      setTimeout(() => {
        if (setReportShow) {
          setReportShow(false);
        }
      }, 1000);
    } catch (e: any) {
      toast.error(e);
    }
  };

  useEffect(() => {
    if (user.uuid) {
      setValue('email', user.email);
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <span className={styles.title}>Report a violation</span>
        <span>
          We take account violations seriously, review all requests and take
          action if required. Use the form below to report a violation or an
          account you think we should review.
        </span>
      </div>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {!user.uuid && (
          <Input
            className={styles.input}
            placeholder={'Email'}
            {...register(REPORT_MODAL_FIELDS.EMAIL)}
            errorMessage={errors[REPORT_MODAL_FIELDS.EMAIL]?.message}
          />
        )}
        <Textarea
          variant={'secondary'}
          maxLength={350}
          className={styles.textarea}
          placeholder={'Type your reason for reporting this account...'}
          {...register(REPORT_MODAL_FIELDS.TEXT)}
          errorMessage={errors[REPORT_MODAL_FIELDS.TEXT]?.message}
        />
        <span className={styles.label}>{descriptionLength}/350</span>
        <Button
          fullWidth
          type={'submit'}
          label={'Send'}
          isLoading={createReportStatus === 'LOADING'}
        />
      </form>
    </div>
  );
};
export default ReportModal;
