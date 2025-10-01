import { useEffect, useState } from 'react';
import styles from './ExerciseLayout.module.scss';
import { Header } from '@features/index.ts';
import BurgerMenu from '@widgets/BurgerMenu';
import cn from 'classnames';
import { ExerciseComplete } from '@pages/index.ts';
import Burger from '@assets/svg/burger.svg'

const ExerciseLayout = () => {
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen(!isBurgerMenuOpen);
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
    <div id='exerciseLayout' className={styles.container}>
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
      {!isBurgerMenuOpen && <ExerciseComplete />}
    </div>
  );
};
export default ExerciseLayout;
