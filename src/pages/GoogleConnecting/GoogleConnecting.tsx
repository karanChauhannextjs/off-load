import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {LoadingScreen} from "@pages/index.ts";
import {googleCode} from "@api/google.ts";
import toast from "react-hot-toast";

const GoogleConnecting = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string>("");
  const location = useLocation();


  useEffect(() => {
    const queryString = location?.search
    const cleanedQueryString = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    const params = new URLSearchParams(cleanedQueryString);
    const code = params.get('code');
    const error = params.get('error');
    if(error){
      navigate('/')
    }
    if(code){
      setCode(code)
    }
  }, [location]);


  useEffect(() => {
    if(!!code){
      googleCode({code})
        .then((res:any)=>{
          if(res){
            localStorage.setItem('user', JSON.stringify(res))
            navigate('/therapist/availability')
            toast.success('Calendar connected')
          }
        })
    }
  }, [code]);

  return (
    <div>
      <div>Google connection...</div>
      <LoadingScreen/>
    </div>
  )
}
export default GoogleConnecting