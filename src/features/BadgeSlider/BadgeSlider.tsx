import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import { Badge } from '@shared/ui';
import styles from './BadgeSlider.module.scss';
import { BadgeSliderProps } from './BadgeSlider.types.ts';

const BadgeSlider: React.FC<BadgeSliderProps> = (props) => {
  const {
    className,
    data,
    isActiveId,
    isAvailabilityId,
    showItemsNumber,
    variant,
    onClickItem,
    isChanged
  } = props;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 426);
  const prevDisabled = currentIndex === 0;
  const nextDisabled = currentIndex === data.length - showItemsNumber;

  const handlePrevious = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (!prevDisabled) {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + data.length) % data.length,
      );
    }
  };
  const handleNext = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (!nextDisabled)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
  };

  const visibleCards = Array.from(
    { length: isSmallScreen ? data.length : showItemsNumber },
    (_, i) => (currentIndex + i) % data.length,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 426);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setCurrentIndex(0)
  }, [isChanged]);

  return (
    <div className={cn(styles.wrapper, className)}>
      <div className={styles.bodyWrapper}>
        <span className={styles.iconWrapper}>
          <i
            className={cn('icon-left-arrow', styles.icon, {
              [styles.disabledArrow]: prevDisabled,
            })}
            onClick={handlePrevious}
          />
        </span>
        {visibleCards.map((item) => (
          <Badge
            className={cn({
              [styles.isActiveSecond]:
                isActiveId === data[item]?.id && variant === 'secondary',
              [styles.isActive]: isActiveId === data[item]?.id,
              [styles.isAvailability]: isAvailabilityId?.includes(
                data[item]?.id,
              ),
            })}
            readonly={
              variant !== 'secondary' &&
              !isAvailabilityId?.includes(data[item]?.id)
            }
            key={data[item]?.id}
            variant={variant}
            onClick={() => (onClickItem ? onClickItem(data[item]?.id) : null)}
            {...data[item]}
          />
        ))}
        <span className={styles.iconWrapper}>
          <i
            className={cn('icon-right-arrow', styles.icon, {
              [styles.disabledArrow]: nextDisabled,
            })}
            onClick={handleNext}
          />
        </span>
      </div>
    </div>
  );
};
export default BadgeSlider;
