import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Header from '@features/Header';
import styles from './TherapistLayout.module.scss';
import { TherapistSidebar, TherapistTabbar } from '@features/index.ts';
import BurgerMenu from '@widgets/BurgerMenu';
import { useInvite } from '@store/invite.ts';
import toast from 'react-hot-toast';
import { useProfileStore } from '@store/profile.ts';
import Burger from '@assets/svg/burger.svg';
import cn from 'classnames';
import { LoadingScreen } from '@pages/index.ts';
import Upgrade from '@assets/icons/upgrade.svg';
import { PLANS_AND_BILLINGS } from '@routes/Routes.types.ts';
import { USER_TYPES } from '@constants/user.ts';
import { PaidStatus } from '@constants/plans.ts';

const TherapistLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(false);
  const [agoraConnected, setAgoraConnected] = useState(false);
  const checkTherapistInvites = useInvite(
    (state) => state.checkTherapistInvites,
  );
  const getProfile = useProfileStore((state) => state.getProfile);
  const getCurrentUser = useProfileStore((state) => state.getCurrentUser);
  const currentUser = useProfileStore((state) => state.currentUser);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(
    window.innerWidth <= 768,
  );

  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen(!isBurgerMenuOpen);
  };

  const onUpgradeClick = () => {
    navigate(`${PLANS_AND_BILLINGS}`);
    localStorage.setItem('toSubscription', location.pathname);
  };

  const checkInvites = async () => {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    const inviteCounts = user?.inviteCounts;

    if (inviteCounts > 0) {
      try {
        const invitesResult = await checkTherapistInvites();
        if (invitesResult?.length) {
          invitesResult?.forEach((client: string) => {
            toast.success(`${client} Connected!`, {
              duration: 3000,
              style: { width: 335 },
            });
          });
          const profileResult = await getProfile();
          localStorage.setItem('user', JSON.stringify(profileResult?.result));
        }
      } catch (error) {
        console.error('Error', error);
      }
    }
  };

  const checkSubscriptionEndDate = () => {
    if (
      currentUser?.isSubscribed &&
      currentUser?.paidStatus === PaidStatus.Paid
    ) {
      const endDate = currentUser?.stripeSubscriptionPeriodEnd * 1000;
      const nowTime = Date.now();
      if (nowTime > endDate) {
        getCurrentUser().then((res) => {
          localStorage.setItem('user', JSON.stringify(res.result));
        });
        toast.success(
          'Your subscription has ended. Please upgrade to continue using Offload Pro',
        );
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    }
  };

  useEffect(() => {
    checkSubscriptionEndDate();
    const intervalId = setInterval(
      () => {
        checkSubscriptionEndDate();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(intervalId);
  }, [currentUser]);

  useEffect(() => {
    getCurrentUser();
    checkInvites();
    const intervalId = setInterval(() => {
      checkInvites();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const hash = location.hash;
    if (hash === '#selected_chat') {
      setSelectedChat(true);
    } else {
      setSelectedChat(false);
    }
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
    if (hash === '#selected_activity') {
      setSelectedActivity(true);
    } else {
      setSelectedActivity(false);
    }
  }, [location]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const main = document.getElementById('therapistMain');
    if (main && currentUser) {
      if (
        window.innerWidth > 768 &&
        (!currentUser.isSubscribed ||
          currentUser.paidStatus !== PaidStatus.Paid) &&
        (location.pathname.includes('clients') ||
          location.pathname.includes('therapist/care'))
      ) {
        main.style.padding = '32px 0 0 208px';
      } else {
        main.style.padding = '0 !important';
      }
      return () => {
        main.style.padding = '32px 0 0 230px';
      };
    }
  }, [location, currentUser]);

  return (
    <div id={'therapistLayoutContainer'} className={styles.container}>
      <Header className={styles.header} />
      {currentUser?.type === USER_TYPES.THERAPIST &&
        (!currentUser?.isSubscribed ||
          currentUser?.paidStatus !== PaidStatus.Paid) &&
        !selectedChat &&
        !selectedCategory &&
        !selectedGroup &&
        !location.pathname.includes('therapist/account') && (
          <div className={styles.upgradeButton} onClick={onUpgradeClick}>
            <img src={Upgrade} alt="up" className={styles.upgradeIcon} />
            Upgrade
          </div>
        )}
      {!selectedChat && (
        <div className={styles.burgerIconWrapper} onClick={toggleBurgerMenu}>
          <img src={Burger} alt="Burger" />
        </div>
      )}
      <BurgerMenu isVisible={isBurgerMenuOpen} onClose={toggleBurgerMenu} />
      <div className={styles.body}>
        {!isMobileScreen && (
          <div className={styles.sidebar}>
            <TherapistSidebar setAgoraConnected={setAgoraConnected} />
          </div>
        )}
        <div id={'therapistMain'} className={styles.main}>
          {agoraConnected ? <Outlet /> : <LoadingScreen />}
        </div>
        {isMobileScreen && (
          <div
            className={cn(styles.tabBar, {
              [styles.tabBarHide]:
                selectedChat ||
                selectedActivity ||
                selectedGroup ||
                selectedCategory,
              [styles.tabHideActivity]: selectedActivity,
            })}
          >
            <TherapistTabbar setAgoraConnected={setAgoraConnected} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistLayout;
