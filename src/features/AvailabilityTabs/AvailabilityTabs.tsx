import React from 'react';
import cn from 'classnames';

import styles from './AvailabilityTabs.module.scss';
import { AvailabilityTabsProps } from '@features/AvailabilityTabs/AvailabilityTabs.types.ts';

const AvailabilityTabs: React.FC<AvailabilityTabsProps> = (props) => {
  const { className, tabsData, onClick, isActiveTab } = props;
  return (
    <div className={cn(styles.wrapper, className)}>
      <div className={styles.bodyWrapper}>
        {tabsData?.map((tab) => {
          const { id, label, classname } = tab;
          return (
            <div
              key={id}
              className={cn(styles.tab, styles[classname], {
                [styles[`isActive${classname}`]]: id === isActiveTab,
              })}
              onClick={() => {
                onClick(id);
              }}
            >
              <span className={styles.label}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AvailabilityTabs;
