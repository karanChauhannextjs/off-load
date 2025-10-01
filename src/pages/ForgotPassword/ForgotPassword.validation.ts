import * as yup from 'yup';
//import { emailRegex } from '@constants/regex.ts';
export const schema = yup.object({
  email: yup
    .string()
    .required('Please add your email'),
    //.matches(emailRegex, 'Invalid email'),
});
