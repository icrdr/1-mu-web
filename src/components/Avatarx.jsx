import React from 'react'
import { Avatar } from 'antd'
export default function Avatarx({user, size}) {
  if(user.avatar_url){
    return <Avatar size={size} src={user.avatar_url}/>
  }
  
  if(user.name){
    return <Avatar size={size} style={{ color: '#f56a00', fontSize:`${size*0.5}px`, backgroundColor: '#fde3cf' }}>{user.name[0]}</Avatar>
  }

  return (
  <Avatar size={size} style={{ color: '#ddd', fontSize:`${size*0.5}px`, backgroundColor: '#eee' }}>X</Avatar>
  )
}
