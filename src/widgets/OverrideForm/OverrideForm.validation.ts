import * as yup from 'yup';
export const schema = yup.object({
  override: yup.array(
    yup.object({
      start: yup.mixed(),
      end: yup.mixed(),
      uuid: yup.string(),
    }),
  ),
});
