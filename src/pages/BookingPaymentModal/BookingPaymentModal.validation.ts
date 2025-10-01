import * as yup from 'yup';

export const schema = yup.object({
    card_name: yup.string().required('Name on card is required'),
    card_number: yup.string().required('Card number is required'),
    expiry_date: yup.string().required('Expire date is required'),
    security_code: yup.string().required('Security Code is required'),
});
