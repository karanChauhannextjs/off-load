import * as yup from 'yup';

export const schema = yup.object({
  monday: yup.array(
    yup.object({
      start: yup.mixed(),
      end: yup.mixed(),
      id: yup.string(),
    }),
  ),
  tuesday: yup.array(
    yup.object({
      start: yup.mixed(),
      end: yup.mixed(),
      id: yup.string(),
    }),
  ),
  wednesday: yup.array(
    yup.object({
      start: yup.mixed(),
      end: yup.mixed(),
      id: yup.string(),
    }),
  ),
  thursday: yup.array(
    yup.object({
      start: yup.mixed(),
      end: yup.mixed(),
      id: yup.string(),
    }),
  ),
  friday: yup.array(
    yup.object({
      start: yup.mixed(),
      end: yup.mixed(),
      id: yup.string(),
    }),
  ),
  saturday: yup.array(
    yup.object({
      start: yup.mixed(),
      end: yup.mixed(),
      id: yup.string(),
    }),
  ),
  sunday: yup.array(
    yup.object({
      start: yup.mixed(),
      end: yup.mixed(),
      id: yup.string(),
    }),
  ),
});
