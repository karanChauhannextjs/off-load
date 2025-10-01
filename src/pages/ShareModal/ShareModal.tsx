import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import styles from './ShareModal.module.scss';
import { Button } from '@shared/ui';
import { ShareModalProps } from './ShareModal.types.ts';
import {currentBaseUrl} from "@utils/helpers.ts";

const ShareModal: React.FC<ShareModalProps> = (props) => {
  const { link, setShareShow } = props;
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const onCopyHandler = async (type?: string) => {
    if (isMobileScreen) {
      const shareData = {
        title:'Offload',
        text: '',
        url: type === 'sessions' ? `${currentBaseUrl}/${link}/sessions` : `${currentBaseUrl}/${link}`
      }
      if(navigator.share){
        try {
          await navigator.share(shareData);
        } catch (error:any) {
          console.error('Error sharing:', error);
        }
      }
    } else {
      if (type === 'sessions') {
        navigator.clipboard.writeText(`${currentBaseUrl}/${link}/sessions`);
      } else {
        navigator.clipboard.writeText(`${currentBaseUrl}/${link}`);
      }
      toast.success('Link copied to clipboard');
      setTimeout(() => {
        if (setShareShow) {
          setShareShow(false);
        }
      }, 500);
    }
  };

  const onViewHandler = (path: string) => {
    window.open(`${currentBaseUrl}/${path}`);
    if (setShareShow) {
      setShareShow(false);
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.topWrapper}>
        <span className={styles.title}>Share your page:</span>
        <span className={styles.link}>{`stage.offloadweb.com/${link}`}</span>
        <div className={styles.actions}>
          <Button
            label={'Copy URL'}
            variant={'tertiary'}
            icon={'copy'}
            iconClassName={styles.icon}
            onClick={onCopyHandler}
          />
          <Button
            label={'View'}
            variant={'tertiary'}
            icon={'redirect'}
            iconClassName={styles.icon}
            onClick={() => {
              onViewHandler(link);
            }}
          />
        </div>
      </div>
      <div className={styles.bottomWrapper}>
        <span className={styles.title}>Share sessions only page:</span>
        <span className={styles.text}>
          Useful, for example, if you only activate consultations on your page.
          Then send this private session booking link to the clients you wish to
          book sessions with. Works even when sessions are toggled off.
        </span>
        <span className={styles.link}>{`stage.offloadweb.com/${link}/sessions`}</span>
        <div className={styles.actions}>
          <Button
            label={'Copy URL'}
            variant={'tertiary'}
            icon={'copy'}
            iconClassName={styles.icon}
            onClick={() => {
              onCopyHandler('sessions');
            }}
          />
          <Button
            label={'View'}
            variant={'tertiary'}
            icon={'redirect'}
            iconClassName={styles.icon}
            onClick={() => {
              onViewHandler(`${link}/sessions`);
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default ShareModal;
