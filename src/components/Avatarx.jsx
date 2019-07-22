import React from 'react'
import { Avatar } from 'antd'
export default function Avatarx({url, name, size}) {
  if(url){
    return <Avatar size={size} src={url}/>
  }
  
  if(name){
    return <Avatar size={size} style={{ color: '#f56a00', fontSize:`${size*0.5}px`, backgroundColor: '#fde3cf' }}>{name[0].toUpperCase()}</Avatar>
  }

  return (
  <Avatar size={size} style={{ color: '#ddd', fontSize:`${size*0.5}px`, backgroundColor: '#eee' }}>X</Avatar>
  )
}
