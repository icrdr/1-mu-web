import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import { List,Avatar } from 'antd';
import { hasToken } from '../utility'

const DOMAIN_URL = window.DOMAIN_URL
export default function UsersList({ update }) {
  const [userLiset, setUserLiset] = useState([]);

  useEffect(() => {
    if (hasToken()) {
      let url = DOMAIN_URL + '/api/file'
      let params = {
        order: 'desc'
      }
      axios.get(url, {
        params: params,
        withCredentials: true
      }).then(res => {
        console.log(res.data)
        setUserLiset(res.data.files)
      }).catch(err => {
        if (err.response) console.log(err.response.data)
      })
    }
  }, [update]);

  const imgRender = (item) => {
    if (item.previews.length>0) {
      return <img height={100} alt="img" src={item.previews[0].url} />
    } else {
      return <div className='t-a:c' style={{height:'100px',width:'150px', color:'#fff', lineHeight:'100px', background:'#eee'}}><h1>{item.format}</h1></div>
    }
  }
  const avatarRender = (item) => {
    if (item.uploader.wx_user) {
      return <Avatar src={item.uploader.wx_user.headimg_url} />
    } else {
      return <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
    }
  }

  if (!hasToken()) {
    return <Redirect to='/login' />
  }
  return (
    <div>
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          defaultCurrent:1,
          onChange: page => {
            console.log(page);
          },
          simple: true,
          pageSize: 3,
        }}
        dataSource={userLiset}
        renderItem={item => (
          <List.Item
            extra={
              imgRender(item)
            }
          >
            <List.Item.Meta
              avatar={avatarRender(item)}
              title={item.name}
              description={item.uploader.name}
            />
            {item.upload_date}
          </List.Item>
        )}
      />
    </div>
  )
}
