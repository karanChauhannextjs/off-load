import { Button } from '@shared/ui';
import styles from './ErrorModal.module.scss';
import Monkey from '@assets/svg/monkey.svg';

const ErrorModal = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleWrapper}>
        <span className={styles.title}>Oops</span>
        <img src={Monkey} alt="Monkey" />
      </div>
      <span>
        Something went wrong. We’re still learning and mistakes may happen.
      </span>
      <Button
        fullWidth
        className={styles.button}
        label={'Send feedback'}
        variant={'tertiary'}
      />
      <Button fullWidth label={'Try again'} />
    </div>
  );
};

export default ErrorModal;
