import * as yup from 'yup';

export const schema = yup.object({
  name: yup.string().required('Name is required').max(26, 'The name cannot be longer than 26 characters.'),
  location: yup.string().max(36, 'The location cannot be longer than 36 characters.'),
  profession: yup.string().max(36, 'The profession cannot be longer than 36 characters.'),
  shortBio: yup.string(),
  linkedinLink:yup.string(),
  instagramLink:yup.string(),
  twitterLink:yup.string(),
  tiktokLink:yup.string(),
  new_speciality: yup.string(),
  fullBio: yup.string(),
  educations: yup.array().of(
    yup.object({
      name: yup
        .string()
        .nullable()
        .notRequired()
        .max(66, 'The education & accreditation cannot be longer than 66 characters.')
    })
  ),
  memberships: yup.array().of(
    yup.object({
      name: yup
        .string()
        .nullable()
        .notRequired()
        .max(66, 'The membership cannot be longer than 66 characters.')
    })
  ),
  session: yup.object({
    showActive: yup.boolean(),
    isActive30: yup.boolean(),
    isActive50: yup.boolean(),
    min30Price: yup.mixed(),
    min30Types: yup.array(),
    min50: yup.boolean(),
    min50Price: yup.mixed(),
    min50Types: yup.array(),
  }),
  consultation: yup.object({
    showActive: yup.boolean(),
    isActive: yup.boolean(),
    types: yup.array(),
  }),
});
