import React from 'react';
import cn from 'classnames';

import { Button } from '@shared/ui';
import { BannerProps } from './Banner.types.ts';
import styles from './Banner.module.scss';
import { VIEW_PUBLIC_BASE_URL } from '@routes/Routes.types.ts';

const Banner: React.FC<BannerProps> = (props) => {
  const {
    variant = 'primary',
    className,
    firstLabel,
    secondLabel,
    firstButtonIcon,
    secondButtonIcon,
    firstButtonLabel,
    secondButtonLabel,
    firstButtonDisabled,
    secondButtonDisabled,
    firstButtonVariant = 'tertiary',
    secondButtonVariant = 'tertiary',
    handlerFirstButton,
    handlerSecondButton,
    firstButtonLoading,
    secondButtonLoading,
    withButtons = true,
  } = props;

  const primaryVariant = variant === 'primary';
  const firstButtonType = firstButtonLabel === 'Save' ? 'submit' : 'button';

  const onClickLink = (link: string) => {
    window.open(`${VIEW_PUBLIC_BASE_URL}${link}`, '_blank');
  };

  return (
    <div className={cn(styles.bannerWrapper, styles[variant], className)}>
      <div className={styles.labelsBlock}>
        <span className={styles.firstLabel}>{firstLabel}</span>
        {primaryVariant ? (
          <div className={styles.linkWrapper}>
            <span
              className={styles.secondLabel}
              onClick={() => {
                onClickLink(secondLabel?.split('/')?.[1]);
              }}
            >
              {secondLabel}
              <i className={cn('icon-redirect', styles.icon)} />
            </span>
          </div>
        ) : (
          <span className={styles.secondLabel}>{secondLabel}</span>
        )}
      </div>

      {withButtons ? (
        <div className={styles.actionsBlock}>
          <Button
            disabled={firstButtonDisabled}
            variant={firstButtonVariant}
            icon={firstButtonIcon}
            label={firstButtonLabel}
            isLoading={firstButtonLoading}
            onClick={handlerFirstButton}
            type={firstButtonType}
          />
          <Button
            disabled={secondButtonDisabled}
            variant={secondButtonVariant}
            icon={secondButtonIcon}
            label={secondButtonLabel}
            isLoading={secondButtonLoading}
            onClick={handlerSecondButton}
          />
        </div>
      ) : (
        <div className={styles.actionsBlock}>OTP INPUTS</div>
      )}
    </div>
  );
};
export default Banner;
