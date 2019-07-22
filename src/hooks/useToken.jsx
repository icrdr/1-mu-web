import { useCookies } from 'react-cookie';
import jwtDecode from 'jwt-decode'

export default function useToken() {
  const [cookies] = useCookies();
  if (cookies.token) {
    if (jwtDecode(cookies.token).exp > Date.now() / 1000) {
      return cookies.token
    }
  }
  return ''
}
