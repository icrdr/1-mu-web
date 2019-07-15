import jwtDecode from 'jwt-decode'
import cookie from 'react-cookies'

export function hasToken() {
  const token = cookie.load('token')

  if (token) {
    if (jwtDecode(token).exp > Date.now() / 1000) {
      return true
    }
  }
  return false
}

export function isWx() {
  let ua = window.navigator.userAgent.toLowerCase();
  if (ua.indexOf('micromessenger') !== -1) {
    return true;
  } else {
    return false;
  }
}

export function parseStatus(status) {
  switch (status) {
    case 'await':
      return '未开始'
    case 'finish':
      return '已完成'
    case 'pending':
      return '待确认'
    case 'progress':
      return '进行中'
    case 'modify':
      return '进行中（修改）'
    case 'discard':
      return '已废弃'
    case 'abnormal':
      return '异常？'
    case 'delay':
      return '逾期中'
    default:
      return '未知'
  }
}
export function getPhase(stage) {
  return stage.phases[stage.phases.length-1]
}

export function getStage(project) {
  return project.stages[project.current_stage_index]
}

export function parseDate(date_str) {
  const date = new Date(date_str+' UTC')
  return date.toLocaleString()
}

export function timeLeft(stage) {
  const start_date = new Date(stage.start_date+' UTC')
  const current_date = new Date()
  let difference =  start_date - current_date;
  difference += 1000*60*60*24*(getPhase(stage).days_need)
  return Math.floor(difference/(1000*60*60*24))
}

export function parseTimeLeft(stage){
  const x_days = timeLeft(stage)
  if(x_days>=0){
    return x_days<1?'剩余不足1天':`剩余${x_days}天余`
  }else{
    return -x_days<1?'逾期':`逾期${-x_days}天余`
  }
}