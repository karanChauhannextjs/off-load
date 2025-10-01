import cn from 'classnames';
import styles from './AddClientCard.module.scss';
import React, { useEffect, useState } from 'react';
import { AddClientCardProps } from './AddClientCard.types.ts';

const AddClientCard: React.FC<AddClientCardProps> = (props) => {
  const { onCardClick } = props;
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );

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
    <div className={styles.addCardWrapper}>
      <div
        onClick={onCardClick}
        className={cn(styles.addCard, {
          [styles.medium]: isMobileScreen,
        })}
      >
        <div className={styles.plusWrapper}>
          <i className={cn('icon-plus', styles.plusIcon)} />
        </div>
      </div>
      <span>Add to this client</span>
    </div>
  );
};
export default AddClientCard;
