import styles from './LoadingScreen.module.scss';
import cn from 'classnames';

const LoadingScreen = (props: { className?: string }) => {
  return (
    <div className={cn(styles.wrapper, props.className)}>
      <div className={styles.load}></div>
    </div>
  );
};
export default LoadingScreen;
