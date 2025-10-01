export enum SESSION_TYPE {
  LIVE_TEXT = 1,
  VOICE_CALL = 2,
  VIDEO_CALL = 3,
  IN_PERSON = 4,
}

export const keyToEnumMapping = {
  isInPerson: SESSION_TYPE.IN_PERSON,
  isLiveText: SESSION_TYPE.LIVE_TEXT,
  isVideoCall: SESSION_TYPE.VIDEO_CALL,
  isVoiceCall: SESSION_TYPE.VOICE_CALL,
};

export const TherapistSidebarData = [
  {
    id: 1,
    label: 'Home',
    icon: 'home',
    path: 'therapist-home',
    inTabBar: true,
  },
  {
    id: 2,
    label: 'Clients',
    icon: 'users',
    path: 'shared-clients',
    inTabBar: true,
  },
  { id: 3, label: 'Care', icon: 'heart-art', path: 'care', inTabBar: true },
  { id: 4, label: 'Inbox', icon: 'inbox', path: 'clients', inTabBar: true },
  {
    id: 5,
    label: 'My Page',
    icon: 'calendar2',
    path: 'my-page',
    inTabBar: true,
  },
  {
    id: 6,
    label: 'Schedule',
    icon: 'calendar',
    path: 'schedule',
    inTabBar: false,
  },
  {
    id: 7,
    label: 'Availability',
    icon: 'time',
    path: 'availability',
    inTabBar: false,
  },
  {
    id: 8,
    label: 'Account',
    icon: 'settings',
    path: 'account',
    inTabBar: false,
  },
];

export const ClientSidebarData = [
  { id: 1, label: 'Home', icon: 'home', path: 'client-home', inTabBar: true },
  {
    id: 2,
    label: 'Messages',
    icon: 'live-text',
    path: 'client-messages',
    inTabBar: true,
  },
  { id: 3, label: 'Care', icon: 'heart-art', path: 'care', inTabBar: true },
  { id: 4, label: 'Feed', icon: 'feed', path: 'feed', inTabBar: true },
  {
    id: 5,
    label: 'Account',
    icon: 'settings',
    path: 'client-account',
    inTabBar: true,
  },
];

export const SignoutSidebarData = [
  { id: 1, label: 'Care', icon: 'home', path: 'care', inTabBar: true },
  {
    id: 2,
    label: 'Clients',
    icon: 'users',
    path: 'shared-clients',
    inTabBar: true,
  },
  { id: 3, label: 'App', icon: 'feed', path: 'client-home', inTabBar: true },
  {
    id: 4,
    label: 'Inbox',
    icon: 'live-text',
    path: 'messages',
    inTabBar: true,
  },
  {
    id: 5,
    label: 'Account',
    icon: 'settings',
    path: 'account',
    inTabBar: true,
  },
];

export const NavbarData = [
  { id: 1, label: 'Add a client', icon: 'add-client', path: 'shared-clients' },
  { id: 2, label: 'Set up a care plan', icon: 'heart-art', path: 'care' },
  { id: 3, label: 'Customise your page', icon: 'home', path: 'edit-page' },
  {
    id: 4,
    label: 'Set your availability',
    icon: 'calendar',
    path: 'availability',
  },
];

export const AvailabilityTabsData = [
  { id: 2, label: 'Consultations', classname: 'consultations' },
  // { id: 1, label: 'Sessions', classname: 'sessions' },
  { id: 3, label: 'Overrides', classname: 'overrides' },
];

export const WeekDaysShortToLong = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

export const MonthsShortToLong = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December',
};

export const MoodSmilesData = [1, 2, 3, 4, 5];

export const FeelingStates = [
  'Feeling Terrible',
  'Feeling Bad',
  'Feeling Okay',
  'Feeling Good',
  'Feeling Awesome',
];

export const therapistActivityDemo = [
  // {id: 1, name: 'Alice Demo', label: 'booked a session with you', date:'3w'},
  {
    id: 1,
    name: 'Alice Demo',
    label: 'modified a consultation with you',
    date: '5w',
  },
  // {id: 1, name: 'Alice Demo', label: 'cancelled a consultation with you', date:'6w'},
  { id: 1, name: 'Alice Demo', label: 'is now connected with you', date: '6w' },
];

export const therapistBookingsDemo = [
  {
    id: 1,
    name: 'Jonah Demo',
    type: 'Consultation',
    date: '12 Sep, 10:00 am - 10:15 am',
  },
  {
    id: 1,
    name: 'Alice Demo',
    type: 'Session',
    date: '14 Sep, 4:00 pm - 4:50 pm',
  },
];

export const JonahDemoData = [
  {
    email: 'jonahdemo@gmail.com',
    id: 2218,
    isAccepted: true,
    isConversation: false,
    lastUpdate: '2025-04-09T12:08:14.000Z',
    name: 'Jonah Demo',
    shareOffloads: true,
    client: {},
    therapist: {},
  },
];

export const GroupAll = {
  uuid: 'all',
  name: 'All',
};
