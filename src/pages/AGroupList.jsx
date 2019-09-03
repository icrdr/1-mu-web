import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card, Button, Popconfirm } from 'antd'
import { fetchData, deleteData } from '../utility'
import queryString from 'query-string'

import { globalContext } from '../App';
export default function GroupList({ location, history, match }) {
  const { isSm } = useContext(globalContext);
  const [groupList, setGroupList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [update, setUpdate] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: isSm ? 32 : 50,
      fixed: 'left',
    },
    {
      title: '组名',
      dataIndex: 'name',
      width: isSm ? 120 : 200,
      fixed: 'left',
      render: (name, group) => {
        return <Link to={`${match.url}/${group.id}`}>{name}</Link>
      }
    },
    {
      title: '组长',
      dataIndex: 'admins',
      width: 150,
      render: (admins, group) => admins.map((admin, index) => (
        <Link className='m-r:.5' key={index} to={"/admin/users/" + admin.id}>{admin.name}</Link>
      )),

    },
    {
      title: '组员',
      dataIndex: 'users',
      render: (users, group) => users.map((user, index) => (
        <Link className='m-r:.5' key={index} to={"/admin/users/" + user.id}>{user.name}</Link>
      )),
    },
    {
      title: '删除',
      key: 'delete',
      width: 100,
      render: (key, group) => {
        if (group.id !== 1) {
          return <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => deleteGroup(group.id)}
            okText="是"
            cancelText="否"
          >
            <Button size='small'>删除</Button>
          </Popconfirm>
        } else {
          return ''
        }
      }
    }
  ];
  useEffect(() => {
    setLoading(true)
    const path = '/groups'
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
      setGroupList(res.data.groups)
      setPagination(prevState => { return { ...prevState, total: res.data.total } })
    }).catch(err => {
      setGroupList([])
    }).finally(() => {
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, update]);


  function deleteGroup(id) {
    const path = '/groups/' + id
    deleteData(path).then(res => {
      setUpdate(!update)
    })
  }
  const onChangePage = (pagination) => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: pagination.current });
    history.push(`${location.pathname}?${params}`)
  }

  return (
    <Card bodyStyle={{ padding: isSm ? '24px 8px' : '' }}>
      <Button className='m-b:1' type='primary'><Link to='/admin/groups/add'>添加小组</Link></Button>
      <Table
        columns={columns}
        rowKey={group => group.id}
        dataSource={groupList}
        loading={isloading}
        pagination={pagination}
        onChange={onChangePage}
        scroll={{ x: 600 }}
      />
    </Card>
  )
}

