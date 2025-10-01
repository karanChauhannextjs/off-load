import * as yup from 'yup';
import { string } from 'yup';
//import { emailRegex } from '@constants/regex.ts';

export const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup
    .string()
    .required('Email is required'),
    //.matches(emailRegex, 'Invalid email'),
  password: string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});
