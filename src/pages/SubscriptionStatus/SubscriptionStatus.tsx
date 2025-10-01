import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useProfileStore } from '@store/profile.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import { SubscriptionStatusTypes } from '@pages/SubscriptionStatus/SubscriptionStatus.constants.ts';
import { PaidStatus } from '@constants/plans.ts';

const SubscriptionStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const getCurrentUser = useProfileStore((state) => state.getCurrentUser);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    if (status === SubscriptionStatusTypes.Success) {
      getCurrentUser()
        .then((res) => {
          if (res.status && res.result.paidStatus === PaidStatus.Paid) {
            localStorage.setItem('user', JSON.stringify(res.result));
            setTimeout(() => {
              const location = localStorage.getItem('toSubscription');
              if (location) {
                navigate(location);
                localStorage.removeItem('toSubscription');
              }
            }, 2000);
          }
        })
        .catch(() => {
          setTimeout(() => {
            const location = localStorage.getItem('toSubscription');
            if (location) {
              navigate(location);
              localStorage.removeItem('toSubscription');
            }
          }, 2000);
        });

      toast.success('Welcome to Offload Pro!', {
        style: { width: 335 },
        duration: 4000,
      });
    } else if (status === SubscriptionStatusTypes.Failed) {
      getCurrentUser();
      toast.success('Something went wrong!, Please try again.', {
        style: { width: 335, backgroundColor: 'red' },
      });
    }
  }, [location]);

  // useEffect(() => {
  //   if (currentUser) {
  //     localStorage.setItem('user', JSON.stringify(currentUser));
  //     setTimeout(() => {
  //       navigate(-4);
  //     }, 2000);
  //   }
  // }, [currentUser]);

  return (
    <div>
      <Toaster
        toastOptions={{
          icon: null,
          position: 'top-center',
          duration: 2000,
          success: {
            style: {
              background: '#11CE51',
            },
          },
          error: {
            style: {
              background: '#FF3A3A',
            },
          },
        }}
      />
    </div>
  );
};
export default SubscriptionStatus;
