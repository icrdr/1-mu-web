import jwtDecode from 'jwt-decode'
import cookie from 'react-cookies'

export function hasToken(){
    const token = cookie.load('token')
    
    if (token) {
      if (jwtDecode(token).exp > Date.now() / 1000) {
        return true
      }
    }
    return false
}

export function isWx(){
  let ua = window.navigator.userAgent.toLowerCase();
  if(ua.indexOf('micromessenger') !== -1){
      return true;
  }else{
      return false;
  }
}