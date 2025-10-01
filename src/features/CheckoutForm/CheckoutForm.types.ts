import {ICreateStripeIntent} from "@models/stripe.ts";

export interface CheckoutFormProps {
  payData: ICreateStripeIntent
  setPayConfirmed:any
}