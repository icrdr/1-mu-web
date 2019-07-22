import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Descriptions, Statistic} from 'antd'
import Loading from '../components/Loading'
import axios from 'axios'
import Avatarx from '../components/Avatarx'
const SERVER_URL = window.SERVER_URL

export default function User({ match }) {
  const [userData, setUserData] = useState();

  useEffect(() => {
    let url = SERVER_URL + '/api/users'
    let params = {
      include: match.params.user_id
    }
    axios.get(url, {
      params: params,
      withCredentials: true
    }).then(res => {
      console.log(res.data)
      setUserData(res.data.users[0])
    }).catch(err => {
      if (err.response) console.log(err.response.data)
    })
  }, [match]);

  if (!userData) {
    return <Loading />
  }



  return (
    <Card className='p:2' title={'用户：' + userData.name}>
      <div className='t-a:c'><Avatarx size={128}  url={userData.avatar_url} name={userData.name}/></div>
      <div className='m-t:4 t-a:c' style={{ fontSize: '25px' }}>{userData.name}</div>
      <div className='m-t:.8 t-a:c'>{userData.title}</div>
      <Row className='m-t:4 t-a:c' gutter={16}>
        <Col span={12} >
          <Statistic title="粉丝" value={userData.followed_count} />
        </Col>
        <Col span={12} >
          <Statistic title="追随者" value={userData.follower_count}/>
        </Col>
      </Row>
      <Descriptions className="m-t:5" layout="vertical" bordered>
        <Descriptions.Item label="邮箱">{userData.email}</Descriptions.Item>
        <Descriptions.Item label="手机">{userData.phone}</Descriptions.Item>
        <Descriptions.Item label="性别">{userData.sex}</Descriptions.Item>
        <Descriptions.Item label="微信昵称">{userData.wx_user.nickname}</Descriptions.Item>
      </Descriptions>
    </Card>
  )
}
