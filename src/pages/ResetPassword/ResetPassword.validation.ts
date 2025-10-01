import * as yup from 'yup';
import { string } from 'yup';

export const schema = yup.object({
  new_password: string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  repeat_password: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords do not match')
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});
