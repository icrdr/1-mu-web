import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card, Popconfirm, Button } from 'antd'
import { fetchData, deleteData } from '../utility'
import queryString from 'query-string'
import Avatarx from '../components/Avatarx'
import { globalContext } from '../App';
export default function UserList({ location, history }) {
  const { isSm } = useContext(globalContext);
  const [userList, setUserList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [update, setUpdate] = useState(false);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: isSm ? 32 : 50,
      fixed: 'left',
    },
    {
      title: '昵称',
      dataIndex: 'name',
      width: isSm ? 80: 120,
      fixed: 'left',
      render: (name, user) => {
        return <Link to={"/admin/users/" + user.id}>{name}</Link>
      }
    },
    {
      title: '头像',
      key: 'key',
      width: 80,
      render: (user) => {
        return <Avatarx url={user.avatar_url} name={user.name} />
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: isSm ? 120: 200,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      width: isSm ? 120: 200,
    },
    {
      title: '删除',
      key: 'key2',
      render: (key, user) => {
        if (user.id !== 1) {
          return <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => deleteUser(user.id)}
            okText="是"
            cancelText="否"
          >
            <Button size='small'>删除</Button>
          </Popconfirm>
        } else {
          return ''
        }
      },
    }
  ]

  function deleteUser(id) {
    const path = '/users/' + id
    deleteData(path).then(res => {
      setUpdate(!update)
    })
  }

  useEffect(() => {
    setLoading(true)
    const path = '/users'
    const params = {
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
  }, [update, location]);

  const onChangePage = (pagination) => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: pagination.current });
    history.push(`${location.pathname}?${params}`)
  }

  return (
    <Card bodyStyle={{ padding: isSm ? '24px 8px' : '' }}>
      <Table
        columns={columns}
        rowKey={user => user.id}
        dataSource={userList}
        loading={isloading}
        pagination={pagination}
        onChange={onChangePage}
        scroll={{ x: 600 }}
      />
    </Card>
  )
}

