import React from 'react';
import cn from 'classnames';

import styles from './Navbar.module.scss';
import { NavbarProps } from './Navbar.types.ts';
import { NavbarData } from '@constants/constants.ts';

const Navbar: React.FC<NavbarProps> = (props) => {
  const { className, onClickItem, isOldAccount } = props;
  // const getBackgroundColor = (id: number) => {
  //   if (id % 2 === 0) {
  //     return 'yellow';
  //   } else return 'cyan';
  // };

  return (
    <div className={cn(styles.wrapper, className)}>
      <div className={styles.bodyWrapper}>
        {NavbarData.map((item) => {
          const { id, label, icon, path } = item;
          return (
            <div
              key={id}
              className={cn(styles.item, {[styles.oldAccountItem]: isOldAccount})}
              onClick={() => {
                onClickItem(id, path);
              }}
            >
              <div className={styles.leftBlock}>
                <div
                  className={cn(
                    styles.iconWrapper,
                    // styles[getBackgroundColor(id)],
                  )}
                >
                  <i className={cn(`icon-${icon}`, styles.icon, {[styles.heart]: id === 2})} />
                </div>
                <span className={styles.label}>{label}</span>
              </div>
              <i className={cn('icon-right-arrow', styles.iconRightArrow)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Navbar;
