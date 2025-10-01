import React, { useEffect, useState } from 'react';

import styles from './Feed.module.scss';
import { FeedProps } from './Feed.types.tsx';
import { Diagram, ExerciseAnswerCard, MoodAnswerCard } from '@widgets/index.ts';
import { Button } from '@shared/ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { RoutesEnum, USER_PUBLIC_BASE_URL } from '@routes/Routes.types.ts';
import { useFeeling } from '@store/feeling.ts';
import { USER_TYPES } from '@constants/user.ts';
import { getWeekTimestamps, transformData } from '@utils/helpers.ts';
import { isSameDay } from 'date-fns';
import { mockdataDiagram } from '@pages/Feed/Feed.constants.ts';
import { Helmet } from 'react-helmet';
import { LoadingScreen } from '@pages/index.ts';
import cn from 'classnames';

const Feed: React.FC<FeedProps> = (props) => {
  const { withTitle = true, clientUuid, setIsFeedData } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const getClientFeed = useFeeling((state) => state.getClientFeed);
  const clientFeed = useFeeling((state) => state.clientFeed);
  const getTherapistFeed = useFeeling((state) => state.getTherapistFeed);
  const getTherapistFeedStatus = useFeeling(
    (state) => state.getTherapistFeedStatus,
  );
  const therapistFeed = useFeeling((state) => state.therapistFeed);
  const getDemoClientFeed = useFeeling((state) => state.getDemoClientFeed);
  const demoClientFeed = useFeeling((state) => state.demoClientFeed);
  const resetFeedData = useFeeling((state) => state.reset);
  const [diagramData, setDiagramData] = useState<any[]>([]);
  const [isFeedData, setIsFeed] = useState(false);
  const [isFetchedData, setIsFetchedData] = useState(false);

  const onSignupClick = () => {
    navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.CLIENT_SIGN_UP}`);
  };

  const getFeedData = async () => {
    resetFeedData();
    const weekStartTimestamp =
      getWeekTimestamps(currentWeekOffset).startTimestamp;
    const weekEndTimestamp = getWeekTimestamps(currentWeekOffset).endTimestamp;
    try {
      if (user?.type === USER_TYPES.THERAPIST && clientUuid) {
        await getTherapistFeed(
          clientUuid,
          weekStartTimestamp,
          weekEndTimestamp,
        );
        setIsFetchedData(true);
      } else if (user?.type === USER_TYPES.CLIENT) {
        await getClientFeed(weekStartTimestamp, weekEndTimestamp);
        setIsFetchedData(true);
      } else {
        setIsFetchedData(true);
        setIsFeed(false);
        setIsFeedData && setIsFeedData(false);
      }
    } catch (err) {
      console.log('Err', err);
    }
  };

  useEffect(() => {
    const weekStartTimestamp =
      getWeekTimestamps(currentWeekOffset).startTimestamp;
    const weekEndTimestamp = getWeekTimestamps(currentWeekOffset).endTimestamp;

    if (user?.uuid) {
      getFeedData();
    } else {
      getDemoClientFeed(weekStartTimestamp, weekEndTimestamp, 2);
      setIsFetchedData(true);
    }
  }, [clientUuid, currentWeekOffset]);

  const pageData =
    user?.type === USER_TYPES?.THERAPIST
      ? therapistFeed
      : user?.type === USER_TYPES?.CLIENT
        ? clientFeed
        : demoClientFeed;

  useEffect(() => {
    if (pageData?.feelingAverage) {
      setDiagramData(
        transformData(pageData?.feelingAverage),
      );
    }
    if(demoClientFeed?.feelingAverage){
      setDiagramData(
        transformData(demoClientFeed?.feelingAverage),
      )
    }
  }, [pageData, demoClientFeed]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (
      therapistFeed &&
      !therapistFeed?.isFeelingSelected &&
      location.pathname.includes('shared-clients')
    ) {
      setIsFeed(false);
      setIsFeedData && setIsFeedData(false);
    } else {
      setIsFeed(true);
      setIsFeedData && setIsFeedData(true);
    }
    if (user?.type === USER_TYPES.THERAPIST && !clientUuid) {
      setIsFeed(false);
      setIsFeedData && setIsFeedData(false);
    }
  }, [therapistFeed, location.pathname, clientUuid]);

  if (!isFeedData && getTherapistFeedStatus === 'SUCCESS') {
    return (
      <div className={styles.feedWrapperInChatWithoutData}>
        <span>No feed data added by the client yet</span>
      </div>
    );
  }

  const isSharedClients = location.pathname.includes('shared-clients');
  const data = user?.uuid || isSharedClients ? diagramData : mockdataDiagram;

  return (
    <div className={styles.feedMain}>
      {user?.uuid && location.pathname.includes('feed') && (
        <Helmet>
          <meta name="theme-color" content="#FFDC66" />
        </Helmet>
      )}
      {isFetchedData ? (
        <div className={styles.feedWrapper}>
          {withTitle && <span className={styles.title}>Feed</span>}
          <div className={styles.checkinsWrapper}>
            <span className={styles.subtitle}>Check ins</span>
            <Diagram
              data={data}
              setCurrentWeekOffset={setCurrentWeekOffset}
              weekAverage={
                user?.uuid
                  ? pageData?.feelingAverage?.currentWeek?.weekAverage
                  : location.pathname.includes('shared-clients')
                    ? demoClientFeed?.feelingAverage?.currentWeek?.weekAverage
                    : '3.6'
              }
              widthWeeks={!!user?.uuid || (!user?.uuid && location.pathname.includes('shared-clients'))}
              isFeelingSelected={pageData?.isFeelingSelected}
            />
          </div>
          {(user?.uuid ||
            (!user?.uuid && location.pathname.includes('shared-clients'))) && (
            <div className={styles.entriesWrapper}>
              <span className={styles.subtitle2}>Entries</span>
              <div className={styles.entriesBlock}>
                {pageData?.feedData?.map((item: any, index: number) => {
                  const currentDate = item.date * 1000;
                  const prevDate =
                    index > 0
                      ? pageData?.feedData?.[index - 1].date * 1000
                      : null;
                  const shouldPrintDate =
                    !prevDate || !isSameDay(currentDate, prevDate);

                  return (
                    <>
                      {!!item?.feeling && (
                        <MoodAnswerCard
                          shouldPrintDate={shouldPrintDate}
                          data={item?.feeling}
                        />
                      )}
                      {!!item?.exercise && (
                        <ExerciseAnswerCard
                          shouldPrintDate={shouldPrintDate}
                          data={item?.exercise}
                        />
                      )}
                    </>
                  );
                })}
              </div>
              <span className={styles.entrieText}>
                Entries are encrypted, not even Offload can see them.
              </span>
            </div>
          )}
          {!user?.uuid && !location.pathname.includes('shared-clients') && (
            <div className={styles.notLoginOverlay}>
              <div className={styles.infoWrapper}>
                <span className={styles.bold}>Save your progress</span>
                <span className={styles.label}>
                  Get a care plan, send secure messages, book sessions and more.
                </span>
                <Button
                  label={'Sign up'}
                  className={styles.buttonSignup}
                  onClick={onSignupClick}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <LoadingScreen
          className={cn({
            [styles.loadingWrapper]: user?.type === USER_TYPES.THERAPIST,
          })}
        />
      )}
    </div>
  );
};
export default Feed;
