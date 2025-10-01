export const JONAH_EMAIL = 'jonahdemo@gmail.com'
export const ALICE_EMAIL = 'alicedemo@gmail.com'

export const JONAH_DEMO_MESSAGES = (from: string, to: string) => [
  {
    id: '1',
    time: 1,
    from,
    to,
    msg: 'Hi! I’m a connected client, which means you can build me a care plan and see my responses. Check out ‘Care’ and ‘Feed’ above.',
  },
  {
    id: '2',
    time: 1,
    from,
    to,
    msg: 'I can also send secure messages.',
  },
  {
    id: '3',
    time: 1,
    from,
    to,
    msg: 'Tap ‘Add client’ to add some real clients!',
  },
];

export const ALICE_DEMO_MESSAGES = (from: string, to: string) => [
  {
    id: '1',
    time: 1,
    from,
    to,
    msg: 'Hi! I’m not connected with you yet. Which means you can’t set up a care plan for me. But I can still send secure messages.',
  },
  {
    id: '2',
    time: 1,
    from,
    to,
    msg: 'To set up a care plan and see my responses - add me to your connected clients by tapping ‘Add to clients’. ',
  },
];
