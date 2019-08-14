import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card } from 'antd'
import { fetchData } from '../utility'
import queryString from 'query-string'
import { useMediaQuery } from 'react-responsive'


export default function GroupList({ location, history }) {
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })
  const [groupList, setGroupList] = useState([]);
  const [isloading, setLoading] = useState(false);
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
        return <Link to={`/groups/${group.id}`}>{name}</Link>
      }
    },
    {
      title: '组长',
      dataIndex: 'admins',
      width: 150,
      render: (admins) => admins.map((admin, index) => (
        <Link className='m-r:.5' key={index} to={"/users/" + admin.id}>{admin.name}</Link>
      )),

    },
    {
      title: '组员',
      dataIndex: 'users',
      render: (users) => users.map((user, index) => (
        <Link className='m-r:.5' key={index} to={"/users/" + user.id}>{user.name}</Link>
      )),
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
    }).catch(() => {
      setGroupList([])
    }).finally(() => {
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
    <>
      <Card>
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
    </>
  )
}

