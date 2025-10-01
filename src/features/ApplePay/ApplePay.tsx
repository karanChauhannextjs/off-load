import React, { useEffect, useRef, useState } from 'react';
import {loadStripe, PaymentIntentResult} from '@stripe/stripe-js';
import styles from './ApplePay.module.scss';
import { ApplePayProps } from './ApplePay.types.ts';
import {createIntent} from "@api/stripe.ts";

const ApplePay: React.FC<ApplePayProps> = (props) => {
  const { payData, setPayConfirmed } = props;
  const [paymentRequest, setPaymentRequest] = useState(null);
  const stripePromise = loadStripe(
    'pk_test_51OrJaGJxYw9kyhBLx2XoX4wVo8wHv7Pnq7YbBki5N4rQf89OWJbYnr86NQujrzjHMEk405IOecCsr0FpOQfrl29n00JWkyx7gm',
  );
  const paymentRequestButtonRef = useRef(null);

  useEffect(() => {
    const initializePaymentRequest = async () => {
      const stripe = await stripePromise;
      if (stripe) {
        const pr = stripe.paymentRequest({
          country: 'GB',
          currency: 'gbp',
          total: {
            label: 'Total',
            amount: Math.abs(payData?.amount),
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        pr.canMakePayment().then((result) => {
          console.log('Result:', result);
          if (result && result.applePay) {
            // @ts-ignore
            setPaymentRequest(pr);
          } else {
            console.log('Apple Pay is not available');
          }
        });

        pr.on('paymentmethod', async (event) => {
          console.log('Payment method received:', event.paymentMethod);

          // Confirm the PaymentIntent using the clientSecret
          const { clientSecret } = await createIntent({
            name: payData?.name,
            email: payData?.email,
            amount: Math.abs(payData?.amount),
            currency: 'gbp',
            therapistId: payData?.therapistId,
          });

          const { error, paymentIntent }: PaymentIntentResult = await stripe.confirmCardPayment(
            clientSecret,
            {
              payment_method: event.paymentMethod.id,
            }
          );

          if (error) {
            console.error('Payment failed:', error);
            event.complete('fail'); // Notify Apple Pay of the failure
          } else if (paymentIntent?.status === 'succeeded') {
            console.log('Payment successful:', paymentIntent);
            event.complete('success'); // Notify Apple Pay of the success
            setPayConfirmed(true); // Mark the payment as confirmed in your app state
          }
        });

      }
    };

    initializePaymentRequest();
  }, []);

  useEffect(() => {
    if (paymentRequest && paymentRequestButtonRef.current) {
      stripePromise.then((stripe) => {
        if (stripe) {
          const elements = stripe.elements();
          const prButton = elements.create('paymentRequestButton', {
            paymentRequest: paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'default',
                theme: 'dark',
                height: '44px',
              },
            },
          });
          console.log('prButton', prButton);
          if (paymentRequestButtonRef.current) {
            prButton.mount(paymentRequestButtonRef.current);
          }
        }
      });
    }
  }, [paymentRequest]);

  if (!paymentRequest) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div ref={paymentRequestButtonRef}></div>
      <div className={styles.orWrapper}>
        <div className={styles.line} />
        <span className={styles.orLabel}>OR</span>
        <div className={styles.line} />
      </div>
    </div>
  );
};

export default ApplePay;
