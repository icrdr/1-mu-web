import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card } from 'antd'
import {fetchData} from '../utility'
import queryString from 'query-string'

export default function GroupList({ location, history, match }) {
  const [groupList, setGroupList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: '5%'
    },
    {
      title: '组名',
      dataIndex: 'name',
      width: '20%',
      render: (name, group) => {
        return <Link to={`${match.url}/${group.id}`}>{name}</Link>
      }
    },
    {
      title: '组长',
      dataIndex: 'admins',
      render: (admins, group) => admins.map((admin, index) => (
        <Link className='m-r:.5' key={index} to={"/admin/users/" + admin.id}>{admin.name}</Link>
      )),
      width: '10%',
    },
    {
      title: '组员',
      dataIndex: 'users',
      render: (users, group) => users.map((user, index) => (
        <Link className='m-r:.5' key={index} to={"/admin/users/" + user.id}>{user.name}</Link>
      )),
      width: '30%',
    },
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
      setLoading(false)
    }).catch(err => {
      setGroupList([])
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const changePage = (pagination) => {
    const params = queryString.stringify({ page: pagination.current });
    history.push("/groups?" + params)
  }

  return (
    <Card>
      <Table
        columns={columns}
        rowKey={group => group.id}
        dataSource={groupList}
        loading={isloading}
        pagination={pagination}
        onChange={changePage}
      />
    </Card>
  )
}

