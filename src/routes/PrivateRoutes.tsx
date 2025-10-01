import { Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  CLIENT_PRIVATE_BASE_URL,
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
  USER_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import TherapistLayout from '@app/layouts/TherapistLayout';
import {
  clientPrivateRoutes,
  therapistPrivateRoutes,
} from '@routes/Routes.data.tsx';
import ClientLayout from '@app/layouts/ClientLayout';

export const TherapistPrivateRoutes = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('ACCESS_TOKEN');

  useEffect(() => {
    if (!token) {
      localStorage.clear();
      navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.LOGIN}`);
    }
  }, [navigate]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<TherapistLayout />}>
          <Route
            path="/"
            element={
              <Navigate
                replace
                to={`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`}
              />
            }
          />
          {therapistPrivateRoutes.map(({ path, Component }) => (
            <Route key={path} path={`${path}/*`} element={<Component />} />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
};

export const ClientPrivateRoutes = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('ACCESS_TOKEN');

  useEffect(() => {
    if (!token) {
      localStorage.clear();
      navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.LOGIN}`);
    }
  }, [navigate]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route
            path="/"
            element={
              <Navigate
                replace
                to={`${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_HOME}`}
              />
            }
          />
          {clientPrivateRoutes.map(({ path, Component }) => (
            <Route key={path} path={`${path}/*`} element={<Component />} />
          ))}
          <Route
            path="*"
            element={
              <Navigate
                replace
                to={`${CLIENT_PRIVATE_BASE_URL}/${RoutesEnum.CLIENT_HOME}`}
              />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};
