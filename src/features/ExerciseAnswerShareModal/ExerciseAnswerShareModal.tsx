import React, { useEffect, useState } from 'react';
import { ExerciseShareModalProps } from './ExerciseAnswerShareModal.types.ts';
import styles from './ExerciseAnswerShareModal.module.scss';
import { useAppModalSimpleHandlers } from '@shared/ui/AppModal/AppModal.tsx';
import { currentBaseUrl } from '@utils/helpers.ts';
import Copy from '@assets/icons/copy.svg';
import Email from '@assets/svg/email.svg';
import WhatsApp from '@assets/svg/whatsapp.svg';
import toast from 'react-hot-toast';

const ExerciseAnswerShareModal: React.FC<ExerciseShareModalProps> = (props) => {
  const { setCloseModalShow, data } = props;
  const modalHandlers = useAppModalSimpleHandlers();
  const shareUrl = `${currentBaseUrl}/exercise`;
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data);
        toast.success('Text copied!');
        setCloseModalShow(false)
        modalHandlers.close()
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = data;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-9999px';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          toast.success('Text copied!');
          setCloseModalShow(false)
          modalHandlers.close()
        } else {
          console.log('Copy command was unsuccessful');
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('');
    const body = encodeURIComponent(`${data}\n`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;

    if (!isMobileScreen) {
      window.open(emailUrl);
    } else {
      window.location.href = emailUrl;
    }
    setCloseModalShow(false)
    modalHandlers.close()
  };

  const handleWhatsAppShare = async () => {
    if (!isMobileScreen) {
      const text = encodeURIComponent(`${data}\n`);
      const whatsappUrl = `https://wa.me/?text=${text}`;
      window.open(whatsappUrl, '_blank');
      setCloseModalShow(false)
      modalHandlers.close()
    } else {
      // Try native share first on mobile
      if (navigator.share && window.isSecureContext) {
        try {
          await navigator.share({
            title: '',
            text: data,
            url: shareUrl,
          });
          return;
        } catch (error) {
          console.error('Native share failed:', error);
        }
      }

      // Fallback to WhatsApp URL
      const text = encodeURIComponent(`${data}\n`);
      const whatsappUrl = `https://wa.me/?text=${text}`;
      window.location.href = whatsappUrl;
      setCloseModalShow(false)
      modalHandlers.close()
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
      <div className={styles.shareIconsWrapper}>
        <div className={styles.shareBlock}>
          <div className={styles.shareIconWrapper} onClick={handleCopyText}>
            <img src={Copy} alt="Icon" className={styles.icon} />
          </div>
          <span>Copy Text</span>
        </div>
        <div className={styles.shareBlock}>
          <div className={styles.shareIconWrapper} onClick={handleEmailShare}>
            <img src={Email} alt="Icon" />
          </div>
          <span>Email</span>
        </div>
        <div className={styles.shareBlock}>
          <div
            className={styles.shareIconWrapper}
            onClick={handleWhatsAppShare}
          >
            <img src={WhatsApp} alt="Icon" />
          </div>
          <span>WhatsApp</span>
        </div>
      </div>
    </div>
  );
};
export default ExerciseAnswerShareModal;
