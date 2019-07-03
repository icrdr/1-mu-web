import React from 'react'
import useWxLogin from '../hooks/useWxLogin'
import UserList from '../components/UserList'

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
    <UserList />
  )
}
