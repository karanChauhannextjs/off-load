export interface ICreateStripeIntent {
  amount: number;
  currency: string;
  therapistId: string;
  therapistUsername?: string;
  email: string;
  name?: string;
}
