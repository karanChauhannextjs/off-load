export enum Plans_Card_Types {
  Monthly = 1,
  Yearly,
  Contact_Us,
}

export enum PlansCardNames {
  Monthly = 'Monthly',
  Yearly = 'Yearly',
}

export enum PlansInterval {
  Year = 'year',
  Month = 'month',
}

export enum PaidStatus {
  Paid = 1,
  Ended = 2,
  Canceled = 3,
}

export enum PaymentTerm {
  Monthly = 1,
  Annual = 2,
}

export enum PlansButtons {
  Active = 'Active',
  Upgrade = 'Upgrade',
  'Contact Us' = 'Contact Us',
}

export const PlansData = [
  {
    id: Plans_Card_Types.Monthly,
    title: PlansCardNames.Monthly,
    subtitle: '',
    actualPrice: '',
    price: '',
    infoText: 'Billed monthly',
    includingData: [
      {
        id: Plans_Card_Types.Monthly,
        text: 'All yearly plan features, but billed monthly',
      },
    ],
  },
  {
    id: Plans_Card_Types.Yearly,
    title: PlansCardNames.Yearly,
    subtitle: '',
    actualPrice: '',
    price: '16',
    infoText: '25% off billed annually',
    includingData: [
      { id: 1, text: 'Add unlimited clients - one flat fee, no per-client charges' },
      {
        id: 2,
        text: 'Unlock 100s of interactive therapy tools, activities and videos',
      },
      {
        id: 3,
        text: 'Simple, approachable and engaging tools',
      },
      { id: 4, text: 'Send to clients in a few clicks' },
      { id: 5, text: 'See responses in real time' },
      { id: 6, text: 'Made for therapists, by therapists' },
    ],
  },
  {
    id: Plans_Card_Types.Contact_Us,
    title: 'Teams',
    subtitle: 'Contact us',
    actualPrice: '',
    price: '',
    infoText: 'Manage multiple accounts',
    includingData: [
      { id: 1, text: 'All yearly plan features ' },
      { id: 2, text: 'Unlock multiple accounts for your team or organisation' },
      { id: 3, text: 'Flexible cost if team size changes' },
    ],
  },
];
