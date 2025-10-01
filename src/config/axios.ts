import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

axiosInstance.interceptors.request.use((request) => {
  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('ACCESS_TOKEN') : null;

  if (accessToken) {
    request.headers.Authorization = `${accessToken}`;
  }

  // request.headers['Content-Type'] = 'multipart/form-data';

  const userAccessToken =
    typeof window !== 'undefined' ? localStorage.getItem('ACCESS_TOKEN') : null;

  if (userAccessToken) {
    request.headers['X-API-TOKEN'] = `${userAccessToken}`;
  }

  return request;
});

const refreshToken = async () => {
  try {
    const rToken = localStorage.getItem('REFRESH_TOKEN');
    if (!rToken) {
      window.dispatchEvent(new CustomEvent('user_logout'));
    }

    const response = await axios.post(
      `${process.env.VITE_APP_API_URL}/user/refresh/token`,
      { refreshToken: rToken },
    );
    const { token, refreshToken: newRefreshToken } =
      response.data?.result || {};

    localStorage.setItem('ACCESS_TOKEN', token);
    localStorage.setItem('REFRESH_TOKEN', newRefreshToken);

    return token;
  } catch (error) {
    // toast.error('Session expired. Please log in again.');
    // localStorage.clear()
    // window.location.reload();
    window.dispatchEvent(new CustomEvent('user_logout'));
    throw error;
  }
};

axiosInstance.interceptors.response.use(
  async (response) => {
    const isTokenInvalid =
      response.data && response.data.errorCode === 'USER_UNAUTHORIZED';
    const originalRequest: any = response.config;

    if (isTokenInvalid && !originalRequest.retry) {
      originalRequest.retry = true;

      try {
        const newAccessToken = await refreshToken();
        if (!newAccessToken) {
          window.dispatchEvent(new CustomEvent('user_logout'));
        }

        originalRequest.headers['X-API-TOKEN'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    if (response.data && typeof response.data.status !== 'undefined') {
      if (response.data.status) {
        return response;
      }
      if (response.data.errorCode === 'USER_UNAUTHORIZED') {
        window.dispatchEvent(new CustomEvent('user_logout'));
        return Promise.reject();
      }
      const errorMessage = response.data.message || 'Unknown error';
      if (
        errorMessage !== 'Go to verification' &&
        errorMessage !== 'That username is already taken' &&
        errorMessage !== 'invitation not found by code'
      ) {
        toast.error(errorMessage);
      }
      throw new Error(errorMessage);
    }
    return response;
  },
  (error) => {
    console.log('Axios Response Error', error)
    if (error.response) {
      if (error.response.status === 401) {
        toast.error('Unauthorized - Please log in again');
        localStorage.clear();
        window.location.reload();
        window.dispatchEvent(new Event('user_logout'));
      }
    } else {
      // toast.error('An error occurred. Please try again.');
      // localStorage.clear();
      // window.location.reload();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
