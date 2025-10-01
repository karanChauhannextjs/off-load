import { Outlet, useLocation } from 'react-router-dom';
import styles from './PublicLayout.module.scss';
import Header from '@features/Header';
import { SignoutSidebar, SignoutTabbar } from '@features/index.ts';
import { useEffect, useState } from 'react';
import BurgerMenu from '@widgets/BurgerMenu';
import cn from 'classnames';
import Burger from '@assets/svg/burger.svg';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import Smile from '@assets/images/thinking-face.svg';
import { FeedbackModal } from '@pages/index.ts';

const PublicLayout = () => {
  const location = useLocation();
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const isFeedPage = location.pathname.includes('public/feed');
  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen(!isBurgerMenuOpen);
  };
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(
    window.innerWidth <= 768,
  );
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const modalHandlers = useAppModalSimpleHandlers();
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(false);

  const onFeedbackClick = () => {
    setFeedbackShow(true);
    modalHandlers.show();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // useEffect(() => {
  //   if (isBurgerMenuOpen) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = '';
  //   }
  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, [isBurgerMenuOpen]);

  useEffect(() => {
    const hash = location.hash;
    if (hash === '#selected_category') {
      setSelectedCategory(true);
    } else {
      setSelectedCategory(false);
    }
    if (hash === '#selected_group') {
      setSelectedGroup(true);
    } else {
      setSelectedGroup(false);
    }
  }, [location]);

  const isFeedbackVisibility =
    location.pathname.includes('client-home') ||
    location.pathname.includes('care');

  return (
    <div className={styles.container}>
      <Header className={styles.header} />
      <div className={styles.burgerIconWrapper} onClick={toggleBurgerMenu}>
        <img src={Burger} alt="Burger" />
      </div>
      <BurgerMenu
        isVisible={isBurgerMenuOpen}
        onClose={toggleBurgerMenu}
        className={styles.burgerMenu}
      />
      <div className={styles.body}>
        <div className={styles.sidebar}>
          <SignoutSidebar />
        </div>
        <div className={cn(styles.main, { [styles.isInFeed]: isFeedPage })}>
          <Outlet />
          {isFeedbackVisibility && isMobileScreen && (
            <div className={styles.feedbackWrapper} onClick={onFeedbackClick}>
              <span>Give Feedback</span>
              <img src={Smile} alt="smile" className={styles.smile} />
            </div>
          )}
          {feedbackShow && (
            <AppModal width={389} {...modalHandlers}>
              <FeedbackModal setFeedbackShow={setFeedbackShow} />
            </AppModal>
          )}
        </div>
        <div
          className={cn(styles.tabBar, {
            [styles.tabBarHide]: selectedGroup || selectedCategory,
          })}
        >
          <SignoutTabbar />
        </div>
      </div>
    </div>
  );
};
export default PublicLayout;
