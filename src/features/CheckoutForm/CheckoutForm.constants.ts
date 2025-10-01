import {Appearance} from "@stripe/stripe-js";

export const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: 'black',
    colorBackground: 'white',
    colorText: 'black',
    colorSuccess: 'gray',
    colorWarning: 'red',
    colorDanger: 'red',
    spacingUnit: '3px',
    tabSpacing: '8px',
    gridRowSpacing: '8px',
    gridColumnSpacing: '8px',

    borderRadius: '8px',
    focusBoxShadow: 'none',
    focusOutline: 'none',
  },
};