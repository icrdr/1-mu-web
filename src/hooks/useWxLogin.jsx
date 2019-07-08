import { useEffect, useState } from "react";
import queryString from 'query-string'
import axios from 'axios'
import cookie from 'react-cookies'
// import { isWx } from "../utility";

const DOMAIN_URL = window.DOMAIN_URL
const COOKIE_DOMAIN = window.COOKIE_DOMAIN

export default function useWxLogin(props) {
  const [state, setState] = useState('pending');

  useEffect(() => {
    const values = queryString.parse(props.location.search)
    if (values.code) {
      let url = `${DOMAIN_URL}/api/wechat/auth`
      let params = {
        wxcode: values.code,
        // wxtype: isWx() ? 'gz' : 'kf'
      }
      axios.get(url, {
        params: params
      }).then(res => {
        console.log(res.data)
        cookie.save('token', res.data.token, {
          domain: COOKIE_DOMAIN
        })
        setState('ok')
      }).catch(err => {
        if (err.response) console.log(err.response.data)
        setState('error')
      })
    } else {
      setState('ok')
    }
  }, [props]);

  return state;
};