import React, { useEffect, useState } from 'react'
import { isWx } from '../utility'
import { Button, Row, Col, Card } from 'antd';
import axios from 'axios'
import useInterval from '../hooks/useInterval'

const REDIRECT_URI = window.REDIRECT_URI
// const WX_KF_APPID = window.WX_KF_APPID
const WX_GZ_APPID = window.WX_GZ_APPID
const DOMAIN_URL = window.DOMAIN_URL

const WX_QRCODE_TRY = window.WX_QRCODE_TRY
const WX_QRCODE_DELAY = window.WX_QRCODE_DELAY

export default function LoginPage() {
  let wx_qrcode_url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WX_GZ_APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`

  const [qrcode, setQrcode] = useState('');
  const [scene_str, setScene_str] = useState('');
  const [count, setCount] = useState(1);
  const [isChecking, setIsChecking] = useState(false);

  useInterval(() => {
    fetchCheck()
    if (WX_QRCODE_TRY <= count) {
      setIsChecking(false)
    }
    setCount(count + 1);
  }, isChecking ? WX_QRCODE_DELAY : null);

  useEffect(() => {
    let url = DOMAIN_URL + '/api/wechat/qrcode'
    if (isChecking) {
      axios.get(url).then(res => {
        console.log(res.data)
        setQrcode(`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${res.data.ticket}`)
        setScene_str(res.data.scene_str)
      }).catch(err => {
        if (err.response) console.log(err.response.data)
      })
    }
  }, [isChecking]);

  const fetchCheck = () => {
    let url = DOMAIN_URL + '/api/wechat/check'
    let params = {
      'scene_str': scene_str
    }
    axios.get(url, { params: params }).then(res => {
      console.log(res.data)
      setIsChecking(false)
    }).catch(err => {
      if (err.response) console.log(err.response.data)
    })
  }
  let loginRender

  if (isWx()){
    loginRender = <Button type="primary" href={wx_qrcode_url} block>微信登陆</Button>
  }else{
    if (isChecking){
      loginRender = <img width='100%' src={qrcode} alt='qrcode' />
    }else{
      loginRender = <Button onClick={() => setIsChecking(true)} block>微信登陆</Button>
    }
  }

  return (
    <div>
      <Row type="flex" justify="center" style={{ height: '1000px', background: '#eee' }}>
        <Col xs={22} sm={14} md={6} style={{ height: 'auto' }}>
          <Card>
            {loginRender}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
