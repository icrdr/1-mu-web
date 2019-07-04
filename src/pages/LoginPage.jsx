import React from 'react'

import { Button, Row, Col, Card } from 'antd';

const REDIRECT_URI = window.REDIRECT_URI
const WX_APPID = window.WX_APPID

export default function LoginPage() {
  const wx_qrcode_url = `https://open.weixin.qq.com/connect/qrconnect?appid=${WX_APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`
  return (
    <Row type="flex" justify="center" style={{ height: '1000px', background: '#eee' }}>
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
