import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import styles from './ExerciseCard.module.scss';
import { ExerciseCardProps } from './ExerciseCard.types.ts';
import { getYouTubeThumbnail } from '@utils/helpers.ts';

const ExerciseCard: React.FC<ExerciseCardProps> = (props) => {
  const {
    cardData,
    size = 'large',
    className,
    isShareable = false,
    isAddable = false,
    isDeletable = false,
    isFavoritable = true,
    isEmpty = false,
    withName = true,
    withView = true,
    onActionClick,
    onFavoriteClick,
    onCardClick,
    onShare,
  } = props;
  const [isFavorite, setIsFavorite] = useState(false);

  const favoriteState = isFavorite ? 'heart-filled' : 'heart';
  const actionState = isAddable ? 'plus' : isDeletable ? 'bin' : '';

  useEffect(() => {
    setIsFavorite(!!cardData?.isFavorite);
  }, [cardData]);

  const onFavorite = (e: any) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavoriteClick) {
      onFavoriteClick(
        isFavorite,
        cardData?.uuid ? cardData.uuid : '',
        cardData,
      );
    }
  };

  const thumbnail = cardData?.image
    ? cardData?.image
    : getYouTubeThumbnail(cardData?.url);

  return (
    <div className={cn(styles.cardWrapper, className)}>
      <div
        className={cn(styles.cardMain, {
          [styles.small]: size === 'small',
          [styles.medium]: size === 'medium',
          [styles.large]: size === 'large',
          [styles.withoutAction]: !actionState && !isShareable && !isAddable,
        })}
        onClick={() => (onCardClick ? onCardClick(cardData) : null)}
        style={{
          backgroundImage: `url(${thumbnail})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        {!isEmpty && (
          <div className={styles.topActionsWrapper}>
            {isFavoritable && (
              <i
                className={cn(`icon-${favoriteState}`, styles.favoriteIcon)}
                onClick={onFavorite}
              />
            )}
            <div className={styles.actionsWrapper}>
              {actionState && (
                <div
                  className={styles.actionWrapper}
                  onClick={
                    onActionClick
                      ? (e: any) => {
                          e.stopPropagation();
                          onActionClick(isAddable ? 'add' : 'delete', cardData);
                        }
                      : undefined
                  }
                >
                  <i className={cn(`icon-${actionState}`, styles.actionIcon)} />
                </div>
              )}
              {isShareable && (
                <div
                  className={styles.actionWrapper}
                  onClick={
                    onShare
                      ? (e: any) => {
                          e.stopPropagation();
                          onShare(cardData);
                        }
                      : undefined
                  }
                >
                  <i className={cn(`icon-share`, styles.favoriteIcon)} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {cardData?.name && withName && (
        <span className={styles.cardName}>
          {cardData.name}
          <br />
          {cardData?.subtext && (
            <span className={styles.viewLabel}>{cardData.subtext}</span>
          )}
          {cardData?.formattedViewCount && withView && (
            <span className={styles.viewLabel}>
              {cardData.formattedViewCount} views
              {cardData?.tag && cardData?.tag !== 'null' && (
                <div className={styles.tag}>
                  <span className={styles.dot}></span>
                  <span className={styles.tag}>{cardData.tag}</span>
                </div>
              )}
            </span>
          )}
        </span>
      )}
    </div>
  );
};
export default ExerciseCard;
