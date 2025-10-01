import React from 'react';
import { GoogleDisconnectModalProps } from './GoogleDisconnectModal.types.ts';
import styles from './GoogleDisconnectModal.module.scss';
import { Button } from '@shared/ui';
import { useAppModalSimpleHandlers } from '@shared/ui/AppModal/AppModal.tsx';
import { googleDisconnect } from '@api/google.ts';
import toast from 'react-hot-toast';

const GoogleDisconnectModal: React.FC<GoogleDisconnectModalProps> = (props) => {
  const { setDisconnectShow } = props;
  const modalHandlers = useAppModalSimpleHandlers();

  const onDisconnect = () => {
    googleDisconnect()
      .then((res:any) => {
        if (res?.status) {
          toast.success('Calendar disconnected');
          setDisconnectShow(false);
          modalHandlers.close();
        }
      })
      .catch(() => {
        toast.error('Failed google disconnect');
      });
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>Calendar connection</span>
      <span>Disconnect this calendar?</span>
      <Button
        fullWidth
        label={'Disconnect'}
        onClick={onDisconnect}
        className={styles.buttonDisconnect}
      />
    </div>
  );
};
export default GoogleDisconnectModal;
