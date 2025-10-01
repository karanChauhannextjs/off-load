import styles from './Call.module.scss';
import cn from 'classnames';

import Logo from '@assets/svg/logo.svg';
import { useEffect, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteUser,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
} from 'agora-rtc-react';
import { LoadingScreen } from '@pages/index.ts';
import { IProfile } from '@models/profile.ts';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getCallToken } from '@api/call.ts';
import {USER_TYPES} from "@constants/user.ts";

const Call = () => {
  const [client] = useState<IAgoraRTCClient>(() =>
    AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }),
  );
  const { state } = useLocation();
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<IProfile | null>();
  const [videoHidden, setVideoHidden] = useState<boolean>(false);
  const [audioHidden, setAudioHidden] = useState<boolean>(false);
  const [connectedRemote, setConnectedRemote] = useState<boolean>(false);

  const { isLoading: isLoadingMic } = useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam } = useLocalCameraTrack();

  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [callToken, setCallToken] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  const duration = !!searchParams.get('duration') ? Number(searchParams.get('duration')) : 0;
  const ownerName = searchParams.get('ownerName')?.replace('%20', ' ')
  const otherName = searchParams.get('otherName');
  const startEnable = (Number(date) / 343) * 1000 - 5 * 60 * 1000 < Date.now();
  const afterTime = (Number(date) / 343) * 1000 + (duration +5) * 60 * 1000 < Date.now();
  const channelName = location?.pathname?.split('/')?.[2];
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  useEffect(() => {
    const navigateUrl =
      user?.type === USER_TYPES.THERAPIST
        ? '/therapist/my-page'
        : user?.type === USER_TYPES.CLIENT
          ? '/client/client-home'
          : '/auth/login';
    if (!!date && !startEnable) {
      if (localAudioTrack) localAudioTrack.close();
      if (localVideoTrack) localVideoTrack.close();
      navigate(navigateUrl, { state: { startCallError: true } });
    }
    if (!!date && afterTime) {
      if (localAudioTrack) localAudioTrack.close();
      if (localVideoTrack) localVideoTrack.close();
      navigate(navigateUrl, { state: { startCallExpireError: true } });
    }
  }, []);

  const onClickAudio = () => {
    if (audioHidden) {
      localAudioTrack?.setEnabled(true);
    } else {
      localAudioTrack?.setEnabled(false);
    }
    setAudioHidden((prev) => !prev);
  };

  const onClickVideo = () => {
    if (state?.type === 'video-call' || status === 'video') {
      if (videoHidden) {
        localVideoTrack?.setEnabled(true);
      } else {
        localVideoTrack?.setEnabled(false);
      }
      setVideoHidden((prev) => !prev);
    }
  };

  const onClickLeave = () => {
    try {
      localVideoTrack?.setEnabled(false);
      localAudioTrack?.setEnabled(false);
      client.leave();
      navigate('/');
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  const initAgora = async () => {
    // Initialize client and event listeners
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      setConnectedRemote(true);
      if (mediaType === 'video') {
        setRemoteUsers((prevUsers) => [...prevUsers, user]);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        setRemoteUsers((prevUsers) =>
          prevUsers.filter((u) => u.uid !== user.uid),
        );
      }
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
    });

    client.on('user-left', (user) => {
      setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
      setConnectedRemote(false); // Mark remote user as disconnected
    });

    const [microphoneTrack, cameraTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks();
    setLocalAudioTrack(microphoneTrack);
    setLocalVideoTrack(cameraTrack);

    await client.join(
      '9fa47849681a466896a8a7304fbd72ea',
      channelName,
      callToken,
      null,
    );
    await client.publish([microphoneTrack, cameraTrack]);
  };

  useEffect(() => {
    getCallToken(channelName).then((res) => {
      setCallToken(res?.result);
    });
  }, [channelName]);

  useEffect(() => {
    if (!!callToken) {
      initAgora();

      return () => {
        if (localAudioTrack) localAudioTrack.close();
        if (localVideoTrack) localVideoTrack.close();
        client.leave();
      };
    }
  }, [client, location, status, channelName, callToken]);

  useEffect(() => {
    setUserData(JSON.parse(localStorage.getItem('user') ?? '{}'));
    if (state?.type === 'voice-call' || status === 'voice') {
      setVideoHidden(true);
    }
  }, [state, status]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconWrapper}>
        <img src={Logo} alt="Logo" />
      </div>
      <div className={styles.mainWrapper}>
        <div className={styles.trackWrapper}>
          {(isLoadingCam && isLoadingMic) || !callToken ? (
            <LoadingScreen className={styles.loader} />
          ) : (
            <>
              {!!remoteUsers.length ? (
                <>
                  <RemoteUser user={remoteUsers[0]} />
                </>
              ) : (
                <>
                  {connectedRemote ? (
                    <span className={styles.label1}>
                      {otherName
                        ? otherName
                        : state?.otherName
                          ? state?.otherName
                          : 'User'}
                    </span>
                  ) : (
                    <span className={styles.label1}>
                      No one else is here yet
                    </span>
                  )}
                </>
              )}
            </>
          )}
          <div className={styles.localUserWrapper}>
            {!videoHidden ? (
              <>
                <LocalVideoTrack
                  play
                  track={localVideoTrack}
                  className={styles.track}
                />
              </>
            ) : (
              <>
                <span className={styles.label2}>
                  {otherName
                    ? ownerName
                    : userData?.name
                      ? userData?.name
                      : 'User'}
                </span>
                <LocalAudioTrack play track={localAudioTrack} />
              </>
            )}
          </div>
        </div>
      </div>
      <div className={styles.actionsWrapper}>
        <div className={cn(styles.action)} onClick={onClickAudio}>
          <i className={cn('icon-voice-call', styles.icon)}></i>
          {audioHidden && <div className={styles.hideLine} />}
        </div>
        <div className={cn(styles.action)} onClick={onClickVideo}>
          <i className={cn('icon-video-call', styles.icon)}></i>
          {videoHidden && <div className={styles.hideLine} />}
        </div>
        <div
          className={cn(styles.action, styles.offWrapper)}
          onClick={onClickLeave}
        >
          <i className={cn('icon-plus', styles.icon, styles.closeIcon)}></i>
        </div>
      </div>
    </div>
  );
};
export default Call;
