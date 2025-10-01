import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import cn from 'classnames';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import styles from './Account.module.scss';
import { schema } from './Account.validation.ts';
import { Button, Input, Switch } from '@shared/ui';
import { ACCOUNT_FORM_FIELDS } from '@pages/Account/Account.types.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { FeedbackModal } from '@pages/index.ts';
import {
  PLANS_AND_BILLINGS,
  USER_PUBLIC_URL,
} from '@routes/Routes.types.ts';
import { updateSettings } from '@api/profile.ts';
import toast from 'react-hot-toast';
import { IAccountForm } from '@models/account.ts';
import { useProfileStore } from '@store/profile.ts';
import { PaidStatus } from '@constants/plans.ts';

export type FormData = yup.InferType<typeof schema>;

const Account: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const modalHandlers = useAppModalSimpleHandlers();
  const resetProfile = useProfileStore(state => state.reset);
  const [isShowChild, setIsShowChild] = useState<boolean>(false);
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const getProfileData = useProfileStore((state) => state.getProfile);
  const pageData = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const updateProfileStatus = useProfileStore(
    (state) => state.updateProfileStatus,
  );

  const {
    reset,
    setValue,
    register,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // const connectDisabled = !!pageData?.stripeAccountId;

  const onNavigate = () => {
    // setIsShowChild(true);
    navigate(`${PLANS_AND_BILLINGS}`);
    localStorage.setItem('toSubscription', location.pathname)

  };

  // const onClickConnect = () => {
  //   if (connectDisabled) {
  //     window.open(
  //       'https://dashboard.stripe.com/login?redirect=%2Fdashboard',
  //       '_blanc',
  //     );
  //   } else {
  //     //const liveClientId = 'ca_QXVxusPcozpXRAoBPJfKiTt4lrCZRqd9'
  //     const clientId = 'ca_QXVxPTWNF3xIdwIbKY84V8bQLgbiMjJe'; // Replace with your actual client ID
  //     //const redirectUri = `${currentBaseUrl}`;
  //     //const redirectUri = 'http://localhost:5173/stripe/-connect-stripe';
  //     // &redirect_uri=${redirectUri}
  //     window.location.href = `https://connect.stripe.com/oauth/v2/authorize?response_type=code&client_id=${clientId}&scope=read_write`;
  //   }
  // };

  const onClickSignOut = () => {
    resetProfile();
    localStorage.clear();
    navigate(`${USER_PUBLIC_URL}`);
    // window.location.reload();
  };

  const onClickFeedback = () => {
    modalHandlers.show();
    setFeedbackShow(true);
  };

  const handleFormSubmit = async (data: IAccountForm) => {
    try {
      const profileUpdateBody =
        pageData?.username === data.username
          ? {
              address: data.address,
            }
          : {
              username: data.username,
              address: data.address,
            };
      await updateProfile(profileUpdateBody);
      const updateSettingsBody = {
        isEnabledNewMessages: data.isEnabledNewMessages,
        isEnabledSessionReminders: data.isEnabledSessionReminders,
        isEnabledSessionReschedules: data.isEnabledSessionReschedules,
      };
      reset(data);
      await updateSettings(updateSettingsBody);
      toast.success('Account updated successfully!');
      // await getProfileData();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getProfileData();
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
    <>
      {!isShowChild ? (
        <div className={cn(styles.wrapper, {[styles.wrapperWithUpgradeBanner]: !pageData?.isSubscribed || pageData?.paidStatus !== PaidStatus.Paid})}>
          <form
            className={styles.form}
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <div className={styles.titleWrapper}>
              <span className={styles.title}>Account</span>
              <Button
                className={styles.button}
                type={'submit'}
                variant={'quaternary'}
                label={'Save'}
                disabled={!isDirty}
                isLoading={updateProfileStatus === 'LOADING'}
              />
            </div>
            <div className={styles.line}></div>
            <div className={styles.block}>
              <span className={styles.label}>Username</span>
              <span className={styles.placeholder}>offloadweb.co/</span>
              <Input
                variant={'secondary'}
                className={styles.usernameInput}
                {...register(ACCOUNT_FORM_FIELDS.USERNAME)}
                errorMessage={errors[ACCOUNT_FORM_FIELDS.USERNAME]?.message}
              />
            </div>

            {/*<div className={styles.block}>*/}
            {/*  <span className={styles.label}>In person session address</span>*/}
            {/*  <span className={styles.label3}>*/}
            {/*    If you offer in-person sessions, this address is shared with*/}
            {/*    clients after purchase. It is not shown publicly.*/}
            {/*  </span>*/}
            {/*  <Input*/}
            {/*    variant={'secondary'}*/}
            {/*    placeholder={'Add Address'}*/}
            {/*    {...register(ACCOUNT_FORM_FIELDS.ADDRESS)}*/}
            {/*    // errorMessage={errors[ACCOUNT_FORM_FIELDS.ADDRESS]?.message}*/}
            {/*  />*/}
            {/*</div>*/}

            {/*<div className={styles.block}>*/}
            {/*  <span className={styles.label}>Payments</span>*/}
            {/*  <div className={styles.row}>*/}
            {/*    <div className={styles.stripeWrapper}>*/}
            {/*      <span className={styles.label2}>Stripe Account</span>*/}
            {/*      <div className={styles.stripeButton}>*/}
            {/*        <span className={styles.stripe}>stripe</span>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*    {connectDisabled ? (*/}
            {/*      <button*/}
            {/*        type={'button'}*/}
            {/*        className={styles.viewStripeButton}*/}
            {/*        onClick={onClickConnect}*/}
            {/*      >*/}
            {/*        View in Stripe*/}
            {/*      </button>*/}
            {/*    ) : (*/}
            {/*      <Button*/}
            {/*        // disabled={connectDisabled}*/}
            {/*        className={styles.connectButton}*/}
            {/*        label={connectDisabled ? 'View in Stripe' : 'Connect'}*/}
            {/*        onClick={onClickConnect}*/}
            {/*      />*/}
            {/*    )}*/}
            {/*  </div>*/}

            {/*  <div*/}
            {/*    style={{ cursor: 'pointer' }}*/}
            {/*    className={styles.row}*/}
            {/*    onClick={() => {*/}
            {/*      onNavigate(RoutesEnum.TRANSACTIONS);*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    <span className={styles.label2}>Transactions</span>*/}
            {/*    <i className={cn('icon-right-arrow', styles.icon)} />*/}
            {/*  </div>*/}
            {/*</div>*/}

            <div className={styles.block}>
              <span className={styles.label}>Plan</span>
              <div
                style={{ cursor: 'pointer' }}
                className={styles.row}
                onClick={onNavigate}
              >
                <span className={styles.label2}>Plans & Billing</span>
                <i className={cn('icon-right-arrow', styles.icon)} />
              </div>
            </div>

            <div className={cn(styles.block, styles.notifyBlock)}>
              <span className={styles.label}>Email notifications</span>
              <div className={styles.row2}>
                <span className={styles.label2}>Session reminders</span>
                <Switch {...register(ACCOUNT_FORM_FIELDS.SESSION_REMINDERS)} />
              </div>
              <div className={styles.row2}>
                <span className={styles.label2}>
                  Sessions added, rescheduled or cancelled
                </span>
                <Switch {...register(ACCOUNT_FORM_FIELDS.SESSIONS_ADDED)} />
              </div>
              <div className={styles.row}>
                <span className={styles.label2}>New messages</span>
                <Switch {...register(ACCOUNT_FORM_FIELDS.NEW_MESSAGES)} />
              </div>
              <span className={cn(styles.label4)} onClick={onClickSignOut}>
                Sign out
              </span>
              <span className={styles.label4} onClick={onClickFeedback}>
                Send feedback
              </span>
            </div>
          </form>
          {feedbackShow && (
            <AppModal width={389} {...modalHandlers}>
              <FeedbackModal setFeedbackShow={setFeedbackShow} />
            </AppModal>
          )}
        </div>
      ) : (
        <Outlet context={[setIsShowChild]} />
      )}
    </>
  );
};
export default Account;
