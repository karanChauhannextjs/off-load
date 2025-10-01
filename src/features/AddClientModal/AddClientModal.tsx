import React, { useEffect, useState } from 'react';
import styles from './AddClientModal.module.scss';
import { AddClientModalProps } from './AddClientModal.types.ts';
import { Button, Checkbox } from '@shared/ui';
import { ExerciseCard } from '@features/index.ts';
import toast from 'react-hot-toast';
import { useInvite } from '@store/invite.ts';
import { getInitialsLetters } from '@utils/helpers.ts';
import { useExercises } from '@store/exercises.ts';
import cn from 'classnames';
import { useProfileStore } from '@store/profile.ts';
import { PaidStatus } from '@constants/plans.ts';

const AddClientModal: React.FC<AddClientModalProps> = (props) => {
  const { data, setAddCardShow } = props;
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const getTherapistInviteClient = useInvite(
    (state) => state.getTherapistInviteClient,
  );
  const getTherapistInviteClientStatus = useInvite(
    (state) => state.getTherapistInviteClientStatus,
  );
  const [clientsData, setClientsData] = useState<any[]>([]);
  const joinExercise = useExercises((state) => state.joinExercise);
  const getCurrentUser = useProfileStore((state) => state.getCurrentUser);
  const currentUser = useProfileStore((state) => state.currentUser);

  const handleCheckboxChange = (uuid: string, client: any) => {
    const isAllowed =
      (currentUser.paidStatus === PaidStatus.Paid && currentUser.isSubscribed) ||
      (currentUser?.paidStatus !== PaidStatus.Paid && client?.isFirstInvited);

    if (!isAllowed) {
      toast.success('Please subscribe to a plan');
      return;
    }

    setClientsData((prevData) =>
      prevData?.map((client) =>
        client?.client?.uuid === uuid
          ? { ...client, checked: !client.checked }
          : client,
      ),
    );
  };

  const getCheckedClients = () => {
    return clientsData?.filter((client) => client.checked);
  };

  const onDone = async () => {
    try {
      const checkedClients = getCheckedClients();
      const checkedUuids = checkedClients?.map((item) => item?.client?.uuid);
      if (checkedUuids?.length) {
        await joinExercise({ uuids: checkedUuids, emails: [] }, data?.uuid);
        setAddCardShow(false);
        toast.success('Changes Saved!', { style: { width: 335 } });
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    try {
      getCurrentUser()
      getTherapistInviteClient(0, 1000).then((res: any) => {
        setClientsData(res?.data);
        // if (
        //   !currentUser.isSubscribed ||
        //   currentUser?.paidStatus !== PaidStatus.Paid
        // ) {
        //   const filteredData = res?.data.filter((e: any) => e.isFirstInvited);
        //   setClientsData(filteredData);
        // } else {
        // setClientsData(res?.data);
        // }
      });
    } catch (err) {
      console.log('error', err);
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.topWrapper}>
        {!isMobileScreen && <span className={styles.label}>Add to client</span>}
      </div>
      <div className={styles.main}>
        <div className={styles.left}>
          <ExerciseCard cardData={data} isEmpty={true} size={'small'} />
          {isMobileScreen && (
            <span className={styles.label}>Add to client</span>
          )}
        </div>
        <div className={styles.right}>
          {clientsData?.map((client) => {
            return (
              <div className={styles.row}>
                <div className={styles.lettersWrapper}>
                  {getInitialsLetters(client?.name)}
                </div>
                <div className={styles.checkBlock}>
                  <span className={styles.label}>{client?.name}</span>
                  <Checkbox
                    variant={'secondary'}
                    checked={!!client.checked}
                    onChange={() => handleCheckboxChange(client?.client?.uuid, client)}
                  />
                </div>
              </div>
            );
          })}
          {!clientsData?.length &&
            getTherapistInviteClientStatus === 'SUCCESS' && (
              <span>
                No clients yet. Please go to Clients {'>'} Add Client.
              </span>
            )}
        </div>
      </div>
      <Button
        fullWidth={isMobileScreen}
        label={'Done'}
        className={cn(styles.button, {
          [styles.disabled]: !getCheckedClients()?.length,
        })}
        onClick={onDone}
      />
    </div>
  );
};
export default AddClientModal;
