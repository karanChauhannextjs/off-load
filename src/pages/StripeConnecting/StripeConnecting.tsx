import {LoadingScreen} from "@pages/index.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {useStripeStore} from "@store/stripe.ts";

const StripeConnecting = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string>("");
  const location = useLocation();

  const connectStripe = useStripeStore(state=>state.connectStripe)
  const connectStripeStatus = useStripeStore(state=>state.connectStripeStatus)

  useEffect(() => {
    const queryString = location?.search
    const cleanedQueryString = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    const params = new URLSearchParams(cleanedQueryString);
    const code = params.get('code');
    const error = params.get('error');
    if(error){
      navigate('/therapist/account')
    }
    if(code){
      setCode(code)
    }
  }, [location]);

  useEffect(() => {
    if(code)
    connectStripe(code)
  }, [code]);

  useEffect(() => {
    if(connectStripeStatus === 'SUCCESS'){
      navigate('/therapist/account')
    }
  }, [connectStripeStatus]);

  return (
    <div>
      <div>Stripe connection...</div>
      <LoadingScreen/>
    </div>
  )
}
export default StripeConnecting