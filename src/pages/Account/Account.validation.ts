import * as yup from 'yup';

export const schema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .matches(/^[a-zA-Z0-9_.]+$/, 'Usernames may only contain letters, numbers, underscores ("_") and periods (".")'),
  address: yup.string(),
  isEnabledSessionReminders: yup.boolean(),
  isEnabledSessionReschedules: yup.boolean(),
  isEnabledNewMessages: yup.boolean(),
});
