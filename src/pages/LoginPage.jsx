import React, { useEffect, useState } from 'react'
import { isWx } from '../utility'
import { Button, Row, Col, Card } from 'antd';
import axios from 'axios'
import useInterval from '../hooks/useInterval'

const REDIRECT_URI = window.REDIRECT_URI
const WX_KF_APPID = window.WX_KF_APPID
const WX_GZ_APPID = window.WX_GZ_APPID
const DOMAIN_URL = window.DOMAIN_URL

const WX_QRCODE_TRY = window.WX_QRCODE_TRY
const WX_QRCODE_DELAY = window.WX_QRCODE_DELAY

export default function LoginPage() {
  let wx_qrcode_url = ''
  if (isWx()) {
    wx_qrcode_url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WX_GZ_APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
  } else {
    wx_qrcode_url = `https://open.weixin.qq.com/connect/qrconnect?appid=${WX_KF_APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`
  }

  const [qrcode, setQrcode] = useState('');
  const [scene_str, setScene_str] = useState('');
  const [count, setCount] = useState(1);
  const [isChecking, setIsChecking] = useState(true);

  useInterval(() => {
    fetchCheck()
    if (WX_QRCODE_TRY <= count) {
      setIsChecking(false)
    }
    setCount(count + 1);
  }, isChecking ? WX_QRCODE_DELAY : null);

  useEffect(() => {
    let url = DOMAIN_URL + '/api/wechat/qrcode'
    axios.get(url).then(res => {
      console.log(res.data)
      setQrcode(`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${res.data.ticket}`)
      setScene_str(res.data.scene_str)
    }).catch(err => {
      if (err.response) console.log(err.response.data)
    })
  }, []);

  const fetchCheck = () => {
    let url = DOMAIN_URL + '/api/wechat/check'
    let params = {
      'scene_str': scene_str
    }
    axios.get(url, { params: params }).then(res => {
      console.log(res.data)
    }).catch(err => {
      if (err.response) console.log(err.response.data)
    })
  }

  return (
    <Row type="flex" justify="center" style={{ height: '1000px', background: '#eee' }}>
      {isWx()}
      <Col xs={22} md={10} style={{ height: 'auto' }}>
        <Card>
          <img width='100%' src={qrcode} alt='qrcode' />
          <Button type="primary" href={wx_qrcode_url} block>
            微信登陆
          </Button>
          <Button onClick={() => setIsChecking(true)} block>
            测试是否扫描
          </Button>
        </Card>
      </Col>
    </Row>
  )
}
