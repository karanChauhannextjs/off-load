import * as yup from 'yup';

export const schema = yup.object({
  newNote: yup.string().required('Note is required'),
  notesText: yup.array().of(
    yup.object({
      text: yup.string(),
    }),
  ),
});
