import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import {
  IResultResponse,
  NonFunctionKeys,
  Status,
  SuccessResponse,
} from '@models/index.ts';
import {
  IBodyBioVideos, IBodyShareControl,
  IBodyUpdateProfile,
  IProfile,
} from '@models/profile.ts';
import {
  getProfile, getTherapistData, shareClientOffloads,
  updateProfile,
  uploadProfileBioImages,
  uploadProfileBioVideos,
  uploadProfilePicture,
} from '@api/profile.ts';

interface Store {
  getProfile: () => Promise<IResultResponse<IProfile>>;
  profile: IProfile;
  getProfilesStatus: Status;

  getCurrentUser: () => Promise<IResultResponse<IProfile>>;
  currentUser: IProfile;

  getTherapist: (username: string) => Promise<IResultResponse<IProfile>>;
  therapistData: IProfile;
  getTherapistDataStatus: Status;

  updateProfile: (body: IBodyUpdateProfile) => Promise<IProfile>;
  updateProfileStatus: Status;

  uploadProfilePicture: (file: File) => Promise<SuccessResponse>;
  uploadProfilePictureStatus: Status;

  uploadProfileBioImages: (
    file: FormData,
    isNew: boolean,
  ) => Promise<SuccessResponse>;
  uploadProfileBioImagesStatus: Status;

  uploadProfileBioVideos: (file: IBodyBioVideos) => Promise<SuccessResponse>;
  uploadProfileBioVideosStatus: Status;

  shareClientOffloads: (body: IBodyShareControl) => Promise<SuccessResponse>;
  shareClientOffloadsStatus: Status;

  reset: () => void;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  profile: null,

  currentUser: null,

  getProfilesStatus: 'IDLE',

  therapistData: null,

  updateProfileStatus: 'IDLE',

  getTherapistDataStatus: 'IDLE',

  shareClientOffloadsStatus: 'IDLE',

  uploadProfilePictureStatus: 'IDLE',

  uploadProfileBioImagesStatus: 'IDLE',

  uploadProfileBioVideosStatus: 'IDLE',
};

export const useProfileStore = create(
  immer<Store>((set) => ({
    ...initialState,
    getProfile: async () => {
      try {
        set({ getProfilesStatus: 'LOADING' });
        const result = await getProfile();
        set({ profile: result.result });
        set({ getProfilesStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getProfilesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getCurrentUser: async () => {
      try {
        const result = await getProfile();
        set({ currentUser: result.result });
        return result;
      } catch (e) {
        return Promise.reject(e);
      }
    },
    getTherapist: async (username: string) => {
      try {
        set({ getTherapistDataStatus: 'LOADING' });
        const result = await getTherapistData(username);
        set({ therapistData: result.result });
        set({ getTherapistDataStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getTherapistDataStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    updateProfile: async (body: IBodyUpdateProfile) => {
      try {
        set({ updateProfileStatus: 'LOADING' });
        const result = await updateProfile(body);
        set({ updateProfileStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ updateProfileStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    uploadProfilePicture: async (file: File) => {
      try {
        set({ uploadProfilePictureStatus: 'LOADING' });
        const result = await uploadProfilePicture(file);
        set({ uploadProfilePictureStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ updateProfileStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    uploadProfileBioImages: async (body: FormData, isNew: boolean) => {
      try {
        set({ uploadProfileBioImagesStatus: 'LOADING' });
        const result = await uploadProfileBioImages(body, isNew);
        set({ uploadProfileBioImagesStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ uploadProfileBioImagesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    uploadProfileBioVideos: async (body: IBodyBioVideos) => {
      try {
        set({ uploadProfileBioVideosStatus: 'LOADING' });
        const result = await uploadProfileBioVideos(body);
        set({ uploadProfileBioVideosStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ uploadProfileBioVideosStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    shareClientOffloads: async (body) => {
      try {
        set({ shareClientOffloadsStatus: 'LOADING' });
        const result = await shareClientOffloads(body);
        set({ shareClientOffloadsStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ shareClientOffloadsStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    reset: () => {
      set(initialState);
    },
  })),
);
