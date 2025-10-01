import React, { useEffect, useState } from 'react';
import { ExerciseShareModalProps } from './ExerciseShareModal.types.ts';
import styles from './ExerciseShareModal.module.scss';
import { Button } from '@shared/ui';
import { useNavigate } from 'react-router-dom';
import { useAppModalSimpleHandlers } from '@shared/ui/AppModal/AppModal.tsx';
import cn from 'classnames';
import { RoutesEnum, USER_PUBLIC_BASE_URL } from '@routes/Routes.types.ts';
import { ExerciseCard } from '@features/index.ts';
import { currentBaseUrl } from '@utils/helpers.ts';
import ShadowMask from '@assets/svg/shareShadowMask.svg';
import Email from '@assets/svg/email.svg';
import WhatsApp from '@assets/svg/whatsapp.svg';
import Facebook from '@assets/svg/facebook.svg';
import Linkedin from '@assets/svg/linkedin.svg';
import toast from 'react-hot-toast';

const ExerciseShareModal: React.FC<ExerciseShareModalProps> = (props) => {
  const { setCloseModalShow, exercise } = props;
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const shareUrl = `${currentBaseUrl}/exercise/${exercise?.uuid}`;
  const title = 'Check out this therapy tool';
  const description = '100s of science-backed therapy tools | Offload';
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );

  const signupClick = () => {
    setCloseModalShow(false);
    modalHandlers.close();
    navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
  };

  const aboutClick = () => {
    window.open('https://www.offloadweb.com/', '_blanc');
  };

  const copyUrlClick = () => {
    navigator.clipboard.writeText(
      `${currentBaseUrl}/exercise/${exercise?.uuid}`,
    );
    toast.success('URL copied!');
  };

  const shareViaEmail = async () => {
    if (!isMobileScreen) {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(
        `${description}\n\nCheck it out here: ${shareUrl}`,
      );
      const emailUrl = `mailto:?subject=${subject}&body=${body}`;
      window.open(emailUrl);
    } else {
      const shareData = {
        title: title,
        text: description,
        url: shareUrl,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error: any) {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  const shareViaWhatsApp = async () => {
    if (!isMobileScreen) {
      const text = encodeURIComponent(
        `${title}\n\n${description}\n\n${shareUrl}`,
      );
      const whatsappUrl = `https://wa.me/?text=${text}`;
      window.open(whatsappUrl, '_blank');
    } else {
      const shareData = {
        title: title,
        text: description,
        url: shareUrl,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error: any) {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  const shareViaFacebook = async () => {
    if (!isMobileScreen) {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title + ' - ' + description)}`;
      window.open(facebookUrl, '_blank');
    } else {
      const shareData = {
        title: title,
        text: description,
        url: shareUrl,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error: any) {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  const shareViaLinkedIn = async () => {
    if (!isMobileScreen) {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
      window.open(linkedinUrl, '_blank');
    } else {
      const shareData = {
        title: title,
        text: description,
        url: shareUrl,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error: any) {
          console.error('Error sharing:', error);
        }
      }
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
      <span className={styles.bold}>Share</span>
      <ExerciseCard
        cardData={exercise}
        isFavoritable={false}
        size="small"
        withView={false}
        className={styles.card}
      />
      <div className={styles.copyUrlBlock}>
        <span
          className={styles.exerciseUrl}
        >{`${currentBaseUrl}/exercise/${exercise.uuid}`}</span>
        <img src={ShadowMask} alt="Mask" className={styles.shadowMask} />
        <Button
          variant={'secondary'}
          label={'Copy URL'}
          className={cn(styles.copyButton)}
          onClick={copyUrlClick}
        />
      </div>
      <div className={styles.shareIconsWrapper}>
        <div className={styles.shareBlock}>
          <div className={styles.shareIconWrapper} onClick={shareViaEmail}>
            <img src={Email} alt="Icon" />
          </div>
          <span>Email</span>
        </div>
        <div className={styles.shareBlock}>
          <div className={styles.shareIconWrapper} onClick={shareViaWhatsApp}>
            <img src={WhatsApp} alt="Icon" />
          </div>
          <span>WhatsApp</span>
        </div>
        <div className={styles.shareBlock}>
          <div className={styles.shareIconWrapper} onClick={shareViaFacebook}>
            <img src={Facebook} alt="Icon" />
          </div>
          <span>Facebook</span>
        </div>
        <div className={styles.shareBlock}>
          <div className={styles.shareIconWrapper} onClick={shareViaLinkedIn}>
            <img src={Linkedin} alt="Icon" />
          </div>
          <span>LinkedIn</span>
        </div>
      </div>
      {!user.type && (
        <div className={styles.footer}>
          <div className={styles.devider}></div>
          <div className={styles.footerLabels}>
            <span className={styles.bold}>Join Offload</span>
            <span className={styles.light}>
              Unlock 100+ therapy tools, exercises and videos
            </span>
          </div>
          <div className={styles.actionsWrapper}>
            <Button
              label={'Therapist sign up free'}
              fullWidth
              className={styles.button}
              onClick={signupClick}
            />
            <Button
              variant={'secondary'}
              label={'About'}
              className={cn(styles.button, styles.about)}
              onClick={aboutClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default ExerciseShareModal;
