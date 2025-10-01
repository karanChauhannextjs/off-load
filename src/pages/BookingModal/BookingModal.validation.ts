import * as yup from 'yup';
//import {emailRegex} from "@constants/regex.ts";

export const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().required('Email is required'),
      //.matches(emailRegex, 'Invalid email'),
  note: yup.string(),
});

export const schemaNoteRequired = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().required('Email is required'),
  //.matches(emailRegex, 'Invalid email'),
  note: yup.string().required('Note is required'),
});
