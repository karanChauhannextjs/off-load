import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import cn from 'classnames';

import styles from './SignoutTabbar.module.scss';
import { SignoutSidebarData } from '@constants/constants.ts';
import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  USER_PUBLIC_BASE_URL,
  USER_PUBLIC_URL,
} from '@routes/Routes.types.ts';
import { useExerciseComplete } from '@store/exerciseComplete.ts';
import { useExercises } from '@store/exercises.ts';

const SignoutTabbar = () => {
  const [activeId, setActiveId] = useState<number>(1);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const token = localStorage.getItem('ACCESS_TOKEN');
  const reset = useExerciseComplete((state: any) => state.reset);
  const resetExercises = useExercises((state: any) => state.reset);

  const onClickSidebarItem = (id: number, path: string) => {
    if (activeId !== id) {
      reset();
      resetExercises();
      localStorage.removeItem('selectedGroup');
      localStorage.removeItem('selectedCategory');
      localStorage.removeItem('savedScrollForHome');
      localStorage.removeItem('scrollPositionFromCare');
      if (!token && user?.type !== 2) {
        if (path === 'messages' || path === 'account') {
          navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
        } else {
          navigate(`${USER_PUBLIC_URL}/${path}`);
        }
      } else {
        navigate(`${CLIENT_PRIVATE_BASE_URL}/${path}`);
        setActiveId(id);
      }
    }
  };

  useEffect(() => {
    const activeTab = SignoutSidebarData.find(
      (e) => e?.path === pathname.split('/')[2],
    );
    if (activeTab) {
      setActiveId(activeTab?.id);
    }
  }, [pathname]);

  return (
    <ul className={styles.tabBarWrapper}>
      {SignoutSidebarData.map((el) => {
        const { id, label, icon, path, inTabBar } = el;
        return (
          <>
            {inTabBar && (
              <li
                key={id}
                className={cn(styles.row, { [styles.active]: id === activeId })}
                onClick={() => {
                  onClickSidebarItem(id, path);
                }}
              >
                <i className={cn(`icon-${icon}`, styles.icon)} />
                <span className={styles.label}>{label}</span>
              </li>
            )}
          </>
        );
      })}
    </ul>
  );
};
export default SignoutTabbar;
