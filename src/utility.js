
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
    case 'pause':
      return '暂停'
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
  const start_date = new Date(getPhase(stage).start_date + ' UTC')
  const current_date = new Date()
  let difference = start_date - current_date;
  difference += 1000 * 60 * 60 * 24 * (getPhase(stage).days_need)
  return difference / (1000 * 60 * 60 * 24)
}

export function parseTimeLeft(timeleft) {
  const x_days = Math.floor(timeleft)
  if (timeleft >= 0) {
    return timeleft < 1 ? '剩余不足1天' : `剩余${x_days}天余`
  } else {
    return -timeleft < 1 ? '超时警告' : `逾期${-x_days}天余`
  }
}

function handleError(err, showMsg) {
  if (err.response) {
    console.log('ERROR:')
    console.log(err.response)
    if (err.response.data.message) {
      if (showMsg) message.error(`发生错误！错误内容：${err.response.data.message}`)
    } else {
      if (showMsg) message.error(`发生错误！错误内容：${JSON.stringify(err.response.data)}`)
    }
  } else {
    console.log('ERROR:')
    console.log(err)
    if (showMsg) message.error('未知错误！')
  }
}

export function fetchData(path, params, showMsg = true) {
  console.debug(`PATH: "${path}"`)
  if (params) {
    console.debug('PARAMS:')
    console.debug(params)
  }
  return new Promise((resolve, reject) => {
    axios.get(path, {
      params: params,
      withCredentials: true
    }).then(res => {
      if (res.data) {
        console.debug('RESPOND:')
        console.debug(res.data)
      }
      resolve(res)
    }).catch(err => {
      handleError(err, showMsg)
      reject(err)
    })
  });
}

export function deleteData(path, params, showMsg = true) {
  console.debug(`PATH: "${path}"`)
  if (params) {
    console.debug('PARAMS:')
    console.debug(params)
  }
  return new Promise((resolve, reject) => {
    axios.delete(path, {
      params: params,
      withCredentials: true
    }).then(res => {
      if (res.data) {
        console.debug('RESPOND:')
        console.debug(res.data)
      }
      resolve(res)
    }).catch(err => {
      handleError(err, showMsg)
      reject(err)
    })
  });
}

export function updateData(path, data, showMsg = true) {
  console.debug(`PATH: "${path}"`)
  console.debug('DATA:')
  console.debug(data)
  return new Promise((resolve, reject) => {
    axios.put(path, { ...data }, {
      withCredentials: true
    }).then(res => {
      console.debug('RESPOND:')
      console.debug(res.data)
      if (showMsg) message.success('更新成功');
      resolve(res)
    }).catch(err => {
      handleError(err, showMsg)
      reject(err)
    })
  });
}

export function postData(path, data, showMsg = true) {
  console.debug(`PATH: "${path}"`)
  console.debug('DATA:')
  console.debug(data);
  return new Promise((resolve, reject) => {
    axios.post(path, { ...data }, {
      withCredentials: true
    }).then(res => {
      console.debug('RESPOND:')
      console.debug(res.data)
      if (showMsg) message.success('提交成功');
      resolve(res)
    }).catch(err => {
      handleError(err, showMsg)
      reject(err)
    })
  });
}

export function uploadData(path, formData, showMsg = true) {
  console.debug(`PATH: "${path}"`)
  return new Promise((resolve, reject) => {
    axios.post(path, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true
    }).then(res => {
      console.debug('RESPOND:')
      console.debug(res.data)
      if (showMsg) message.success('提交成功');
      resolve(res)
    }).catch(err => {
      handleError(err, showMsg)
      reject(err)
    })
  });
}

export function isUserExist(v) {
  return new Promise(resolve => {
    const path = '/users/'+v
    fetchData(path, null, false).then(res => {
      resolve(true)
    }).catch(err => {
      resolve(false)
    })
  });
}