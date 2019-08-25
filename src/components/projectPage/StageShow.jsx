import React from 'react'
import {getStage} from '../../utility'

export default function StageShow({project}) {
  const status = project.status
  const index = project.current_stage_index
  switch (status) {
    case 'await':
      return <span>{`0/${project.stages.length}`}</span>
    case 'finish':
    case 'discard':
      return <span>{`${(index + 1).toString()}/${project.stages.length}`}</span>
    default:
      return <span>{`${(index + 1).toString()}/${project.stages.length}：` + getStage(project).name}</span>
  }
}
