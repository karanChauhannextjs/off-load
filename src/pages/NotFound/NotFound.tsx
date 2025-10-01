import styles from './NotFound.module.scss'
const NotFound = () => {
    return <div className={styles.wrapper}>
        <h1 className={styles.label}>Error 404:</h1>
        <h1 className={styles.label}>Page Not Found</h1>
    </div>
}
export default NotFound