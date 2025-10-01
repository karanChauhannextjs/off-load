import cn from 'classnames';
import { useNavigate } from 'react-router-dom';

import styles from './Transactions.module.scss';
import {
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
} from '@routes/Routes.types.ts';
import { useTransactions } from '@store/transactions.ts';
import {useEffect, useRef, useState} from 'react';
import { LoadingScreen } from '@pages/index.ts';

const Transactions = () => {
  const navigate = useNavigate();
  const getTransactions = useTransactions((state) => state.getTransactions);
  const getTransactionsStatus = useTransactions(
    (state) => state.getTransactionsStatus,
  );
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null); // Ref to the transactionsWrapper

  const itemsPerPage = 100;

  const goBack = () => {
    setScrolled(false)
    navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.ACCOUNT}`);
  };

  const dateToMonth = (date: string) => {
    const newDate = new Date(date);
    const options = { month: 'short', day: '2-digit' };
    // @ts-ignore
    return newDate.toLocaleDateString('en-US', options);
  };

  const handleScroll = () => {
    setScrolled(true);
    if (wrapperRef?.current) {
      const { scrollTop, scrollHeight, clientHeight } = wrapperRef.current;
      if (scrollTop + clientHeight >= scrollHeight) {
        setCurrentPage((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (wrapper) wrapper.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    getTransactions((currentPage - 1) * itemsPerPage, itemsPerPage).then(
      (res: any) => {
        setTransactionsData([...transactionsData, ...res.data]);
      },
    );
  }, [currentPage]);

  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.style.overflowY = 'auto';
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {isMobileScreen && (
        <div className={styles.topWrapper}>
          <span className={styles.accountLabel}>Account</span>
          <div className={styles.line}></div>
        </div>
      )}
      <i className={cn('icon-left-arrow', styles.icon)} onClick={goBack} />
      <div className={styles.mainWrapper}>
        <span className={styles.title}>Transactions</span>
        {getTransactionsStatus === 'LOADING' && !scrolled ? (
          <div className={styles.loaderWrapper}>
            <LoadingScreen />
          </div>
        ) : (
          <div className={styles.transactionsWrapper} ref={wrapperRef}>
            {!!transactionsData?.length ? (
              transactionsData?.map((transaction: any, index: number) => (
                <div key={index} className={styles.row}>
                  <span className={styles.label}>
                    {dateToMonth(transaction.createdAt)}:{' '}
                    <span className={styles.boldLabel}>
                      {!!transaction?.client?.name
                        ? transaction?.client?.name
                        : transaction?.clientName}{' '}
                    </span>
                    paid you{' '}
                    <span className={styles.boldLabel}>
                      £{transaction?.amount / 100}
                    </span>
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.noTransactions}>No transactions found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Transactions;
