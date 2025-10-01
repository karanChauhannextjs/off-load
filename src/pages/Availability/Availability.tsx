import { useEffect, useState } from 'react';

import styles from './Availability.module.scss';
import { AvailabilityTabsData } from '@constants/constants.ts';
import {
  IBodyTheWorkHours,
  IOverrideData,
  IResult,
  IResultItem,
  ITime,
} from '@models/availability.ts';
import { getOverrideHours, getTherapistWorkHours } from '@api/availability.ts';
import {
  formatDateToSec,
  startTimestampToday,
  endTimestampCurrentWeek,
  startTimestampCurrentWeek, oneYearInMiliSeconds,
} from '@constants/daysAndTime.ts';
import {
  DateControl,
  OverrideForm,
  CalendarConnection,
} from '@widgets/index.ts';
import { LoadingScreen } from '@pages/index.ts';
import { AvailabilityTabs, GoogleDisconnectModal } from '@features/index.ts';
import DatePicker from '@widgets/DatePicker/DatePicker.tsx';
import { useAvailability } from '@store/availability.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { useProfileStore } from '@store/profile.ts';
import {currentBaseUrl} from "@utils/helpers.ts";
import cn from 'classnames';
import { PaidStatus } from '@constants/plans.ts';
// import {useProfileStore} from "@store/profile.ts";

const Availability = () => {
  const [isActiveTab, setIsActiveTab] = useState<number>(2);
  const [weekData, setWeekData] = useState<IResult>({});
  const [overrideData, setOverrideData] = useState<IOverrideData[]>([]);
  const [overrideDayData, setOverrideDayData] = useState<IResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [day, setDay] = useState<string>();
  const [disconnectShow, setDisconnectShow] = useState<boolean>(false);
  const modalHandlers = useAppModalSimpleHandlers();
  const getProfileData = useProfileStore((state) => state.getProfile);
  const profileData = useProfileStore((state) => state.profile);
  // const [events, setEvents] = useState([]);
  // const [isSignedIn, setIsSignedIn] = useState(false);
  // const [accessToken, setAccessToken] = useState('');
  // const [tokenClient, setTokenClient] = useState(null);
  // const API_KEY = 'AIzaSyAEEVgJbTC-6wJ13N2pPNY-e5Rnkejegzk';
  // const DISCOVERY_DOCS = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const CLIENT_ID = `59821485897-l6co56dtmgocl6qjb6qrjqt48ou5dfrr.apps.googleusercontent.com`;
  const SCOPES = 'https://www.googleapis.com/auth/calendar';
  const REDIRECT_URI = `${currentBaseUrl}/google/-connect-google`;
  //const LOC_REDIRECT_URI = 'http://localhost:5174/google/-connect-google';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=code&access_type=offline&prompt=consent`;
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const getAvailabilityStatus = useAvailability(
    (state) => state.getAvailabilityStatus,
  );

  const createTherapistWorkHourStatus = useAvailability(
    (state) => state.createTherapistWorkHourStatus,
  );

  const updateTherapistWorkHourStatus = useAvailability(
    (state) => state.updateTherapistWorkHourStatus,
  );

  const deleteTherapistWorkHourStatus = useAvailability(
    (state) => state.deleteTherapistWorkHourStatus,
  );

  const overrideHourStatus = useAvailability(
    (state) => state.overrideHourStatus,
  );
  const updateOverrideHourStatus = useAvailability(
    (state) => state.updateOverrideHourStatus,
  );

  const deleteOverrideHourStatus = useAvailability(
    (state) => state.deleteOverrideHourStatus,
  );

  // const updateProfile = useProfileStore((state) => state.updateProfile);

  const onClickTab = (id: number) => {
    if (id !== isActiveTab) {
      setLoading(true);
      setWeekData({});
      setIsActiveTab(id);
      setDay('');
      setOverrideDayData([]);
    }
  };

  const subtitleCheck = (id: number) => {
    switch (id) {
      case 1:
        return 'Configure the times ranges when you’re available for sessions';
      case 2:
        return 'Configure the times ranges when you’re available for consultations';
      case 3:
        return 'Set one off times when you’re unavailable for sessions and consultations.';
    }
  };

  const onChangeDatePicker = (e: string) => {
    setDay(e);
    setOverrideDayData([]);
  };

  const onChangeMonth = ()  =>{
    setDay('')
  }

  useEffect(() => {
    if (isActiveTab === 3) {
      getOverrideHours(
        Math.ceil(startTimestampToday / 1000),
        Math.ceil((oneYearInMiliSeconds + startTimestampToday) / 1000),
      ).then((res) => {
        setOverrideData(res.result);
      });
    } else {
      getTherapistWorkHours(
        Math.ceil(startTimestampCurrentWeek / 1000),
        Math.ceil(endTimestampCurrentWeek / 1000),
        isActiveTab,
      ).then((res) => {
        const result: IResult = {};
        res.result.forEach((item: IBodyTheWorkHours) => {
          const dayOfWeek =
            item.weekDay === 1
              ? 'sunday'
              : item.weekDay === 2
                ? 'monday'
                : item.weekDay === 3
                  ? 'tuesday'
                  : item.weekDay === 4
                    ? 'wednesday'
                    : item.weekDay === 5
                      ? 'thursday'
                      : item.weekDay === 6
                        ? 'friday'
                        : item.weekDay === 7
                          ? 'saturday'
                          : null;

          if (!dayOfWeek) return;

          if (!result[dayOfWeek]) {
            result[dayOfWeek] = [];
          }

          if (item.ranges) {
            item.ranges.forEach((range: ITime) => {
              result?.[dayOfWeek]?.push({
                dayUUID: item.uuid,
                uuid: range?.uuid,
                start: { value: range.start, label: range.start },
                end: { value: range.end, label: range.end },
              });
            });
          }
        });
        setLoading(false);
        setWeekData({ ...result });
      });
    }
  }, [
    isActiveTab,
    createTherapistWorkHourStatus,
    updateTherapistWorkHourStatus,
    deleteTherapistWorkHourStatus,
    overrideHourStatus,
    updateOverrideHourStatus,
    deleteOverrideHourStatus,
  ]);
  const handleAuthClick = () => {
    window.location.href = authUrl;
    // gapi.auth2.getAuthInstance().signIn({
    //   prompt: 'consent', // to ensure refresh token is provided
    //   access_type: 'offline', // to ensure refresh token is provided
    // }).then(() => {
    //   const user = gapi.auth2.getAuthInstance().currentUser.get();
    //   const authResponse = user.getAuthResponse(true);
    //   setAccessToken(authResponse.access_token);
    //   console.log('authResponse',authResponse)
    // });
  };

  const onClickDisconnect = () => {
    setDisconnectShow(true);
    modalHandlers.show();
    // gapi.auth2.getAuthInstance().signOut();
  };

  // const initClient = () => {
  //   gapi.client.init({
  //     apiKey: API_KEY,
  //     clientId: CLIENT_ID,
  //     discoveryDocs: [DISCOVERY_DOCS],
  //     scope: SCOPES
  //   }).then(() => {
  //     const authInstance = gapi.auth2.getAuthInstance();
  //     if(user?.isGoogleCalendarConnected !== authInstance.isSignedIn.get()){
  //       updateProfile({
  //         isGoogleCalendarConnected:authInstance.isSignedIn.get()
  //       })
  //       localStorage.setItem('user', JSON.stringify({...user, isGoogleCalendarConnected:authInstance.isSignedIn.get()}));
  //     }
  //     setIsSignedIn(authInstance.isSignedIn.get());
  //     authInstance.isSignedIn.listen(setIsSignedIn);
  //     if (authInstance.isSignedIn.get()) {
  //       const user = authInstance.currentUser.get();
  //       const authResponse = user.getAuthResponse();
  //       setAccessToken(authResponse.access_token);
  //     }
  //
  //   }).catch((error:any) => {
  //     console.error('Error loading GAPI client:', error);
  //   });
  // };

  useEffect(() => {
    setOverrideDayData([]);
    if (!!day && !!overrideData.length) {
      overrideData.forEach((obj: IOverrideData) => {
        if (formatDateToSec(day) === obj.date) {
          setOverrideDayData((prevData: IResultItem[]) => [
            ...prevData,
            ...obj.ranges.map((el: any) => ({
              dayUUID: obj.uuid,
              start: { value: el.start, label: el.start },
              end: { value: el.end, label: el.end },
              uuid: el.uuid,
            })),
          ]);
        }
      });
    }
  }, [day, overrideData]);

  // useEffect(() => {
  //   gapi.load('client:auth2', initClient);
  //
  // }, []);

  // useEffect(() => {
  //   if (isSignedIn) {
  //     gapi.client.calendar.events.list({
  //       'calendarId': 'primary',
  //       'timeMin': (new Date()).toISOString(),
  //       'showDeleted': false,
  //       'singleEvents': true,
  //       'maxResults': 1000,
  //       'orderBy': 'startTime'
  //     }).then((response:any) => {
  //       const events = response.result.items;
  //       setEvents(events);
  //     }).catch((error:any) => {
  //       console.error('Error fetching calendar events:', error);
  //     });
  //   }
  // }, [isSignedIn]);
  //
  // console.log('accessToken:', accessToken);
  // console.log('events:', events);

  useEffect(() => {
    getProfileData();
  }, [disconnectShow]);

  useEffect(() =>{
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },[])

  return (
    <div className={cn(styles.mainWrapper, {[styles.mainWrapperWithUpgradeBanner]: !user?.isSubscribed || user?.paidStatus !== PaidStatus.Paid})}>
      <div className={styles.pageWrapper}>
        <span className={styles.title}>Availability</span>
        <div className={styles.line}></div>
        <div className={styles.main}>
          <div className={styles.timezonesLabelsMobile}>
            <span className={styles.timezoneLabels}>Availability works for UK timezones only.</span>
            <span className={styles.timezoneLabels}>More timezones coming soon.</span>
          </div>
          <div className={styles.leftSide}>
            <div className={styles.tabsWrapper}>
              <AvailabilityTabs
                onClick={onClickTab}
                className={styles.tabbar}
                isActiveTab={isActiveTab}
                tabsData={AvailabilityTabsData}
              />
            </div>
            <span className={styles.label}>{subtitleCheck(isActiveTab)}</span>

            {isActiveTab === 3 ? (
              <div className={styles.calendarBlock}>
                <DatePicker data={overrideData} onChange={onChangeDatePicker} onChangeMonth={onChangeMonth}/>
                <OverrideForm day={day} data={{ override: overrideDayData }} />
              </div>
            ) : (
              <>
                {loading ||
                createTherapistWorkHourStatus === 'LOADING' ||
                updateTherapistWorkHourStatus === 'LOADING' ||
                deleteTherapistWorkHourStatus === 'LOADING' ||
                getAvailabilityStatus === 'LOADING' ? (
                  <div className={styles.loadWrapper}>
                    <LoadingScreen />
                  </div>
                ) : (
                  <DateControl type={isActiveTab} data={weekData} />
                )}
              </>
            )}
          </div>
          <div className={styles.rightSide}>
            <CalendarConnection
              connected={profileData?.isGoogleCalendarConnected}
              onClickDisconnect={onClickDisconnect}
              onClickConnect={handleAuthClick}
            />
            <div className={styles.timezonesLabels}>
              <span className={styles.timezoneLabels}>Availability works for UK timezones only.</span>
              <span className={styles.timezoneLabels}>More timezones coming soon.</span>
            </div>
          </div>
        </div>
      </div>
      {disconnectShow && (
        <AppModal width={445} {...modalHandlers} withBorder={false}>
          <GoogleDisconnectModal setDisconnectShow={setDisconnectShow} />
        </AppModal>
      )}
    </div>
  );
};
export default Availability;
