import React, { useEffect, useState } from 'react'
import { DOMAIN_URL, IMG_FORMAT } from '../config'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import { List } from 'antd';
import { hasToken } from '../utility'

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
    if (IMG_FORMAT.includes(item.format)) {
      return <img width={272} alt="img" src={item.url} />
    } else {
      return <div>iiii</div>
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
