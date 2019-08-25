import React from 'react'
import {Tag} from 'antd'
import {parseStatus} from '../../utility'

export default function StatusTag({ status }) {
  const str = parseStatus(status)
  let color = ''
  switch (status) {
    case 'await':
      color = 'orange'
      break
    case 'finish':
      color = 'green'
      break
    case 'pending':
      color = 'cyan'
      break
    case 'progress':
      color = 'blue'
      break
    case 'modify':
      color = 'blue'
      break
    case 'discard':
      color = 'grey'
      break
    case 'pause':
      color = 'cyan'
      break
    case 'delay':
      color = 'red'
      break
    default:
      color = '#ddd'
  }
  return (
    <Tag color={color} >{str}</Tag>
  )
}
