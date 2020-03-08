import axios from "axios";
import { message } from "antd";
import moment from "moment";
const API_URL = window.API_URL;
axios.defaults.baseURL = API_URL;

export function isWx() {
  let ua = window.navigator.userAgent.toLowerCase();
  if (ua.indexOf("micromessenger") !== -1) {
    return true;
  } else {
    return false;
  }
}
export function html2excerpt(str) {
  let string = str.replace(/<[^>]+>/g, "");
  if (string.length > 10) {
    string = string.slice(0, 20) + "...";
  }
  return string;
}
export function parseStatus(status) {
  switch (status) {
    case "await":
      return "未开始";
    case "finish":
      return "已完成";
    case "pending":
      return "待确认";
    case "progress":
      return "进行中";
    case "modify":
      return "修改中";
    default:
      return "未知";
  }
}
export function getPhase(stage) {
  return stage.phases[stage.phases.length - 1];
}

export function getStage(project) {
  return project.stages[project.progress - 1];
}

export function parseDate(date_str) {
  const date = toLocalDate(date_str);
  return date.toLocaleString();
}
export function toLocalDate(date_str) {
  if (typeof date_str === String) {
    date_str = date_str.replace(/-/g, "/");
  }
  const offset = new Date().getTimezoneOffset();
  const utc_date = new Date(date_str);
  utc_date.setMinutes(utc_date.getMinutes() - offset);
  return utc_date;
}
export function timeLeft(stage) {
  const ddl_date = toLocalDate(
    getPhase(stage).deadline_date.replace(/-/g, "/")
  );
  const current_date = new Date();
  let difference = ddl_date - current_date;
  return difference / (1000 * 60 * 60 * 24);
}

export function getQuarterRange(current) {
  const month = current.getMonth();
  const year = current.getFullYear();
  let startDate, endDate;
  if (month < 3) {
    startDate = moment(new Date(year, 0, 1))
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    endDate = moment(new Date(year, 2, 31))
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
  } else if (month < 6) {
    startDate = moment(new Date(year, 3, 1))
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    endDate = moment(new Date(year, 5, 30))
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
  } else if (month < 9) {
    startDate = moment(new Date(year, 6, 1))
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    endDate = moment(new Date(year, 8, 30))
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
  } else {
    startDate = moment(new Date(year, 9, 1))
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    endDate = moment(new Date(year, 11, 31))
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
  }
  return [startDate, endDate];
}

export function getMonthRange(current) {
  const month = current.getMonth();
  const year = current.getFullYear();
  const count = new Date(year, month, 0).getDate();
  const startDate = moment(new Date(year, month, 1))
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
  const endDate = moment(new Date(year, month, count))
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
  return [startDate, endDate];
}

export function getWeekRange(current) {
  const day = current.getDay();
  const startDateStr = moment(
    current.setDate(current.getDate() + 1 - day)
  ).format("YYYY-MM-DD");
  const endDateStr = moment(current.setDate(current.getDate() + 7)).format(
    "YYYY-MM-DD"
  );

  const startDate = moment(startDateStr)
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
  const endDate = moment(endDateStr)
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
  return [startDate, endDate];
}
export function getYearRange(current) {
  const year = current.getFullYear();
  const startDate = moment(new Date(year, 0, 1))
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
  const endDate = moment(new Date(year, 11, 31))
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
  return [startDate, endDate];
}

export function parseTimeLeft(timeleft) {
  const x_days = Math.floor(timeleft);
  if (timeleft >= 0) {
    return timeleft < 1 ? "剩余不足1天" : `剩余${x_days}天余`;
  } else {
    return -timeleft < 1 ? "超时警告" : `逾期${-x_days}天余`;
  }
}

function handleError(err, showMsg) {
  if (err.response) {
    console.log("ERROR:");
    console.log(err.response);
    if (err.response.data.message) {
      if (showMsg)
        message.error(`发生错误！错误内容：${err.response.data.message}`);
    } else {
      if (showMsg)
        message.error(
          `发生错误！错误内容：${JSON.stringify(err.response.data)}`
        );
    }
  } else {
    console.log("ERROR:");
    console.log(err);
    if (showMsg) message.error("未知错误！");
  }
}

export function fetchData(path, params, showMsg = true) {
  console.debug(`PATH: "${path}"`);
  if (params) {
    console.debug("PARAMS:");
    console.debug(params);
  }
  return new Promise((resolve, reject) => {
    axios
      .get(path, {
        params: params,
        withCredentials: true
      })
      .then(res => {
        if (res.data) {
          console.debug("RESPOND:");
          console.debug(res.data);
        }
        resolve(res);
      })
      .catch(err => {
        handleError(err, showMsg);
        reject(err);
      });
  });
}

export function deleteData(path, params, showMsg = true) {
  console.debug(`PATH: "${path}"`);
  if (params) {
    console.debug("PARAMS:");
    console.debug(params);
  }
  return new Promise((resolve, reject) => {
    axios
      .delete(path, {
        params: params,
        withCredentials: true
      })
      .then(res => {
        if (res.data) {
          console.debug("RESPOND:");
          console.debug(res.data);
        }
        resolve(res);
      })
      .catch(err => {
        handleError(err, showMsg);
        reject(err);
      });
  });
}

export function updateData(path, data, showMsg = true) {
  console.debug(`PATH: "${path}"`);
  console.debug("DATA:");
  console.debug(data);
  return new Promise((resolve, reject) => {
    axios
      .put(
        path,
        { ...data },
        {
          withCredentials: true
        }
      )
      .then(res => {
        console.debug("RESPOND:");
        console.debug(res.data);
        if (showMsg) message.success("更新成功");
        resolve(res);
      })
      .catch(err => {
        handleError(err, showMsg);
        reject(err);
      });
  });
}

export function postData(path, data, showMsg = true) {
  console.debug(`PATH: "${path}"`);
  console.debug("DATA:");
  console.debug(data);
  return new Promise((resolve, reject) => {
    axios
      .post(
        path,
        { ...data },
        {
          withCredentials: true
        }
      )
      .then(res => {
        console.debug("RESPOND:");
        console.debug(res.data);
        if (showMsg) message.success("提交成功");
        resolve(res);
      })
      .catch(err => {
        handleError(err, showMsg);
        reject(err);
      });
  });
}

export function uploadData(path, formData, showMsg = true) {
  console.debug(`PATH: "${path}"`);
  return new Promise((resolve, reject) => {
    axios
      .post(path, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      })
      .then(res => {
        console.debug("RESPOND:");
        console.debug(res.data);
        if (showMsg) message.success("提交成功");
        resolve(res);
      })
      .catch(err => {
        handleError(err, showMsg);
        reject(err);
      });
  });
}

export function isUserExist(v) {
  return new Promise(resolve => {
    const path = "/users/" + v;
    fetchData(path, null, false)
      .then(res => {
        resolve(true);
      })
      .catch(err => {
        resolve(false);
      });
  });
}
