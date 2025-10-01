import * as yup from 'yup';

export const schema = yup.object({
  code: yup.string().required(),
});
