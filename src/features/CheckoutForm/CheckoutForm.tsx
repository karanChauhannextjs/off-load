import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CheckoutFormProps } from '@features/CheckoutForm/CheckoutForm.types.ts';
import { Button, Input } from '@shared/ui';
import './CheckoutForm.css';
import { useStripeStore } from '@store/stripe.ts';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const CheckoutForm: React.FC<CheckoutFormProps> = (props) => {
  const { payData, setPayConfirmed } = props;
  const stripe = useStripe();
  const elements = useElements();
  const createIntent = useStripeStore((state) => state.createIntent);

  const [cardholderName, setCardholderName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [loading, setLoading] = useState(false);

  const { handleSubmit } = useForm<any>();

  const onSubmit = async () => {
    try {
      if (!stripe || !elements) {
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setErrorMessage('ExerciseCard element not found');
        return;
      }

      const {error: submitError} = await elements.submit();
      if (submitError) {
        console.log(submitError, 'submitError');
        // Show error to your customer
        setErrorMessage(submitError.message);
        return;
      }

      setLoading(true);
      const {clientSecret} = await createIntent({
        name: payData?.name,
        email: payData?.email,
        amount: Math.abs(payData?.amount),
        currency: 'gbp',
        therapistId: payData?.therapistId,
      });

      if (clientSecret && cardElement) {
        // const {error} = await stripe.confirmPayment({
        //   elements,
        //   clientSecret,
        //   confirmParams: {
        //     return_url: `http://localhost:5174/${payData?.therapistUsername}`,
        //   },
        // });
        const {error, paymentIntent} = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: cardholderName,
              },
            },
          },
        );
        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          setPayConfirmed(false);
        } else if (paymentIntent?.status === 'succeeded') {
          setPayConfirmed(true);
          toast.success('Payment successful!');
          setLoading(false);
        }
      }
    }catch (e){
      console.log("Error", e)
      setLoading(false)
    }
  };
  console.log('errorMessage', errorMessage);
  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      <div className="stripeForm">
        {/*<PaymentElement*/}
        {/*  options={{*/}
        {/*    fields: {*/}
        {/*      billingDetails: {*/}
        {/*        address: {*/}
        {/*          country: 'auto',*/}
        {/*        },*/}
        {/*      },*/}
        {/*    },*/}
        {/*    applePay: {*/}
        {/*      recurringPaymentRequest: null,*/}
        {/*      deferredPaymentRequest: null,*/}
        {/*      automaticReloadPaymentRequest: null,*/}
        {/*    },*/}
        {/*  }}*/}
        {/*/>*/}
        <div className='stripeWrapper'>
          <CardElement
            options={{
              hidePostalCode: true,
              disableLink: true,
              style:{
                base:{
                  fontSize: '14px',
                  color:'#333',
                  fontWeight:400,
                  '::placeholder': {
                    fontSize: '14px',
                    color:'rgba(51, 51, 51, 0.5)',
                  }
                }
              }
            }}
          />
        </div>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <Input
        className={'input'}
        type="text"
        value={cardholderName}
        onChange={(e) => setCardholderName(e.target.value)}
        placeholder={'Name on card'}
        required
      />
      <Button
        className={'button'}
        fullWidth
        type={'submit'}
        label={'Pay Now'}
        disabled={!stripe || !elements || loading}
      />
    </form>
  );
};

export default CheckoutForm;