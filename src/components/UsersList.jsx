import React, { useEffect, useState } from 'react'
import { DOMAIN_URL } from '../config'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import { List, Card } from 'antd';
import { hasToken } from '../utility'

export default function UsersList({ update }) {
  const [userLiset, setUserLiset] = useState([]);

  useEffect(() => {
    if (hasToken()) {
      axios.get(DOMAIN_URL + '/api/user', {
        withCredentials: true
      }).then(res => {
        console.log(res.data)
        setUserLiset(res.data.users)
      }).catch(err => {
        if (err.response) console.log(err.response.data)
      })
    }
  }, [update]);

  if (!hasToken()) {
    return <Redirect to='/login' />
  }
  return (
    <div>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={userLiset}
        renderItem={item => (
          <List.Item>
            <Card title={item.name}>{item.role}</Card>
          </List.Item>
        )}
      />
    </div>
  )
}
