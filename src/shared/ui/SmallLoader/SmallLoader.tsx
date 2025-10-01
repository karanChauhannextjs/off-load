import styles from './SmallLoader.module.scss';

const SmallLoader = () => {
  return (
    <div className="snippet" data-title="dot-flashing">
      <div className="stage">
        <div className={styles.dot_flashing}></div>
      </div>
    </div>
  );
};
export default SmallLoader;
