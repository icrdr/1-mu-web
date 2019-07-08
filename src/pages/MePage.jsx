import React from 'react'
import LoginQrcode from '../components/LoginQrcode'
import { hasToken } from '../utility'

export default function MainPage() {

  if (!hasToken()) {
    return <LoginQrcode />
  }

  return (
    <div>
      user info
    </div>
  )
}