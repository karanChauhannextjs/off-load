import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Banner from '@features/Banner';
import styles from './MyPage.module.scss';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { FeedbackModal, LoadingScreen, ShareModal } from '@pages/index.ts';
import { GallarySlider } from '@features/index.ts';
import { Avatar, Badge, Button } from '@shared/ui';
import { BookingCard } from '@widgets/index.ts';
import {
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
} from '@routes/Routes.types.ts';
import { useProfileStore } from '@store/profile.ts';
import toast from 'react-hot-toast';
import { formatLink } from '@utils/helpers.ts';
import { parseISO } from 'date-fns';
import cn from 'classnames';
import { PaidStatus } from '@constants/plans.ts';

export interface ISocialLinks {
  id: number;
  icon?: string;
  isActive?: boolean;
  link?: string;
}

const MyPage: React.FC = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1200);
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const navigate = useNavigate();
  const { state, pathname } = useLocation();
  const modalHandlers = useAppModalSimpleHandlers();
  // const [showNavbar, setShowNavbar] = useState<boolean>(true);
  const [show, setShow] = useState({
    session: false,
    consultation: true,
  });
  const [shareShow, setShareShow] = useState<boolean>(false);
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const [videoShow, setVideoShow] = useState<boolean>(false);
  const [socialLinks, setSocialLinks] = useState<ISocialLinks[]>([]);
  const [profileUpdated, setProfileUpdated] = useState<boolean>(false);
  const getProfile = useProfileStore((state) => state.getProfile);
  const getProfilesStatus = useProfileStore((state) => state.getProfilesStatus);
  const profile = useProfileStore((state) => state.profile);
  const currentUser = useProfileStore((state) => state.currentUser);

  const onEditHandler = () => {
    navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.EDIT_PAGE}`);
  };

  const onShareHandler = () => {
    setFeedbackShow(false);
    setVideoShow(false);
    setShareShow(true);
    modalHandlers.show();
  };

  const feedbackModalHandler = () => {
    setVideoShow(false);
    setShareShow(false);
    setFeedbackShow(true);
    modalHandlers.show();
  };

  const onPlayVideo = () => {
    setFeedbackShow(false);
    setShareShow(false);
    setVideoShow(true);
    modalHandlers.show();
  };

  // const navbarItemHandler = (id: number, path: string) => {
  //   if (id === 1) {
  //     localStorage.setItem('fromAddClient', 'yes')
  //   }
  //   navigate(`${THERAPIST_PRIVATE_BASE_URL}/${path}`);
  // };

  const onChangeRadio = () => {
    setShow({
      session: show.session,
      consultation: show.consultation,
    });
  };

  const onClickBookingCard = () => {
    setShow({
      session: !show.session,
      consultation: !show.consultation,
    });
  };

  const onClickBook = () => {
    toast.error("Hi! You can't book a session with yourself");
  };

  // const onMessageHandler = () => {
  //   toast.error("You can't send a message to yourself");
  // };

  useEffect(() => {
    getProfile().then((res: any) => {
      if (res.result) {
        setProfileUpdated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (state?.startCallError) {
      toast.error('You can start five minutes before the start time');
      navigate(pathname, { replace: true });
    }
    if (state?.startCallExpireError) {
      toast.error('The booking time has expired.');
      navigate(pathname, { replace: true });
    }
  }, [state]);

  useEffect(() => {
    setSocialLinks([
      {
        id: 1,
        icon: 'linkedin',
        isActive: profile?.isLinkedinLinkActive,
        link: profile?.linkedinLink,
      },
      {
        id: 2,
        icon: 'instagram',
        isActive: profile?.isInstagramLinkActive,
        link: profile?.instagramLink,
      },
      {
        id: 3,
        icon: 'twitter',
        isActive: profile?.isTwitterLinkActive,
        link: profile?.twitterLink,
      },
      {
        id: 4,
        icon: 'tiktok',
        isActive: profile?.isTiktokLinkActive,
        link: profile?.tiktokLink,
      },
    ]);
  }, [profile]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1200);
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!profile?.createdAt) {
      return;
    }
    let parsedDate: any;
    try {
      parsedDate = parseISO(profile?.createdAt);
    } catch (error) {
      return;
    }
    if (!parsedDate || isNaN(parsedDate)) {
      return;
    }
    // const currentDate = new Date();
    // const targetDate = addDays(parsedDate, 14); // Calculate the date 14 days from createdAt
    // setShowNavbar(isBefore(currentDate, targetDate));

    if (
      !profile?.userSessions?.[0]?.showActive &&
      profile?.userSessions?.[2]?.showActive
    ) {
      setShow({
        session: false,
        consultation: true,
      });
    }
  }, [profile]);

  return (
    <div className={cn(styles.wrapper, {[styles.wrapperWithUpgradeBanner]: !currentUser?.isSubscribed || currentUser.paidStatus !==PaidStatus.Paid})}>
      {isMobileScreen && (
        <>
          <span className={styles.mobileTitle}>My Page</span>
          <div className={styles.line}></div>
        </>
      )}
      <Banner
        className={cn(styles.banner, {[styles.bannerWithUpgrade]: !currentUser?.isSubscribed || currentUser.paidStatus !==PaidStatus.Paid})}
        firstLabel={'Your page:'}
        secondLabel={`stage.offloadweb.com/${profile?.username || ''}`}
        firstButtonLabel={''}
        secondButtonLabel={'Share'}
        secondButtonIcon={'share'}
        handlerSecondButton={onShareHandler}
      />
      {getProfilesStatus === 'LOADING' ? (
        <LoadingScreen />
      ) : (
        <>
          {/*{showNavbar && (*/}
          {/*  <div className={styles.navbarWrapper}>*/}
          {/*    <span className={styles.navbarTitle}>Getting Started</span>*/}
          {/*    <Navbar onClickItem={navbarItemHandler} />*/}
          {/*      <span className={styles.tempLabel}>My page</span>*/}
          {/*  </div>*/}
          {/*)}*/}
          <div className={cn(styles.main)}>
            <div className={styles.leftWrapper}>
              {isMobileScreen ? (
                <div className={styles.mobInfoWrapper}>
                  <div className={styles.nameRow}>
                    {profile?.name && (
                      <span className={styles.mobileName}>{profile.name}</span>
                    )}
                  </div>
                  <Avatar photoUrl={profile?.image} />
                  {profile?.username && <span>@{profile.username}</span>}
                  <div className={styles.mediasWrapper}>
                    {/*<Badge*/}
                    {/*  id={socialLinks.length + 1}*/}
                    {/*  className={cn(styles.badge, styles.messageBadge)}*/}
                    {/*  label={'Message'}*/}
                    {/*  onClick={onMessageHandler}*/}
                    {/*/>*/}
                    <Button label={'Edit page'} onClick={onEditHandler} className={styles.editButton}/>
                    {socialLinks?.map((item) => {
                      const { icon, isActive, link } = item;
                      if (isActive) {
                        return (
                          <a
                            key={item.id}
                            href={formatLink(link)}
                            target={'_blank'}
                            className={styles.socialLink}
                          >
                            <Badge
                              id={item.id}
                              key={icon}
                              className={styles.badge}
                              icon={icon}
                            />
                          </a>
                        );
                      }
                    })}
                  </div>
                </div>
              ) : (
                <div className={styles.infoWrapper}>
                  <Avatar photoUrl={profile?.image} />
                  <div className={styles.infoBlock}>
                    {profile?.name && (
                      <span className={styles.name}>{profile.name}</span>
                    )}
                    {profile?.username && <span>@{profile.username}</span>}
                    <div className={styles.mediasWrapper}>
                      {/*<Badge*/}
                      {/*  id={socialLinks.length + 1}*/}
                      {/*  className={cn(styles.badge, styles.messageBadge)}*/}
                      {/*  label={'Message'}*/}
                      {/*  onClick={onMessageHandler}*/}
                      {/*/>*/}
                      <Button label={'Edit page'} onClick={onEditHandler} className={styles.editButton}/>
                      {socialLinks?.map((item) => {
                        const { icon, isActive, link } = item;
                        if (isActive) {
                          return (
                            <a
                              key={item.id}
                              href={formatLink(link)}
                              target={'_blank'}
                              className={styles.socialLink}
                            >
                              <Badge
                                id={item.id}
                                key={icon}
                                className={styles.badge}
                                icon={icon}
                              />
                            </a>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.bioBlock}>
                {profile?.profession && (
                  <span className={styles.label}>{profile.profession}</span>
                )}
                {profile?.location && (
                  <span className={styles.location}>{profile.location}</span>
                )}
                {profile?.shortBio && (
                  <span className={cn(styles.label, styles.shortBio)}>
                    {profile.shortBio}
                  </span>
                )}
              </div>
              <div className={styles.specialitiesBlock}>
                {profile?.specialities?.map((spec) => {
                  if (spec?.isActive) {
                    return (
                      <Badge
                        className={styles.badgeSpec}
                        key={spec?.uuid}
                        id={spec?.id}
                        label={spec?.name}
                      />
                    );
                  }
                })}
                {profile?.customSpecialities?.map((spec) => {
                  if (spec?.isSelected) {
                    return (
                      <Badge
                        className={styles.badgeSpec}
                        key={spec?.id}
                        id={spec?.id}
                        label={spec?.name}
                      />
                    );
                  }
                })}
              </div>
              {isSmallScreen && (
                <div className={styles.rightWrapper}>
                  {profile?.userSessions?.[2]?.showActive && (
                    <BookingCard
                      username={profileUpdated ? profile.username : ''}
                      type={'consultation'}
                      onChangeRadio={onChangeRadio}
                      onClickCard={onClickBookingCard}
                      show={show.consultation}
                      onClickBook={onClickBook}
                      data={profile.userSessions}
                    />
                  )}
                  {profile?.userSessions?.[0]?.showActive && (
                    <BookingCard
                      username={profileUpdated ? profile.username : ''}
                      type={'session'}
                      onChangeRadio={onChangeRadio}
                      onClickCard={onClickBookingCard}
                      show={show.session}
                      onClickBook={onClickBook}
                      data={profile.userSessions}
                    />
                  )}
                </div>
              )}
              {(!!profile?.userImages?.length ||
                !!profile?.userVideos?.length) && (
                <div className={styles.galleryWrapper}>
                  <GallarySlider
                    className={styles.gallery}
                    images={profile?.userImages}
                    video={profile?.userVideos}
                    onPlayVideo={onPlayVideo}
                  />
                </div>
              )}
              {profile?.fullBio && (
                <div className={styles.block}>
                  <span className={styles.subtitle}>Biography</span>
                  <span className={styles.labelBio}>{profile.fullBio}</span>
                </div>
              )}
              {profile?.educations &&
                profile?.educations?.some((e) => e?.name) && (
                  <div className={styles.block}>
                    <span className={styles.subtitle}>
                      Education & Accreditations
                    </span>
                    <ul className={styles.list}>
                      {profile.educations.map((item) => {
                        if (item?.name) {
                          return (
                            <li key={item.id} className={styles.label2}>
                              {item?.name}
                            </li>
                          );
                        }
                      })}
                    </ul>
                  </div>
                )}
              {profile?.memberships &&
                profile?.memberships?.some((e) => e?.name) && (
                  <div className={styles.block}>
                    <span className={styles.subtitle}>Memberships</span>
                    <ul className={styles.list}>
                      {profile?.memberships?.map((item) => {
                        if (item?.name) {
                          return (
                            <li key={item.id} className={styles.label2}>
                              {item?.name}
                            </li>
                          );
                        }
                      })}
                    </ul>
                  </div>
                )}
              <Button
                className={styles.feedbackButton}
                onClick={feedbackModalHandler}
                variant={'tertiary'}
                label={'Send feedback'}
              />
            </div>
            {!isSmallScreen && (
              <div className={styles.rightWrapper}>
                {profile?.userSessions?.[2]?.showActive && (
                  <BookingCard
                    username={profileUpdated ? profile.username : ''}
                    onChangeRadio={onChangeRadio}
                    onClickCard={onClickBookingCard}
                    show={show.consultation}
                    onClickBook={onClickBook}
                    data={profile.userSessions}
                    type={'consultation'}
                  />
                )}
                {profile?.userSessions?.[0]?.showActive && (
                  <BookingCard
                    username={profileUpdated ? profile.username : ''}
                    type={'session'}
                    onChangeRadio={onChangeRadio}
                    onClickCard={onClickBookingCard}
                    show={show.session}
                    onClickBook={onClickBook}
                    data={profile.userSessions}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}
      {shareShow && (
        <AppModal width={389} {...modalHandlers}>
          <ShareModal link={profile?.username} setShareShow={setShareShow} />
        </AppModal>
      )}

      {feedbackShow && (
        <AppModal width={389} {...modalHandlers}>
          <FeedbackModal setFeedbackShow={setFeedbackShow} />
        </AppModal>
      )}

      {videoShow && !isMobileScreen && (
        <AppModal
          withBorder={false}
          width={'100%'}
          {...modalHandlers}
          className={styles.videoModal}
        >
          <video controls autoPlay className={styles.video}>
            <source src={profile?.userVideos?.[0]?.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </AppModal>
      )}
    </div>
  );
};
export default MyPage;
