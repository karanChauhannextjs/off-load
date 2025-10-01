import * as yup from 'yup';
import { string } from 'yup';
//import {emailRegex} from "@constants/regex.ts";

export const schema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .matches(/^[a-zA-Z0-9_.]+$/, 'Usernames may only contain letters, numbers, underscores ("_") and periods (".")'),
  email: yup.string().required('Email is required'),
  //.matches(emailRegex, 'Invalid email'),
  password: string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  agreeUpdates: yup.boolean(),
});
