import { useLocation, useNavigate } from 'react-router-dom';
import styles from './UpgradeBanner.module.scss';
import Upgrade from '@assets/icons/upgrade.svg';
import { PLANS_AND_BILLINGS } from '@routes/Routes.types.ts';

const UpgradeBanner = () => {
  const navigate = useNavigate();
  const location = useLocation()

  const onUpgradeClick = () => {
    navigate(`${PLANS_AND_BILLINGS}`);
    localStorage.setItem('toSubscription', location.pathname)
  };

  return (
    <div className={styles.bannerWrapper} onClick={onUpgradeClick}>
      <span className={styles.upgradeLabel}>
        You’re missing out on the full Offload experience. Subscribe with 25%
        off to add as many clients as you like.
      </span>
      <div className={styles.upgradeButton}>
        <img src={Upgrade} alt="up" className={styles.upgradeIcon} />
        Upgrade
      </div>
    </div>
  );
};

export default UpgradeBanner;
