import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import { List } from 'antd';
import { hasToken } from '../utility'

const DOMAIN_URL = window.DOMAIN_URL
export default function UsersList({ update }) {
  const [userLiset, setUserLiset] = useState([]);

  useEffect(() => {
    if (hasToken()) {
      axios.get(DOMAIN_URL + '/api/file', {
        params: {
          order: 'desc'
        },
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
      return <div>no preview</div>
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
