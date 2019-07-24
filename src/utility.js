
import axios from 'axios'
import { message } from 'antd'
const API_URL = window.API_URL
axios.defaults.baseURL = API_URL

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
    case 'draft':
      return '草稿'
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
  return stage.phases[stage.phases.length - 1]
}

export function getStage(project) {
  return project.stages[project.current_stage_index]
}

export function parseDate(date_str) {
  const date = new Date(date_str + ' UTC')
  return date.toLocaleString()
}

export function timeLeft(stage) {
  const start_date = new Date(stage.start_date + ' UTC')
  const current_date = new Date()
  let difference = start_date - current_date;
  difference += 1000 * 60 * 60 * 24 * (getPhase(stage).days_need)
  return Math.floor(difference / (1000 * 60 * 60 * 24))
}

export function parseTimeLeft(x_days) {
  if (x_days >= 0) {
    return x_days < 1 ? '剩余不足1天' : `剩余${x_days}天余`
  } else {
    return -x_days < 1 ? '逾期' : `逾期${-x_days}天余`
  }
}

function handleError(err) {
  if (err.response) {
    console.log('ERROR:')
    console.log(err.response)
    if (err.response.data.message) {
      message.error(`发生错误！错误内容：${err.response.data.message}`)
    } else {
      message.error(`发生错误！错误内容：${JSON.stringify(err.response.data)}`)
    }
  } else {
    console.log('ERROR:')
    console.log(err)
    message.error('未知错误！')
  }
}

export function fetchData(path, params) {
  console.debug(`PATH: "${path}"`)
  if(params){
    console.debug('PARAMS:')
    console.debug(params)
  }
  return new Promise((resolve, reject) => {
    axios.get(path, {
      params: params,
      withCredentials: true
    }).then(res => {
      if(res.data){
        console.debug('RESPOND:')
        console.debug(res.data)
      }
      resolve(res)
    }).catch(err => {
      handleError(err)
      reject(err)
    })
  });
}

export function updateData(path, data) {
  console.debug(`PATH: "${path}"`)
  console.debug('DATA:')
  console.debug(data)
  return new Promise((resolve, reject) => {
    axios.put(path, { ...data }, {
      withCredentials: true
    }).then(res => {
      console.debug('RESPOND:')
      console.debug(res.data)
      message.success('更新成功');
      resolve(res)
    }).catch(err => {
      handleError(err)
      reject(err)
    })
  });
} 
export function postData(path, data) {
  console.debug(`PATH: "${path}"`)
  console.debug('DATA:')
  console.debug(data);
  return new Promise((resolve, reject) => {
    axios.post(path, { ...data }, {
      withCredentials: true
    }).then(res => {
      console.debug('RESPOND:')
      console.debug(res.data)
      message.success('提交成功');
      resolve(res)
    }).catch(err => {
      handleError(err)
      reject(err)
    })
  });
} 