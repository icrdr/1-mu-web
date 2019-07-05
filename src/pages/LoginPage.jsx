import React from 'react'
import {isWx} from '../utility'
import { Button, Row, Col, Card } from 'antd';

const REDIRECT_URI = window.REDIRECT_URI
const WX_KF_APPID = window.WX_KF_APPID
const WX_GZ_APPID = window.WX_GZ_APPID

export default function LoginPage() {
  let wx_qrcode_url = ''
  if(isWx()){
    console.log(WX_GZ_APPID)
    wx_qrcode_url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WX_GZ_APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
  }else{
    console.log(WX_KF_APPID)
    wx_qrcode_url = `https://open.weixin.qq.com/connect/qrconnect?appid=${WX_KF_APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`
  } 
  return (
    <Row type="flex" justify="center" style={{ height: '1000px', background: '#eee' }}>
    {isWx()}
      <Col span={10} style={{ height: 'auto' }}>
        <Card>
          <Button type="primary" href={wx_qrcode_url} block>
            微信登陆
          </Button>
        </Card>
      </Col>
    </Row>
  )
}
