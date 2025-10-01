import { useEffect, useState } from 'react';
import * as yup from 'yup';
import cn from 'classnames';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button, Input, Switch } from '@shared/ui';
import styles from './ClientAccount.module.scss';
import { schema } from './ClientAccount.validation.ts';
import { USER_PUBLIC_URL } from '@routes/Routes.types.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { FeedbackModal } from '@pages/index.ts';
import { CLIENT_ACCOUNT_FORM_FIELDS } from '@pages/ClientAccount/ClientAccount.types.ts';
import { getProfile, updateSettings } from '@api/profile.ts';
import { IBodyUpdateSettings, IProfile } from '@models/profile.ts';
import { useProfileStore } from '@store/profile.ts';

export type FormData = yup.InferType<typeof schema>;
const ClientAccount = () => {
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const resetProfile = useProfileStore(state => state.reset);
  const [pageData, setPageData] = useState<IProfile>();
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);

  const {
    reset,
    setValue,
    register,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onClickSignOut = () => {
    resetProfile()
    localStorage.clear();
    navigate(`${USER_PUBLIC_URL}`);
    // window.location.reload();
  };
  const onClickFeedback = () => {
    modalHandlers.show();
    setFeedbackShow(true);
  };

  const handleFormSubmit = async (data: IBodyUpdateSettings) => {
    try {
      const updateSettingsBody = {
        name: data.name,
        isEnabledNewMessages: data.isEnabledNewMessages,
        isEnabledSessionReminders: data.isEnabledSessionReminders,
        isEnabledSessionReschedules: data.isEnabledSessionReschedules,
      };
      reset(data);
      await updateSettings(updateSettingsBody);
      toast.success('Account updated successfully!');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getProfile()
      .then((res) => {
        setPageData(res?.result);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    if (pageData) {
      Object.entries(pageData)?.forEach(([key, value]) => {
        // @ts-ignore
        setValue(key, value);
      });
    }
  }, [pageData]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>Settings</span>
            <Button
              disabled={!isDirty}
              type={'submit'}
              variant={'quaternary'}
              label={'Save'}
              className={styles.button}
            />
          </div>
          <div className={styles.line}></div>
          <div className={styles.nameWrapper}>
            <span className={styles.label}>Name</span>
            <Input
              placeholder={'Name'}
              {...register(CLIENT_ACCOUNT_FORM_FIELDS.NAME)}
              errorMessage={errors[CLIENT_ACCOUNT_FORM_FIELDS.NAME]?.message}
            />
          </div>
          <div className={styles.block}>
            <span className={styles.label}>Email notifications</span>
            <div className={styles.row2}>
              <span className={styles.label2}>Session reminders</span>
              <Switch
                {...register(CLIENT_ACCOUNT_FORM_FIELDS.SESSION_REMINDERS)}
              />
            </div>
            <div className={styles.row2}>
              <span className={styles.label2}>
                Sessions rescheduled or cancelled
              </span>
              <Switch
                {...register(CLIENT_ACCOUNT_FORM_FIELDS.SESSIONS_ADDED)}
              />
            </div>
            <div className={styles.row}>
              <span className={styles.label2}>New messages</span>
              <Switch {...register(CLIENT_ACCOUNT_FORM_FIELDS.NEW_MESSAGES)} />
            </div>
            <span
              className={cn(styles.label4, styles.signOut)}
              onClick={onClickSignOut}
            >
              Sign out
            </span>
            <span className={styles.label4} onClick={onClickFeedback}>
              Send feedback
            </span>
          </div>
        </form>
      </div>
      {feedbackShow && (
        <AppModal width={389} {...modalHandlers}>
          <FeedbackModal setFeedbackShow={setFeedbackShow} />
        </AppModal>
      )}
    </div>
  );
};
export default ClientAccount;
