import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { List} from 'antd';
import Avatarx from './Avatarx';


const SERVER_URL = window.SERVER_URL
export default function UsersList({ update }) {
  const [userLiset, setUserLiset] = useState([]);

  useEffect(() => {
    let url = SERVER_URL + '/api/files'
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
  }, [update]);

  const imgRender = (item) => {
    if (item.previews.length>0) {
      return <img height={100} alt="img" src={item.previews[item.previews.length-1].url} />
    } else {
      return <div className='t-a:c' style={{height:'100px',width:'150px', color:'#fff', lineHeight:'100px', background:'#eee'}}><h1>{item.format}</h1></div>
    }
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
              avatar={<Avatarx user={item.uploader}/>}
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
