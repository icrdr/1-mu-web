import React from 'react'
import useWxLogin from '../hooks/useWxLogin'
import {isWx} from '../utility'


export default function MainPage(props) {

  const wxLoginState = useWxLogin(props)
  
  switch (wxLoginState) {
    case 'pending':
      return <div>loading...</div>;
    case 'error':
      return <div>error!</div>;
    default:
      break;
  }

  return (
    <div>
      {isWx()}
    </div>
  )
}
