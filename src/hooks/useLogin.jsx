import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwtDecode from 'jwt-decode'
import {fetchData} from '../utility'

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
      const path = '/me'
      fetchData(path).then(res => {
        setMeData(res.data)
        setStatus('ok')
      }).catch(err => {
        setStatus('error')
      })
    }else{
      setStatus('no')
    }
  }, [cookies.token])

  return {meData, status}
}