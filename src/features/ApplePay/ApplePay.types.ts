import {ICreateStripeIntent} from "@models/stripe.ts";

export interface ApplePayProps {
  payData: ICreateStripeIntent
  setPayConfirmed:any
}