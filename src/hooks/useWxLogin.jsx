import { useEffect, useState } from "react";
import queryString from 'query-string'
import { isWx, fetchData } from '../utility'
import { useCookies } from 'react-cookie';

const COOKIE_DOMAIN = window.COOKIE_DOMAIN

export default function useWxLogin(location) {
  const [state, setState] = useState('none');
  // eslint-disable-next-line
  const [cookies, setCookie] = useCookies([]);

  useEffect(() => {
    const values = queryString.parse(location.search)
    if (values.code) {
      setState('pending')
      const url = '/wechat/auth'
      const params = {
        wxcode: values.code,
        wxtype: isWx()?'gz':'kf'
      }
      fetchData(url, params).then(res => {
        setCookie('token', res.data.token, { path: '/', domain:COOKIE_DOMAIN});
        setState('ok')
      }).catch(err => {
        setState('error')
      })
    } else {
      setState('ok')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};