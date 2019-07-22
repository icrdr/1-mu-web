import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwtDecode from 'jwt-decode'
import axios from 'axios'
const SERVER_URL = window.SERVER_URL

export default function useLogin() {
  const [cookies] = useCookies();
  const [meData, setMeData] = useState()
  useEffect(() => {
    if (cookies.token) {
      if (jwtDecode(cookies.token).exp > Date.now() / 1000) {
        let url = SERVER_URL + '/api/me'
      axios.get(url, {
        withCredentials: true
      }).then(res => {
        console.log(res.data)
        setMeData(res.data)
      }).catch(err => {
        if (err.response) console.log(err.response.data)
      })
      }
    }
  }, [cookies.token])

  return meData
}