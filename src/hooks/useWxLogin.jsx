import { useEffect, useState } from "react";
import queryString from 'query-string'
import axios from 'axios'
import cookie from 'react-cookies'

const DOMAIN_URL = window.DOMAIN_URL
export default function useWxLogin(props) {
  const [state, setState] = useState('pending');

  useEffect(() => {
    const values = queryString.parse(props.location.search)
    if (values.code) {
      axios.get(`${DOMAIN_URL}/api/token`, {
        params: {
          wxcode: values.code
        }
      }).then(res => {
        console.log(res.data)
        cookie.save('token', res.data.token)
        setState('ok')
      }).catch(err => {
        if (err.response) console.log(err.response.data)
        setState('error')
      })
    }else{
      setState('ok')
    }
  }, [props]);

  return state;
};