import { useEffect, useState } from "react";
import queryString from 'query-string'
import axios from 'axios'
import { isWx } from '../utility'
import { useCookies } from 'react-cookie';

const SERVER_URL = window.SERVER_URL
const COOKIE_DOMAIN = window.COOKIE_DOMAIN

export default function useWxLogin(location) {
  const [state, setState] = useState('none');
  // eslint-disable-next-line
  const [cookies, setCookie] = useCookies([]);

  useEffect(() => {
    const values = queryString.parse(location.search)
    if (values.code) {
      setState('pending')
      let url = `${SERVER_URL}/api/wechat/auth`
      let params = {
        wxcode: values.code,
        wxtype: isWx()?'gz':'kf'
      }
      axios.get(url, {
        params: params
      }).then(res => {
        console.log(res.data)
        setCookie('token', res.data.token, { path: '/', domain:COOKIE_DOMAIN});
        setState('ok')
      }).catch(err => {
        if (err.response) console.log(err.response.data)
        setState('error')
      })
    } else {
      setState('ok')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};