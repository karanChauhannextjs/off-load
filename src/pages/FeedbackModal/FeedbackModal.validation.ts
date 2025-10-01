import * as yup from 'yup';
//import {emailRegex} from "@constants/regex.ts";

export const schema = yup.object({
  email: yup.string(),
  //.matches(emailRegex, 'Invalid email'),
  text: yup
    .string()
    .max(350, 'You can type maximum 350 characters')
    .required('Please add your feedback'),
});
