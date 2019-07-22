import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwtDecode from 'jwt-decode'
import axios from 'axios'
const SERVER_URL = window.SERVER_URL

export default function useLogin() {
  const [cookies] = useCookies();
  const [meData, setMeData] = useState()
  const [status, setStatus] = useState('pending')
  useEffect(() => {
    let hasToken = false
    if (cookies.token) {
      if (jwtDecode(cookies.token).exp > Date.now() / 1000) {
        hasToken = true
      }
    }
    if (hasToken) {
      let url = SERVER_URL + '/api/me'
      axios.get(url, {
        withCredentials: true
      }).then(res => {
        console.log(res.data)
        setMeData(res.data)
        setStatus('ok')
      }).catch(err => {
        setStatus('error')
        if (err.response) console.log(err.response.data)
      })
    }else{
      setStatus('no')
    }
  }, [cookies.token])

  return {meData, status}
}