import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  PublicRoutes,
  UserPublicRoutes,
  ViewPublicRoutes,
} from '@routes/PublicRoutes.tsx';
import {
  ClientPrivateRoutes,
  TherapistPrivateRoutes,
} from '@routes/PrivateRoutes.tsx';
import {
  CALL_BASE_URL,
  CHECKIN_PUBLIC_BASE_URL,
  CLIENT_PRIVATE_BASE_URL,
  CONNECT_GOOGLE,
  CONNECT_STRIPE,
  EXERCISE_PUBLIC_BASE_URL,
  PLANS_AND_BILLINGS, SUBSCRIPTION_STATUS,
  THERAPIST_PRIVATE_BASE_URL,
  USER_PUBLIC_BASE_URL,
  USER_PUBLIC_URL,
  VIEW_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import { Call, PlansBillings } from '@pages/index.ts';
import StripeConnecting from '@pages/StripeConnecting/StripeConnecting.tsx';
import GoogleConnecting from '@pages/GoogleConnecting/GoogleConnecting.tsx';
import { CheckinLayout, ExerciseLayout } from '@app/layouts';
import SubscriptionStatus from '@pages/SubscriptionStatus/SubscriptionStatus.tsx';

const Routing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('scrollPosition');
    if (location.pathname === '/') {
      navigate('public');
    }
  }, [location.pathname]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path={`${USER_PUBLIC_URL}/*`} element={<PublicRoutes />} />
        <Route
          path={`${USER_PUBLIC_BASE_URL}/*`}
          element={<UserPublicRoutes />}
        />
        <Route
          path={`${THERAPIST_PRIVATE_BASE_URL}/*`}
          element={<TherapistPrivateRoutes />}
        />
        <Route
          path={`${CLIENT_PRIVATE_BASE_URL}/*`}
          element={<ClientPrivateRoutes />}
        />
        <Route
          path={`${VIEW_PUBLIC_BASE_URL}*`}
          element={<ViewPublicRoutes />}
        />
        <Route path={`${CALL_BASE_URL}/:channelName`} element={<Call />} />
        <Route
          path={`${EXERCISE_PUBLIC_BASE_URL}/:uuid`}
          element={<ExerciseLayout />}
        />
        <Route
          path={`${CHECKIN_PUBLIC_BASE_URL}`}
          element={<CheckinLayout />}
        />
        <Route path={`${CONNECT_STRIPE}`} element={<StripeConnecting />} />
        <Route path={`${CONNECT_GOOGLE}`} element={<GoogleConnecting />} />
        <Route path={`${PLANS_AND_BILLINGS}`} element={<PlansBillings />} />
        <Route path={`${SUBSCRIPTION_STATUS}`} element={<SubscriptionStatus />} />
      </Routes>
    </Suspense>
  );
};

export default Routing;
