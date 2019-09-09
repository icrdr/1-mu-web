import React from 'react'
import {getStage} from '../../utility'

export default function StageShow({project}) {
  const status = project.status
  const index = project.progress
  const all = project.stages.length
  switch (status) {
    case 'await':
      return <span>{`未开始`}</span>
    case 'finish':
      return <span>{`已完成`}</span>
    default:
      return <span>{`${index}/${all}：` + getStage(project).name}</span>
  }
}
