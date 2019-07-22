import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { withRouter } from "react-router";
import { isWx } from '../utility'
import { Button, Row, Col, Card } from 'antd';
import axios from 'axios'
import useInterval from '../hooks/useInterval'
import { useCookies } from 'react-cookie';

const DOMAIN_URL = window.DOMAIN_URL
const WX_KF_APPID = window.WX_KF_APPID
const WX_GZ_APPID = window.WX_GZ_APPID
const SERVER_URL = window.SERVER_URL

const WX_QRCODE_TRY = window.WX_QRCODE_TRY
const WX_QRCODE_DELAY = window.WX_QRCODE_DELAY


function LoginQrcode({match}) {
  let wx_qrcode_url=''
  if (isWx()) {
    wx_qrcode_url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WX_GZ_APPID}&redirect_uri=${DOMAIN_URL+match.url}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
  }else{
    wx_qrcode_url = `https://open.weixin.qq.com/connect/qrconnect?appid=${WX_KF_APPID}&redirect_uri=${DOMAIN_URL+match.url}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`
  }

  const [qrcode, setQrcode] = useState('');
  const [scene_str, setScene_str] = useState('');
  const [count, setCount] = useState(1);
  const [isChecking, setChecking] = useState(false);
  const [isShowing, setShowing] = useState(false);
  const [getToken, setGetToken] = useState(false);
  // eslint-disable-next-line
  const [cookies, setCookie] = useCookies();

  useInterval(() => {
    fetchCheck()
    if (WX_QRCODE_TRY <= count) {
      setChecking(false)
    }
    setCount(count + 1);
  }, isChecking ? WX_QRCODE_DELAY : null);

  useEffect(() => {
    let url = SERVER_URL + '/api/wechat/qrcode'
    if (isShowing) {
      setCount(1);
      axios.get(url).then(res => {
        console.log(res.data)
        setQrcode(`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${res.data.ticket}`)
        setScene_str(res.data.scene_str)
        setChecking(true)
      }).catch(err => {
        if (err.response) console.log(err.response.data)
        setShowing(false)
      })
    }
  }, [isShowing]);

  const fetchCheck = () => {
    let url = SERVER_URL + '/api/wechat/check'
    let params = {
      'scene_str': scene_str
    }
    axios.get(url, { params: params }).then(res => {
      console.log(res.data)
      setCookie('token', res.data.token, { path: '/' });
      setChecking(false)
      setShowing(false)
      setGetToken(true)
    }).catch(err => {
      if (err.response) console.log(err.response.data)
    })
  }
  let loginRender

  if (isWx()) {
    loginRender = <Button type="primary" href={wx_qrcode_url} block>微信登陆</Button>
  } else {
    if (isChecking) {
      loginRender = <img width='100%' src={qrcode} alt='qrcode' />
    } else {
      loginRender = <Button onClick={() => setShowing(true)} block>微信登陆</Button>
    }
  }

  if (getToken) {
    return <Redirect to='/' />
  }

  return (
    <Row type="flex" justify="center" style={{ height: '1000px', background: '#eee' }}>
      <Col xs={22} sm={14} md={6} style={{ height: 'auto' }}>
        <Card>
          {loginRender}
        </Card>
      </Col>
    </Row>
  )
}

export default withRouter(LoginQrcode)