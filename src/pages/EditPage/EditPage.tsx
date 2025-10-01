import React, { useEffect, useRef, useState } from 'react';
import * as yup from 'yup';
import cn from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';

import styles from './EditPage.module.scss';
import { schema } from './EditPage.validation.ts';
import { BookingEditCard } from '@widgets/index.ts';
import { Banner, Upload } from '@features/index.ts';
import { FeedbackModal, ShareModal } from '@pages/index.ts';
import { BadgeProps } from '@shared/ui/Badge/Badge.types.ts';
import {
  EDIT_PAGE_FORM_FIELDS,
  IUploadBlock,
  SocialLinkType,
} from './EditPage.types.ts';
import { Avatar, Badge, Button, Input, Switch, Textarea } from '@shared/ui';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { useProfileStore } from '@store/profile.ts';
import { IBodyUpdateProfile, IProfile } from '@models/profile.ts';
import { getProfile } from '@api/profile.ts';
import { getSpecialities } from '@api/global.ts';
import { ISpeciality } from '@models/global.ts';
import {
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
} from '@routes/Routes.types.ts';
import { ISessionItem } from '@widgets/BookingEditCard/BookingEditCard.types.ts';
import { isIphone } from '@utils/helpers.ts';
import { PaidStatus } from '@constants/plans.ts';

export type FormData = yup.InferType<typeof schema>;

const EditPage = () => {
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const currentUser = useProfileStore((state) => state.currentUser);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [image, setImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [shareShow, setShareShow] = useState<boolean>(false);
  const [feedbackShow, setFeedbackShow] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [changed, setChanged] = useState<boolean>(false);

  const [socialLinks, setSocialLinks] = useState<SocialLinkType[]>([]);
  const [newSpecInputShow, setNewSpecInputShow] = useState<boolean>(false);
  const [newSpecialities, setNewSpecialities] = useState<BadgeProps[]>([]);
  const [specialities, setSpecialities] = useState<ISpeciality[]>([]);
  const [isActiveSpecialities, setIsActiveSpecialities] = useState<number[]>(
    [],
  );
  const [isActiveCustomSpecialities, setIsActiveCustomSpecialities] = useState<
    number[]
  >([]);

  const [duration, setDuration] = useState<number>(5);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [changedImageId, setChangedImageId] = useState<number>();
  const [videoShow, setVideoShow] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [videoDeleted, setVideoDeleted] = useState<boolean>(false);
  const [uploadBlocks, setUploadBlocks] = useState<IUploadBlock[]>([
    { id: 1, type: 'video', imageSrc: '', file: null, uploaded: false },
    { id: 2, type: 'image', imageSrc: '', file: null, uploaded: false },
    { id: 3, type: 'image', imageSrc: '', file: null, uploaded: false },
  ]);
  const [pageData, setPageData] = useState<IProfile>();

  const updateProfile = useProfileStore((state) => state.updateProfile);
  const uploadProfilePicture = useProfileStore(
    (state) => state.uploadProfilePicture,
  );
  const uploadProfileBioImages = useProfileStore(
    (state) => state.uploadProfileBioImages,
  );
  const uploadProfileBioVideos = useProfileStore(
    (state) => state.uploadProfileBioVideos,
  );

  const updateProfileStatus = useProfileStore(
    (state) => state.updateProfileStatus,
  );
  const uploadProfilePictureStatus = useProfileStore(
    (state) => state.uploadProfilePictureStatus,
  );
  const uploadProfileBioImagesStatus = useProfileStore(
    (state) => state.uploadProfileBioImagesStatus,
  );
  const uploadProfileBioVideosStatus = useProfileStore(
    (state) => state.uploadProfileBioVideosStatus,
  );
  const videoThumbRef = useRef<HTMLVideoElement>(null);

  const {
    watch,
    control,
    setValue,
    setError,
    register,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });
  let shortBioLength = watch('shortBio')?.length || 0;
  let fullBioLength = watch('fullBio')?.length || 0;

  const saveButtonLoading =
    updateProfileStatus === 'LOADING' ||
    uploadProfilePictureStatus === 'LOADING' ||
    uploadProfileBioImagesStatus === 'LOADING' ||
    uploadProfileBioVideosStatus === 'LOADING';

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
    id: number,
  ) => {
    setChanged(true);
    e.stopPropagation();
    const file = e?.target?.files?.[0];
    if (!!file && type === 'video') {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        if (!!video.duration && video.duration <= 90) {
          const videoUrl = URL.createObjectURL(file);
          setVideoUrl(videoUrl);
          setVideoFile(file);
          setUploadBlocks((prevUploadBlocks) =>
            prevUploadBlocks.map((block) =>
              block.id === id
                ? { ...block, file: file, uploaded: true, imageSrc: '' }
                : block,
            ),
          );
        } else {
          toast.error('Video cannot be longer than 90 seconds!', {
            duration: 2000,
          });
        }
      };
    } else if (!!file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadBlocks((prevUploadBlocks) =>
        prevUploadBlocks.map((block) =>
          block.id === id
            ? { ...block, file: file, uploaded: true, imageSrc: imageUrl }
            : block,
        ),
      );
      if (pageData?.userImages?.length === 2) {
        setChangedImageId(pageData?.userImages?.[id - 2].id);
      }
    }
  };
  const handleCaptureImage = () => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.currentTime = Math.floor(Math.random() * duration);
    video.addEventListener('loadedmetadata', () => {
      setDuration(Math.floor(video.duration));
    });
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!!context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');

        // Convert data URL to Blob
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        // Create a File object
        const file = new File([blob], 'captured-image.jpg', {
          type: 'image/jpeg',
        });
        console.log('file', file);

        setUploadBlocks((prevUploadBlocks) => [
          {
            ...prevUploadBlocks[0],
            imageSrc: dataUrl,
            uploaded: true,
          },
          ...prevUploadBlocks.slice(1),
        ]);
      }
    };
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!!file) {
      setImageFile(file);
      const photoUrl = URL.createObjectURL(file);
      setImage(photoUrl);
      setChanged(true);
    }
  };
  const onDeleteUploaded = (id: number) => {
    setChanged(true);
    if (id === 1) {
      setVideoUrl('');
      if (!!pageData?.userVideos?.length) {
        setVideoDeleted(true);
      }
    }
    setUploadBlocks((prevUploadBlocks) =>
      prevUploadBlocks.map((block) =>
        block.id === id ? { ...block, uploaded: false, imageSrc: '' } : block,
      ),
    );
  };
  const onClickLinkBadge = (id: number) => {
    setSocialLinks((prevSocialLinks) =>
      prevSocialLinks.map(
        (socialLink) =>
          socialLink.id === id
            ? { ...socialLink, isChecked: true } // Set clicked link to checked
            : { ...socialLink, isChecked: false }, // Uncheck all other links
      ),
    );
  };
  const onChangeLinkSwitch = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
  ) => {
    setChanged(true);
    setSocialLinks((prevSocialLinks) =>
      prevSocialLinks.map((socialLink) =>
        socialLink.id === id
          ? { ...socialLink, isActive: e.target.checked }
          : socialLink,
      ),
    );
  };
  const handlePlay = (id: number) => {
    if (id === 1 && videoUrl && !isMobileScreen) {
      setFeedbackShow(false);
      setFeedbackShow(false);
      setVideoShow(true);
      modalHandlers.show();
    } else if (id === 1 && videoUrl && isMobileScreen) {
      handleVideoClick();
    }
    if (id !== 1) {
      window.open(uploadBlocks[id - 1]?.imageSrc);
    }
  };

  const onShareHandler = () => {
    setFeedbackShow(false);
    setShareShow(true);
    modalHandlers.show();
  };
  const onClickSpecBadge = (id: number) => {
    const includesId = isActiveSpecialities.includes(id);
    if (includesId) {
      const filteredArr = isActiveSpecialities.filter((e) => e !== id);
      setIsActiveSpecialities(filteredArr);
      setChanged(true);
    } else if (
      isActiveSpecialities.length + isActiveCustomSpecialities.length <
      6
    ) {
      isActiveSpecialities.push(id);
      setIsActiveSpecialities([...isActiveSpecialities]);
      setChanged(true);
    }
  };
  const onClickCustomSpecBadge = (id: number) => {
    const includesId = isActiveCustomSpecialities.includes(id);
    if (includesId) {
      const filteredArr = isActiveCustomSpecialities.filter((e) => e !== id);
      setIsActiveCustomSpecialities(filteredArr);
      setChanged(true);
    } else if (
      isActiveCustomSpecialities.length + isActiveSpecialities.length <
      6
    ) {
      isActiveCustomSpecialities.push(id);
      setIsActiveCustomSpecialities([...isActiveCustomSpecialities]);
      setChanged(true);
    }
  };
  const onAddNewSpeciality = () => {
    setNewSpecInputShow(true);
  };
  const onClickSpecCheck = () => {
    const newSpeciality = watch('new_speciality');
    if (!!newSpeciality) {
      setNewSpecialities([
        ...newSpecialities,
        { id: Date.now(), label: newSpeciality, isActive: false },
      ]);
      setValue('new_speciality', '');
    }
    setNewSpecInputShow(false);
  };
  const feedbackModalHandler = () => {
    setShareShow(false);
    setFeedbackShow(true);
    modalHandlers.show();
  };

  const onBack = () => {
    navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.MY_PAGE}`);
  };

  const handleFormSubmit = async (data: any) => {
    if (!isError) {
      const isLiveText30 = data?.session?.min30Types?.includes('live_text');
      const isVideoCall30 = data?.session?.min30Types?.includes('video_call');
      const isInPerson30 = data?.session?.min30Types?.includes('in_person');

      const isLiveText50 = data?.session?.min50Types?.includes('live_text');
      const isVideoCall50 = data?.session?.min50Types?.includes('video_call');
      const isInPerson50 = data?.session?.min50Types?.includes('in_person');

      const isLiveTextCons = data?.consultation?.types?.includes('live_text');
      const isVoiceCallCons = data?.consultation?.types?.includes('voice_call');
      const isVideoCallCons = data?.consultation?.types?.includes('video_call');
      const userSessions = [
        {
          type: 1,
          showActive: data?.session?.showActive,
          isActive: data?.session?.isActive30,
          price: data?.session?.min30Price,
          priceCurrency: '£',
          isLiveText: isLiveText30,
          isVideoCall: isVideoCall30,
          isInPerson: isInPerson30,
        },
        {
          type: 2,
          showActive: data?.session?.showActive,
          isActive: data?.session?.isActive50,
          price: data?.session?.min50Price,
          priceCurrency: '£',
          isLiveText: isLiveText50,
          isVideoCall: isVideoCall50,
          isInPerson: isInPerson50,
        },
        {
          type: 3,
          showActive: data?.consultation?.showActive,
          isActive: data?.consultation?.isActive,
          isLiveText: isLiveTextCons,
          isVoiceCall: isVoiceCallCons,
          isVideoCall: isVideoCallCons,
        },
      ];
      const deletedVideoIds = videoDeleted
        ? pageData?.userVideos?.map((el) => el.id)
        : [];
      const imagesDeletedStatus =
        !!pageData?.userImages?.length &&
        (!uploadBlocks[1]?.uploaded || !uploadBlocks[2]?.uploaded);
      const deletedImagesIds = imagesDeletedStatus
        ? pageData?.userImages
            ?.map((el, idx) =>
              !uploadBlocks[idx + 1]?.uploaded ? el.id : undefined,
            )
            .filter((id) => id !== undefined)
        : changedImageId
          ? [changedImageId]
          : [];
      // const educationsData: string[] = data.educations
      //   ?.map((el: IFieldArrayItem) => el.name)
      //   .filter(Boolean);
      // const membershipsData: string[] = data.memberships
      //   ?.map((el: IFieldArrayItem) => el.name)
      //   .filter(Boolean);
      const customCreatedSpecs =
        pageData?.customSpecialities?.map((el) => ({
          name: el?.name,
          id: el?.id,
          isSelected: isActiveCustomSpecialities?.includes(el?.id) ?? false,
        })) ?? [];
      const customSpecialities = newSpecialities?.map((el) => {
        return {
          name: el?.label,
          isSelected: isActiveCustomSpecialities.includes(el.id),
        };
      });
      try {
        const body: IBodyUpdateProfile = {
          name: data.name,
          location: data.location,
          profession: data.profession,
          shortBio: data.shortBio,
          fullBio: data.fullBio,
          linkedinLink: data.linkedinLink,
          instagramLink: data.instagramLink,
          twitterLink: data.twitterLink,
          tiktokLink: data.tiktokLink,
          isLinkedinLinkActive: socialLinks[0].isActive,
          isInstagramLinkActive: socialLinks[1].isActive,
          isTwitterLinkActive: socialLinks[2].isActive,
          isTiktokLinkActive: socialLinks[3].isActive,
          specialities: isActiveSpecialities,
          educations: data?.educations,
          memberships: data?.memberships,
          deleteVideos: deletedVideoIds,
          deleteImages: deletedImagesIds,
          userSessions: userSessions,
          customSpecialities: [...customCreatedSpecs, ...customSpecialities],
        };
        await updateProfile(body);
        setChanged(false);
        if (!!imageFile) {
          await uploadProfilePicture(imageFile);
          setChanged(false);
        }
        if (!!videoFile) {
          await uploadProfileBioVideos({
            video: videoFile,
          });
          setChanged(false);
        }

        const isNew =
          (pageData?.userImages?.length === 1 &&
            !imagesDeletedStatus &&
            uploadBlocks[1]?.uploaded &&
            uploadBlocks[2]?.uploaded) ||
          !!changedImageId;

        if (!!uploadBlocks[1].file || !!uploadBlocks[2].file) {
          const formData = new FormData();
          if (uploadBlocks[1].file && !uploadBlocks[2].file) {
            formData.append(`images`, uploadBlocks[1].file);
          } else if (uploadBlocks[2].file && !uploadBlocks[1].file) {
            formData.append(`images`, uploadBlocks[2].file);
          } else if (uploadBlocks[1].file && uploadBlocks[2].file) {
            formData.append(`images`, uploadBlocks[1].file);
            formData.append(`images`, uploadBlocks[2].file);
          }
          await uploadProfileBioImages(formData, isNew);
          setChanged(false);
        }
        toast.success('Profile updated successfully!');
        navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.MY_PAGE}`);
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  const handleVideoClick = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitEnterFullscreen) {
        (videoElement as any).webkitEnterFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).mozRequestFullScreen) {
        (videoElement as any).mozRequestFullScreen();
      } else if ((videoElement as any).msRequestFullscreen) {
        (videoElement as any).msRequestFullscreen();
      }
      videoElement.play().catch((err) => {
        console.error('Video playback error:', err);
      });
    }
  };
  const handleFullscreenChange = () => {
    const isFullscreen =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;
    if (!isFullscreen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange,
      );
    };
  }, []);

  useEffect(() => {
    handleCaptureImage();
  }, [videoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [videoRef]);

  useEffect(() => {
    getProfile().then((res) => {
      setPageData(res.result);
      if (res.result.userVideos?.length) {
        const updatedUploadBlocks = [...uploadBlocks];
        updatedUploadBlocks[0].imageSrc = res?.result?.userVideos[0]?.thumbnail;
        updatedUploadBlocks[0].uploaded = true;
        setUploadBlocks(updatedUploadBlocks);
        setVideoUrl(res.result.userVideos[0].video);
      }
      if (res.result.userImages?.length) {
        const updatedUploadBlocks = [...uploadBlocks];
        if (res?.result?.userImages?.[0]?.image) {
          updatedUploadBlocks[1].imageSrc = res?.result?.userImages?.[0]?.image;
          updatedUploadBlocks[1].uploaded = true;
        }
        if (res?.result?.userImages?.[1]?.image) {
          updatedUploadBlocks[2].imageSrc = res?.result?.userImages?.[1]?.image;
          updatedUploadBlocks[2].uploaded = true;
        }
        setUploadBlocks(updatedUploadBlocks);
      }
      setIsActiveSpecialities(res.result.specialities.map((item) => item?.id));
      setIsActiveCustomSpecialities(
        res.result.customSpecialities
          .filter((item) => item.isSelected)
          .map((item) => item.id),
      );
    });
    getSpecialities().then((res) => {
      setSpecialities(res);
    });
  }, []);
  useEffect(() => {
    if (pageData) {
      Object.entries(pageData)?.forEach(([key, value]) => {
        // @ts-ignore
        setValue(key, value ? value : '');
      });
      const typesMap: Record<string, string> = {
        isLiveText: 'live_text',
        isVideoCall: 'video_call',
        isInPerson: 'in_person',
        isVoiceCall: 'voice_call',
      };
      const newData = pageData?.userSessions?.map((item: ISessionItem) => {
        const arr = [];
        for (const key in item) {
          if (item[key as keyof ISessionItem] && typesMap[key]) {
            arr.push(typesMap[key]);
          }
        }
        return arr;
      });
      setValue('session', {
        showActive: pageData?.userSessions?.[0]?.showActive,
        isActive30: pageData?.userSessions?.[0]?.isActive,
        isActive50: pageData?.userSessions?.[1]?.isActive,
        min30Price: pageData.userSessions?.[0]?.price
          ? pageData.userSessions?.[0]?.price
          : 0,
        min50Price: pageData.userSessions?.[1]?.price
          ? pageData.userSessions?.[1]?.price
          : 0,
        min30Types: newData?.[0],
        min50Types: newData?.[1],
      });
      setValue('consultation', {
        showActive: pageData?.userSessions?.[2]?.showActive,
        isActive: pageData?.userSessions?.[2]?.isActive,
        types: newData?.[2],
      });
    }
    setSocialLinks([
      {
        id: 1,
        name: 'linkedin',
        isActive: pageData?.isLinkedinLinkActive,
        isChecked: false,
        link: pageData?.linkedinLink,
        placeholder: 'Paste Linkedin profile URL',
      },
      {
        id: 2,
        name: 'instagram',
        isActive: pageData?.isInstagramLinkActive,
        isChecked: false,
        link: pageData?.instagramLink,
        placeholder: 'Paste Instagram profile URL',
      },
      {
        id: 3,
        name: 'twitter',
        isActive: pageData?.isTwitterLinkActive,
        isChecked: false,
        link: pageData?.twitterLink,
        placeholder: 'Paste X profile URL',
      },
      {
        id: 4,
        name: 'tiktok',
        isActive: pageData?.isTiktokLinkActive,
        isChecked: false,
        link: pageData?.tiktokLink,
        placeholder: 'Paste TikTok profile URL',
      },
    ]);
  }, [pageData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInputChange = (
    e: any,
    fieldName:
      | 'name'
      | 'location'
      | 'profession'
      | 'educations'
      | 'memberships',
    maxChars: number,
    i?: number,
  ) => {
    const { value } = e.target;
    if (value.length <= maxChars - 1) {
      setValue(fieldName, value, { shouldDirty: true });
      setError(fieldName, {
        type: 'text',
        message: '',
      });
    } else {
      if (i || i === 0) {
        const array: any = [];
        array[i] = {
          name: {
            message: `The ${fieldName} ${fieldName === 'educations' ? '& accreditations' : ''} cannot be longer than ${maxChars} characters.`,
          },
        };
        setError(fieldName, array);
      } else {
        setError(fieldName, {
          type: 'max',
          message: `The ${fieldName} cannot be longer than ${maxChars} characters.`,
        });
      }
    }
  };

  useEffect(() => {
    const video = videoThumbRef.current;

    if (video) {
      video.play(); // Start autoplay
      const timeout = setTimeout(() => {
        video.pause(); // Stop the video after 0.1 seconds
      }, 100); // 0.1 seconds = 100ms
      return () => clearTimeout(timeout);
    }
  }, [videoFile]);

  return (
    <div className={cn(styles.wrapper,{[styles.wrapperWithUpgradeBanner]: !pageData?.isSubscribed || pageData?.paidStatus !== PaidStatus.Paid})}>
      <span className={styles.title}>My page</span>
      <div className={styles.line}></div>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        <Banner
          className={cn(styles.banner, {[styles.bannerWithUpgrade]: !currentUser?.isSubscribed || currentUser.paidStatus !==PaidStatus.Paid})}
          firstLabel={'Your page:'}
          firstButtonLabel={'Save'}
          secondButtonLabel={'Share'}
          secondButtonIcon={'share'}
          firstButtonDisabled={!isDirty && !changed}
          firstButtonVariant={'quaternary'}
          firstButtonLoading={saveButtonLoading}
          secondLabel={`offloadweb.co/${pageData?.username}`}
          handlerSecondButton={onShareHandler}
        />
        <i className={cn('icon-plus', styles.closeIcon)} onClick={onBack}></i>
        <div className={styles.topBlock}>
          <div className={styles.leftSide}>
            <div className={styles.block}>
              <span className={styles.label}>Profile photo</span>
              <div className={styles.avatarWrapper}>
                <Avatar
                  photoUrl={
                    image ? image : pageData?.image ? pageData?.image : ''
                  }
                />
                <Upload
                  className={styles.avatarUpload}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleAvatarChange(e)
                  }
                />
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.label}>Name</span>
              <Input
                className={styles.shortInput}
                variant={'secondary'}
                placeholder={'Name'}
                {...register(EDIT_PAGE_FORM_FIELDS.NAME)}
                maxLength={26}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInputChange(e, 'name', 26);
                }}
                errorMessage={errors[EDIT_PAGE_FORM_FIELDS.NAME]?.message}
              />
            </div>

            <div className={styles.block}>
              <span className={styles.label}>Location</span>
              <Input
                className={styles.shortInput}
                variant={'secondary'}
                placeholder={'Town & part of postcode e.g. London NW1'}
                {...register(EDIT_PAGE_FORM_FIELDS.LOCATION)}
                maxLength={36}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInputChange(e, 'location', 36);
                }}
                errorMessage={errors[EDIT_PAGE_FORM_FIELDS.LOCATION]?.message}
              />
            </div>

            <div className={styles.block}>
              <span className={styles.label}>Social links</span>
              <div className={styles.socialWrapper}>
                {socialLinks.map((item) => {
                  return (
                    <Badge
                      key={item.name}
                      id={item.id}
                      className={cn(styles.badge, {
                        [styles.checkedBadge]: item.isChecked,
                      })}
                      icon={item.name}
                      isActive={item?.isActive}
                      onClick={() => onClickLinkBadge(item.id)}
                    />
                  );
                })}
              </div>
              <div className={styles.linksWrapper}>
                {socialLinks.map((item) => {
                  const fieldName = item?.name && item?.name?.toUpperCase();
                  const fieldKey =
                    fieldName as keyof typeof EDIT_PAGE_FORM_FIELDS;
                  if (item.isChecked) {
                    return (
                      <div key={item.id} className={styles.linkRow}>
                        <Input
                          variant={'secondary'}
                          className={styles.linkInput}
                          placeholder={item.placeholder}
                          {...register(EDIT_PAGE_FORM_FIELDS[fieldKey])}
                        />
                        <Switch
                          value={item?.isActive}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            onChangeLinkSwitch(e, item.id);
                          }}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.label}>Profession</span>
              <Input
                className={styles.shortInput}
                variant={'secondary'}
                placeholder={'E.g. Psychotherapist or Psychologist'}
                {...register(EDIT_PAGE_FORM_FIELDS.PROFESSION)}
                maxLength={36}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInputChange(e, 'profession', 36);
                }}
                errorMessage={errors[EDIT_PAGE_FORM_FIELDS.PROFESSION]?.message}
              />
            </div>

            <div className={styles.block}>
              <div className={styles.shortBioTop}>
                <span className={styles.label}>Short Bio</span>
                <span className={styles.label6}>{shortBioLength}/98</span>
              </div>
              <Textarea
                placeholder={'Add short bio'}
                className={styles.shortBio}
                maxLength={98}
                {...register(EDIT_PAGE_FORM_FIELDS.SHORT_BIO)}
              />
            </div>

            <div className={styles.block}>
              <span className={styles.label2}>
                <span className={styles.label}>Specialities</span> - add up to 6
              </span>
              <div className={styles.badgesWrapper}>
                <div className={styles.addNew} onClick={onAddNewSpeciality}>
                  <i className={'icon-plus'} />
                  <span className={styles.addLabel}>Add New</span>
                </div>
                {specialities?.map((spec) => {
                  return (
                    <Badge
                      key={spec.uuid}
                      id={spec.id}
                      label={spec.name}
                      isActive={isActiveSpecialities?.includes(spec.id)}
                      onClick={() => {
                        onClickSpecBadge(spec.id);
                      }}
                    />
                  );
                })}
                {pageData?.customSpecialities?.map((spec) => {
                  return (
                    <Badge
                      key={spec.uuid}
                      id={spec.id}
                      label={spec.name}
                      isActive={isActiveCustomSpecialities?.includes(spec.id)}
                      onClick={() => {
                        onClickCustomSpecBadge(spec.id);
                      }}
                    />
                  );
                })}
                {newSpecialities.map((item) => {
                  return (
                    <Badge
                      key={item?.id}
                      id={item?.id}
                      label={item?.label}
                      isActive={isActiveCustomSpecialities?.includes(item?.id)}
                      onClick={() => {
                        onClickCustomSpecBadge(item?.id);
                      }}
                    />
                  );
                })}
                {newSpecInputShow && (
                  <div className={styles.newInputWrapper}>
                    <Input
                      variant={'secondary'}
                      className={styles.newSpecInput}
                      placeholder={'Type speciality'}
                      maxLength={26}
                      {...register(EDIT_PAGE_FORM_FIELDS.NEW_SPECIALITY)}
                    />
                    <Badge
                      id={specialities.length + 1}
                      icon={'check'}
                      onClick={onClickSpecCheck}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.rightSide}>
            <span className={styles.label7}>Bookings</span>
            <Controller
              control={control}
              name={EDIT_PAGE_FORM_FIELDS.CONSULTATION}
              render={({ field: { value, onChange } }) => {
                return (
                  <BookingEditCard
                    type={'consultation'}
                    value={value}
                    data={pageData}
                    onChange={onChange}
                    setChanged={setChanged}
                    setIsError={setIsError}
                  />
                );
              }}
            />

            {/*<Controller*/}
            {/*  control={control}*/}
            {/*  name={EDIT_PAGE_FORM_FIELDS.SESSION}*/}
            {/*  render={({ field: { value, onChange } }) => {*/}
            {/*    return (*/}
            {/*      <BookingEditCard*/}
            {/*        type={'session'}*/}
            {/*        value={value}*/}
            {/*        data={pageData}*/}
            {/*        onChange={onChange}*/}
            {/*        setChanged={setChanged}*/}
            {/*        setIsError={setIsError}*/}
            {/*      />*/}
            {/*    );*/}
            {/*  }}*/}
            {/*/>*/}
            <div className={styles.timezonesLabels}>
              <span className={styles.timezoneLabels}>Consultations work for UK timezones only.</span>
              <span className={styles.timezoneLabels}>More timezones coming soon.</span>
            </div>
          </div>
        </div>

        <div className={styles.block}>
          <span className={styles.label}>Videos and Images</span>
          <span className={styles.label5}>
            Add intro videos (up to 90 seconds) and images to introduce
            yourself. They will be cropped automatically - square and centred
            works best.
          </span>
          <div className={styles.uploadWrapper}>
            <div className={styles.uploadMain}>
              {uploadBlocks.map((item, idx) => {
                const accept = item.type === 'video' ? 'video/*' : 'image/*';
                return (
                  <div key={item.id} className={styles.uploadBlock}>
                    <Upload
                      className={cn(styles.upload, {
                        [styles.uploaded]: item?.uploaded,
                      })}
                      accept={accept}
                      onChange={(e) => {
                        handleFileChange(e, item.type, item.id);
                      }}
                    />

                    {!item?.uploaded && (
                      <>
                        {item.type === 'video' ? (
                          <i className={cn('icon-video', styles.icon)} />
                        ) : (
                          <i className={cn('icon-image', styles.icon)} />
                        )}
                      </>
                    )}

                    {item?.uploaded && item.type === 'video' && (
                      <div
                        className={styles.playWrapper}
                        onClick={() => handlePlay(item.id)}
                      >
                        <i className={cn('icon-play', styles.playIcon)} />
                      </div>
                    )}

                    {item?.uploaded && (
                      <div
                        className={styles.binWrapper}
                        onClick={() => {
                          onDeleteUploaded(item.id);
                        }}
                      >
                        <i className={'icon-bin'} />
                      </div>
                    )}
                    {isIphone() &&
                      isMobileScreen &&
                      idx === 0 &&
                      videoUrl &&
                      videoFile && (
                        <div className={styles.videoThumbWrapper}>
                          <video
                            ref={videoThumbRef}
                            autoPlay
                            className={styles.videoThumbnail}
                            muted
                            playsInline
                          >
                            <source
                              src={videoUrl ? videoUrl : ''}
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    {item?.uploaded &&
                      item.type === 'video' &&
                      !item.imageSrc && (
                        <div className={styles.videoThumbWrapper}>
                          <video
                            ref={videoRef}
                            playsInline
                            className={styles.video2}
                            autoPlay
                          >
                            <source
                              src={videoUrl ? videoUrl : ''}
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    {item?.imageSrc && (
                      <img
                        onClick={() => {
                          handlePlay(item.id);
                        }}
                        className={styles.capturedImage}
                        src={item?.imageSrc}
                        alt=""
                        style={{ maxWidth: '100%' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.block}>
          <div className={styles.fullBioTop}>
            <span className={styles.label}>Full Bio</span>
            <span className={styles.label6}>{fullBioLength}/1500</span>
          </div>
          <Textarea
            placeholder={'Add full biography'}
            className={styles.fullBio}
            maxLength={1500}
            {...register(EDIT_PAGE_FORM_FIELDS.FULL_BIO)}
          />
        </div>

        <div className={styles.block}>
          <span className={styles.label2}>
            <span className={styles.label}>Education & Accreditations</span> -
            add up to 3
          </span>
          <div className={styles.inputsWrapper}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.inputRow}>
                <span className={styles.dot}></span>
                <Input
                  className={styles.longInput}
                  variant={'secondary'}
                  placeholder={'E.g. MSc, DClinPsy etc'}
                  {...register(
                    `${EDIT_PAGE_FORM_FIELDS.EDUCATION_ACCREDITATIONS}.${index}.name`,
                  )}
                  maxLength={67}
                  // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  //   handleInputChange(e, 'educations', 66, index);
                  // }}
                  errorMessage={
                    errors[EDIT_PAGE_FORM_FIELDS.EDUCATION_ACCREDITATIONS]?.[
                      index
                    ]?.name?.message
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <span className={styles.label2}>
            <span className={styles.label}>Memberships</span> - add up to 3
          </span>
          <div className={styles.inputsWrapper}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.inputRow}>
                <span className={styles.dot}></span>
                <Input
                  className={styles.longInput}
                  variant={'secondary'}
                  placeholder={'E.g. UKCP, HCPC etc'}
                  {...register(
                    `${EDIT_PAGE_FORM_FIELDS.MEMBERSHIPS}.${index}.name`,
                  )}
                  maxLength={67}
                  // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  //   handleInputChange(e, 'memberships', 66, index);
                  // }}
                  errorMessage={
                    errors[EDIT_PAGE_FORM_FIELDS.MEMBERSHIPS]?.[index]?.name
                      ?.message
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={feedbackModalHandler}
          className={styles.feedbackButton}
          variant={'tertiary'}
          label={'Send Feedback'}
        />
      </form>

      {shareShow && (
        <AppModal width={389} {...modalHandlers}>
          <ShareModal
            setShareShow={setShareShow}
            link={!!pageData?.username ? pageData.username : ''}
          />
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
            <source src={videoUrl ? videoUrl : ''} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </AppModal>
      )}
      {videoUrl && isMobileScreen && (
        <video ref={videoRef} playsInline className={styles.videoFull}>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};
export default EditPage;
