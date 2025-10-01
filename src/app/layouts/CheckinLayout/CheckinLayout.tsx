import { useEffect, useState } from 'react';
import styles from './CheckinLayout.module.scss';
import cn from 'classnames';
import { Header } from '@features/index.ts';
import BurgerMenu from '@widgets/BurgerMenu';
import { CheckinComplete, FeedbackModal } from '@pages/index.ts';
import Smile from '@assets/images/thinking-face.svg';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import Burger from '@assets/svg/burger.svg'
import {redirectToAppStore} from "@utils/helpers.ts";

const CheckinLayout = () => {
  const modalHandlers = useAppModalSimpleHandlers();
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen(!isBurgerMenuOpen);
  };

  const onFeedback = () => {
    modalHandlers.show();
    setFeedbackShow(true);
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
    <div className={cn(styles.container, {[styles.yellowBack]: !isBurgerMenuOpen})}>
      {!(isMobileScreen && user?.uuid) && (
        <div
          className={cn(styles.headerMain, {
            [styles.headerWithBurger]: isBurgerMenuOpen,
          })}
        >
          {!isBurgerMenuOpen && <Header className={styles.header} />}
          {!isBurgerMenuOpen && (
            <div
              className={styles.burgerIconWrapper}
              onClick={toggleBurgerMenu}
            >
              <img src={Burger} alt="Burger" />
            </div>
          )}
          <BurgerMenu isVisible={isBurgerMenuOpen} onClose={toggleBurgerMenu} />
        </div>
      )}
      {!isBurgerMenuOpen && (
        <div className={styles.mainBody}>
          <div className={styles.leftSide}>
            <div className={styles.feedbackWrapper} onClick={onFeedback}>
              <span>Feedback</span>
              <img src={Smile} alt="smile" />
            </div>
            <span className={styles.moblileAppLabel} onClick={redirectToAppStore}>Get mobile app</span>
          </div>
          {!isBurgerMenuOpen && <CheckinComplete />}
        </div>
      )}
      {feedbackShow && (
        <AppModal width={389} {...modalHandlers}>
          <FeedbackModal setFeedbackShow={setFeedbackShow} />
        </AppModal>
      )}
    </div>
  );
};
export default CheckinLayout;
