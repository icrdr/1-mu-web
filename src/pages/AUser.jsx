import React, { useEffect, useState } from 'react'
import { Card, Row, Col } from 'antd'
import Loading from '../components/Loading'
import { fetchData } from '../utility'
import Avatarx from '../components/Avatarx'
import UserData from '../components/UserData'
import UserAttr from '../components/UserAttr'
import UserProject from '../components/UserProject'

export default function User({ match }) {
  const [userData, setUserData] = useState();

  useEffect(() => {
    const path = '/users'
    let params = {
      include: match.params.user_id
    }
    fetchData(path, params).then(res => {
      setUserData(res.data.users[0])
    })
  }, [match.params.user_id]);

  if (!userData) {
    return <Loading />
  }

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <UserData className='m-b:1' title="数据" bordered={false} userID={userData.id} />
          <UserProject className='m-b:1' title="参与的企划" bordered={false} userID={userData.id} />
        </Col>
        <Col xs={24} lg={8}>
          <Card className='m-b:1' bordered={false} title='基本信息'>
            <div className='t-a:c'><Avatarx size={128} url={userData.avatar_url} name={userData.name} /></div>
            <div className='m-t:4 t-a:c' style={{ fontSize: '25px' }}>{userData.name}</div>
            <div className='m-t:.8 t-a:c'>{userData.title}</div>
          </Card>
          <UserAttr title="指数" bordered={false} userID={userData.id} />
        </Col>
      </Row>
    </>
  )
}
