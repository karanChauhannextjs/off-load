import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import cn from 'classnames';

import styles from './BookingPaymentModal.module.scss';
import { createBook } from '@api/book.ts';
import { Avatar } from '@shared/ui';
import { schema } from './BookingPaymentModal.validation.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { formattedHours, formattedWeekdays } from '@constants/daysAndTime.ts';
import { BookingPaymentModalProps } from '@pages/BookingPaymentModal/BookingPaymentModal.types.ts';
import { BookingConfirmedModal } from '@pages/index.ts';
import {
  getLongDay,
  getLongMonth,
  modifyWord2,
} from '@utils/helpers.ts';
import CheckoutForm from '@features/CheckoutForm/CheckoutForm.tsx';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { appearance } from '@features/CheckoutForm/CheckoutForm.constants.ts';
import { useStripeStore } from '@store/stripe.ts';
import ApplePay from "@features/ApplePay/ApplePay.tsx";

export type FormData = yup.InferType<typeof schema>;

const BookingPaymentModal: React.FC<BookingPaymentModalProps> = (props) => {
  const modalHandlers = useAppModalSimpleHandlers();
  const { data, setShowBookingPayment, setBookModalShow } = props;

  const stripePromise = loadStripe(
    'pk_test_51OrJaGJxYw9kyhBLx2XoX4wVo8wHv7Pnq7YbBki5N4rQf89OWJbYnr86NQujrzjHMEk405IOecCsr0FpOQfrl29n00JWkyx7gm',
    // {
    //  stripeAccount: data?.therapistData?.stripeAccountId,
    // },
  );

  const [showBookingConfirmed, setShowBookingConfirmed] =
    useState<boolean>(false);
  const [payConfirmed, setPayConfirmed] = useState<boolean>(false);
  const paymentIntentId = useStripeStore((state) => state.paymentIntentId);
  const day = formattedWeekdays.find((e) => e.id === data?.bookData?.day);
  const time = formattedHours.find(
    (e: { id: number; label: string }) => e.id === data?.bookData?.time,
  );

  const onBack = () => {
    if (setShowBookingPayment) {
      setShowBookingPayment(false);
    }
  };

  const handleBook = async () => {
    try {
      const response = await createBook({ ...data?.body, paymentIntentId });
      setShowBookingConfirmed(true);
      modalHandlers.show({
        therapistData: data?.therapistData,
        bookData: data?.bookData,
        body: {...data?.body, id:response?.id, bookingLink: response?.bookingLink},
      });
      localStorage.removeItem('username');
      localStorage.removeItem('from');
      localStorage.removeItem('bookingData');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (payConfirmed) {
      handleBook();
    }
  }, [payConfirmed]);

  const amount =
    data?.bookData?.duration === 1
      ? data.therapistData?.userSessions?.[0]?.price
      : data.therapistData?.userSessions?.[1]?.price;

  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.abs(amount * 100),
    currency: 'gbp',
    appearance,
  };

  return (
    <div className={styles.wrapper}>
      <i className={cn('icon-left-arrow', styles.backIcon)} onClick={onBack} />
      <div className={styles.imgWrapper}>
        <Avatar className={styles.img} photoUrl={data?.therapistData?.image} />
      </div>
      {data?.therapistData?.name && <span>{data?.therapistData?.name}</span>}
      {!!data?.bookData?.duration ? (
        <span className={styles.type}>Session</span>
      ) : (
        <span className={styles.type}>Consultation</span>
      )}
      <div className={styles.infoWrapper}>
        <div className={styles.row}>
          <i
            className={cn(
              `icon-${data?.bookData?.type?.toLowerCase().replace('_', '-')}`,
              styles.icon,
            )}
          />
          <span className={styles.label}>
            {modifyWord2(data?.bookData?.type)}
          </span>
        </div>
        <div className={styles.row}>
          <i className={cn(`icon-time`, styles.icon)} />
          <>
            {!!data?.bookData?.duration ? (
              <>
                {
                  <span className={styles.label}>
                    {data?.bookData?.duration === 1
                      ? '30 minutes'
                      : '50 minutes'}
                  </span>
                }
              </>
            ) : (
              <span className={styles.label}>15 minutes</span>
            )}
          </>
        </div>
        <div className={styles.row}>
          <i className={cn(`icon-calendar`, styles.icon)} />
          <span className={styles.label}>
            {time?.label}, {getLongDay(day?.label)}, {getLongMonth(day?.month)}{' '}
            {day?.secondLabel}th
          </span>
        </div>
      </div>
      {data?.bookData?.duration && (
        <div className={styles.totalBlock}>
          <div className={styles.line}></div>
          <div className={styles.totalLine}>
            <span>Total</span>
            <span className={styles.price}>
              {data.therapistData?.userSessions?.[0]?.priceCurrency}
              {amount}
            </span>
          </div>
          <div className={styles.line}></div>
        </div>
      )}
      <div className={styles.payBlock}>
        <span className={styles.payLabel}>Payment</span>
        {/*<div>*/}
        {/*  {canMakePayment && paymentRequest && (*/}
        {/*    <ExpressCheckoutElement*/}
        {/*      options={{*/}
        {/*        buttonHeight: 40,*/}
        {/*        buttonTheme: {*/}
        {/*          applePay: 'black',*/}
        {/*        },*/}
        {/*        buttonType: {*/}
        {/*          applePay: 'buy',*/}
        {/*        },*/}
        {/*      }}*/}
        {/*      onConfirm={() => {*/}
        {/*        // Handle confirm event*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*  {!paymentRequest && <div>Apple Pay is not available.</div>}*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*  {paymentRequest && (*/}
        {/*    <PaymentRequestButtonElement*/}
        {/*      options={{*/}
        {/*        paymentRequest: paymentRequest,*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*  {!paymentRequest && <div>Apple Pay is not available.</div>}*/}
        {/*</div>*/}
        {/*<div className={styles.orBlock}>*/}
        {/*  <div className={styles.line}></div>*/}
        {/*  <span>OR</span>*/}
        {/*  <div className={styles.line}></div>*/}
        {/*</div>*/}
      </div>

      {stripePromise && (
        <div className={styles.stripeWrapper}>
          <Elements stripe={stripePromise} options={options}>
            <ApplePay
              setPayConfirmed={setPayConfirmed}
              payData={{
                name: data?.body?.name,
                email: data?.body?.email,
                amount: Math.abs(amount * 100),
                currency: 'gbp',
                therapistId: data.therapistData?.uuid,
                therapistUsername: data.therapistData?.username,
              }}
            />
            <CheckoutForm
              setPayConfirmed={setPayConfirmed}
              payData={{
                name: data?.body?.name,
                email: data?.body?.email,
                amount: Math.abs(amount * 100),
                currency: 'gbp',
                therapistId: data.therapistData?.uuid,
                therapistUsername: data.therapistData?.username,
              }}
            />
          </Elements>
        </div>
      )}

      {showBookingConfirmed && (
        <AppModal
          width={389}
          {...modalHandlers}
          disableClosingModal
          closeIcon={false}
        >
          <BookingConfirmedModal
            setBookModalShow={setBookModalShow}
            setShowBookingPayment={setShowBookingPayment}
            data={modalHandlers.metaData}
            setShowBookingConfirmed={setShowBookingConfirmed}
          />
        </AppModal>
      )}
    </div>
  );
};
export default BookingPaymentModal;
