import React from 'react'
import {Tag} from 'antd'
import {parseStatus} from '../../utility'

export default function StatusTag({ project }) {
  const str = parseStatus(project.status)
  let color = ''
  switch (project.status) {
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
    default:
      color = '#ddd'
  }
  let ex_str = ''
  if (project.pause){
    color = 'cyan'
    if (project.delay){
      ex_str = '（暂停、逾期）'
    }else{
      ex_str = '（暂停）'
    }
  }
  else if (project.delay){
    color = 'red'
    ex_str = '（逾期）'
  }

  return (
    <Tag color={color} >{str}{ex_str||''}</Tag>
  )
}
