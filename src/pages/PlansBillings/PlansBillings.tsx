import styles from './PlansBillings.module.scss';
import Logo from '@assets/svg/logo.svg';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import {
  PaidStatus,
  PaymentTerm,
  Plans_Card_Types,
  PlansButtons,
  PlansData,
  PlansInterval,
} from '@constants/plans.ts';
import { Button } from '@shared/ui';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  RoutesEnum,
  THERAPIST_PRIVATE_BASE_URL,
} from '@routes/Routes.types.ts';
import { useProfileStore } from '@store/profile.ts';
import {
  createSubscription,
  getPortalLink,
  getSubscriptionPlans,
} from '@api/stripe.ts';
import { OwnerCalendlyLink } from '@utils/helpers.ts';

const PlansBillings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const getCurrentUser = useProfileStore((state) => state.getCurrentUser);
  const currentUser = useProfileStore((state) => state.currentUser);
  const [plansData, setPlansData] = useState(PlansData);
  const [subscriptionPlans, setSubscriptionPlans] = useState<null | any[]>(
    null,
  );
  const fromOnboarding = localStorage.getItem('fromOnboarding');
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [loading, setLoading] = useState({
    [Plans_Card_Types.Monthly]: false,
    [Plans_Card_Types.Yearly]: false,
    [Plans_Card_Types.Contact_Us]: false,
  });
  const queryParams = new URLSearchParams(location.search);
  const subscriptionUpdated = queryParams.get('subscriptionUpdated');

  const onClose = () => {
    if (fromOnboarding === 'yes') {
      navigate(`${THERAPIST_PRIVATE_BASE_URL}/${RoutesEnum.THERAPIST_HOME}`);
      localStorage.removeItem('fromOnboarding');
    } else {
      const location = localStorage.getItem('toSubscription');
      if (location) {
        navigate(location);
        localStorage.removeItem('toSubscription');
      }
    }
  };

  const buttonLabelMapper = (type: number): string => {
    const isActiveSubscription =
      currentUser?.paidStatus === PaidStatus.Paid &&
      currentUser?.isSubscribed &&
      (type === Plans_Card_Types.Monthly
        ? currentUser?.paymentTerm === PaymentTerm.Monthly
        : currentUser?.paymentTerm === PaymentTerm.Annual);

    switch (type) {
      case Plans_Card_Types.Contact_Us:
        return 'Contact Us';
      case Plans_Card_Types.Monthly:
      case Plans_Card_Types.Yearly:
        return isActiveSubscription ? 'Active' : 'Upgrade';
      default:
        return 'Upgrade';
    }
  };

  const buttonLoadingMapper = (type: number) => {
    if (type === PaymentTerm.Monthly) {
      setLoading((prev) => ({
        ...prev,
        [Plans_Card_Types.Monthly]: true,
        [Plans_Card_Types.Yearly]: false,
      }));
    } else if (type === Plans_Card_Types.Yearly) {
      setLoading((prev) => ({
        ...prev,
        [Plans_Card_Types.Monthly]: false,
        [Plans_Card_Types.Yearly]: true,
      }));
    } else {
      setLoading({
        [Plans_Card_Types.Monthly]: false,
        [Plans_Card_Types.Yearly]: false,
        [Plans_Card_Types.Contact_Us]: false,
      });
    }
  };

  const onBillingClick = async () => {
    setLoadingBilling(true);
    await getPortalLink().then((res: any) => {
      if (res.result) {
        window.open(res.result, '_self');
      }
    });
    // if (
    //   currentUser?.isSubscribed &&
    //   currentUser?.paidStatus === PaidStatus.Paid
    // ) {
    //   //Active Plan
    // } else {
    //   //No Active Plan
    // }
  };

  const cardAction = async (button: string, card: any) => {
    buttonLoadingMapper(card.id);

    if (button === PlansButtons['Contact Us']) {
      window.open(OwnerCalendlyLink, '_blank');
    } else if (button === PlansButtons.Active) {
      //Active Plan
      await getPortalLink().then((res: any) => {
        if (res.result) {
          window.open(res.result, '_self');
        }
      });
    } else {
      //Upgrade Plan
      const createSubscriptionBody = {
        priceID: card.stripePriceId,
        paymentTerm: card.id,
      };
      await createSubscription(createSubscriptionBody)
        .then((response: string) => {
          if (response) {
            window.open(response, '_self');
          }
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  };

  const mergePlansWithStripe = (plansData: any, stripeData: any) => {
    return plansData.map((plan: any) => {
      if (!plan.title || plan.title === 'Teams') {
        return plan;
      }

      const matchingStripeProduct = stripeData.find(
        (stripeProduct: any) =>
          stripeProduct.name.toLowerCase().trim() ===
          plan.title.toLowerCase().trim(),
      );

      if (
        matchingStripeProduct &&
        matchingStripeProduct.plans &&
        matchingStripeProduct.plans.length > 0
      ) {
        const stripePriceInCents =
          matchingStripeProduct.plans[0].interval === PlansInterval.Year
            ? Number(matchingStripeProduct.plans[0].amount) / 12
            : matchingStripeProduct.plans[0].amount;
        const stripePriceInDollars = Number(stripePriceInCents);

        return {
          ...plan,
          actualPrice: stripePriceInDollars,
          stripeProductId: matchingStripeProduct.id,
          stripePriceId: matchingStripeProduct.default_price,
          stripeInterval: matchingStripeProduct.plans[0].interval,
          stripeCurrency: matchingStripeProduct.plans[0].currency,
        };
      }

      return plan;
    });
  };

  useEffect(() => {
    getCurrentUser();
    getSubscriptionPlans().then((res: any) => {
      if (res.result) {
        setSubscriptionPlans(res.result);
      }
    });
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (subscriptionPlans && subscriptionPlans?.length > 0) {
      const updatedPlansData = mergePlansWithStripe(
        PlansData,
        subscriptionPlans,
      );

      if (isMobileScreen) {
        setPlansData([
          updatedPlansData[1],
          updatedPlansData[0],
          ...updatedPlansData.slice(2),
        ]);
      } else {
        setPlansData(updatedPlansData);
      }
    }
  }, [isMobileScreen, subscriptionPlans]);

  useEffect(() => {
    if (currentUser && subscriptionUpdated) {
      localStorage.setItem('user', JSON.stringify(currentUser));
      setTimeout(() => {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.has('subscriptionUpdated')) {
          urlParams.delete('subscriptionUpdated');
          const newSearch = urlParams.toString();
          navigate(
            {
              pathname: location.pathname,
              search: newSearch ? `?${newSearch}` : '',
            },
            { replace: true },
          );
        }
      }, 100);
    }
  }, [currentUser, subscriptionUpdated]);

  return (
    <div className={styles.plansWrapper}>
      <div className={styles.header}>
        <img src={Logo} alt="Logo" />
        <span className={styles.title}>Offload</span>
      </div>
      <div className={styles.plansMain}>
        <div
          className={cn(styles.mainHeader, {
            [styles.fromOnboarding]: fromOnboarding,
          })}
        >
          <span className={styles.subtitle}>Choose the plan for you</span>
          <i className={cn('icon-plus', styles.closeIcon)} onClick={onClose} />
        </div>
        {!fromOnboarding && (
          <div className={styles.billingMain}>
            <div
              className={cn(styles.billingWrapper, {
                [styles.disabled]: loadingBilling,
              })}
              onClick={onBillingClick}
            >
              <span>Billing</span>
              <i className={cn('icon-right-arrow', styles.arrow)}></i>
            </div>
          </div>
        )}
        <div className={styles.cardsWrapper}>
          {plansData.map((card) => (
            <div className={styles.planCardWrapper}>
              {card.id === Plans_Card_Types.Yearly && (
                <div className={styles.greenBox}>
                  <span>Limited Time Launch Offer 🚀</span>
                </div>
              )}
              <span className={styles.cardTitle}>{card.title}</span>
              {card.id !== Plans_Card_Types.Contact_Us && (
                <div className={styles.priceRow}>
                  {card.price && (
                    <del className={cn(styles.price, styles.notActualPrice)}>
                      ${card.price}
                    </del>
                  )}
                  {card.actualPrice && (
                    <span className={styles.price}>${card.actualPrice}</span>
                  )}
                  {(card.id === Plans_Card_Types.Monthly ||
                    card.id === Plans_Card_Types.Yearly) && (
                    <span className={styles.monthLabel}>/ month</span>
                  )}
                </div>
              )}
              {card.subtitle && (
                <span className={styles.cardSubtitle}>{card.subtitle}</span>
              )}
              <span>{card.infoText}</span>
              <Button
                isLoading={loading[card.id]}
                fullWidth
                className={styles.button}
                label={buttonLabelMapper(card.id)}
                onClick={() => {
                  cardAction(buttonLabelMapper(card.id), card);
                }}
              />
              <div className={styles.includeWrapper}>
                {card.includingData.map((item) => (
                  <div className={styles.includeRow}>
                    <i className={cn('icon-check', styles.checkIcon)}></i>
                    <span className={styles.includeLabel}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PlansBillings;
