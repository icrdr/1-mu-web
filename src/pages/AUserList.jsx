import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card } from 'antd'
import {fetchData} from '../utility'
import queryString from 'query-string'
import Avatarx from '../components/Avatarx'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: '5%'
  },
  {
    title: '头像',
    key:'key',
    width: '5%',
    render: (user) => {
      return <Avatarx url={user.avatar_url} name={user.name} />
    }
  },
  {
    title: '昵称',
    dataIndex: 'name',
    width: '20%',
    render: (name, user) => {
      return <Link to={"/users/" + user.id}>{name}</Link>
    }
  },
  {
    title: '头衔',
    dataIndex: 'title',
    width: '20%',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: '20%',
  },
  {
    title: '手机',
    dataIndex: 'phone',
    width: '20%',
  },

];

export default function UserList({ location, history }) {

  const [userList, setUserList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });

  useEffect(() => {
    setLoading(true)
    let path = '/users'
    let params = {
      order: 'desc',
      pre_page: pagination.pageSize,
    }

    const values = queryString.parse(location.search)
    if (values.page) {
      setPagination(prevState => { return { ...prevState, current: parseInt(values.page) } })
      params.page = values.page
    } else {
      params.page = pagination.current
    }

    fetchData(path, params).then(res => {
      setUserList(res.data.users)
      setPagination(prevState => { return { ...prevState, total: res.data.total } })
      setLoading(false)
    }).catch(err => {
      setUserList([])
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const onChangePage = (pagination) => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: pagination.current });
    history.push(`${location.pathname}?${params}`)
  }

  return (
    <Card>
      <Table
        columns={columns}
        rowKey={user => user.id}
        dataSource={userList}
        loading={isloading}
        pagination={pagination}
        onChange={onChangePage}
      />
    </Card>
  )
}

