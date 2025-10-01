import { Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
  USER_PUBLIC_BASE_URL, USER_PUBLIC_URL,
} from '@routes/Routes.types.ts';
import {AuthLayout, PublicLayout} from '@app/layouts';
import { USER_TYPES } from '@constants/user.ts';
import ViewLayout from '@app/layouts/Viewlayout';
import {publicRoutes, userPublicRoutes, viewPublicRoutes} from '@routes/Routes.data.tsx';

export const PublicRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');

    if (user && user.type === USER_TYPES.THERAPIST) {
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`);
    }
    if (user && user.type === USER_TYPES.CLIENT) {
      navigate(`${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_HOME}`);
    }
  }, [navigate]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path=""
            element={
              <Navigate
                replace
                to={`${USER_PUBLIC_URL}/${RoutesEnum.CARE}`}
              />
            }
          />
          {publicRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route
            path="*"
            element={
              <Navigate
                replace
                to={`${USER_PUBLIC_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`}
              />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};


export const UserPublicRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');

    if (user && user.type === USER_TYPES.THERAPIST) {
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`);
    }
    if (user && user.type === USER_TYPES.CLIENT) {
      navigate(`${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_HOME}`);
    }
  }, [navigate]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path=""
            element={
              <Navigate
                replace
                to={`${USER_PUBLIC_BASE_URL}/${RoutesEnum.LOGIN}`}
              />
            }
          />
          {userPublicRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route
            path="*"
            element={
              <Navigate
                replace
                to={`${USER_PUBLIC_BASE_URL}/${RoutesEnum.LOGIN}`}
              />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export const ViewPublicRoutes = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<ViewLayout />}>
          {viewPublicRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
};
