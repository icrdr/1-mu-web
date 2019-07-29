import React, { useEffect, useState } from 'react'
import { Link, Route } from 'react-router-dom'
import { Card, Button, Descriptions, Table, Popconfirm } from 'antd'
import Loading from '../components/Loading'
import { fetchData, updateData } from '../utility'
import MemberAdd from '../components/MemberAdd'

export default function Group({ match }) {
  const [groupData, setGroupData] = useState();
  const [update, setUpdate] = useState(true);

  const columns1 = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: '5%'
    },
    {
      title: '用户',
      dataIndex: 'name',
      width: '20%',
      render: (name, user) => {
        return <Link to={`/admin/users/${user.id}`}>{name}</Link>
      }
    },
    {
      title: '删除',
      key: 'key',
      render: (key, user) => (
        <Popconfirm
          title="确定如此操作么？"
          onConfirm={() => removeMember(user.id)}
          okText="是"
          cancelText="否"
        >
          <Button size='small'>移除</Button>
        </Popconfirm>
      ),
      width: '5%',
    }
  ]
  const columns2 = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: '5%'
    },
    {
      title: '用户',
      dataIndex: 'name',
      width: '20%',
      render: (name, user) => {
        return <Link to={`/admin/users/${user.id}`}>{name}</Link>
      }
    }
  ]
  function removeMember(id) {
    const path = `/groups/${match.params.group_id}/remove/${id}`
    updateData(path, null).then(() => {
      setUpdate(!update)
    })
  }
  useEffect(() => {
    let path = '/groups'
    let params = {
      include: match.params.group_id
    }
    fetchData(path, params).then(res => {
      setGroupData(res.data.groups[0])
    })
  }, [match.params.group_id, update]);

  if (!groupData) {
    return <Loading />
  }

  return (
    <Card className='p:2' title={'组名：' + groupData.name}>
      <Descriptions className="m-t:5" layout="vertical" bordered>
        <Descriptions.Item label="描述">{groupData.description}</Descriptions.Item>
      </Descriptions>
      <div className="m-t:5">
        <h1>管理员列表</h1>
        <Table
          columns={columns2}
          rowKey={admins => admins.id}
          dataSource={groupData.admins}
        />
      </div>
      <div className="m-t:5">
        <h1>成员列表</h1>
        <>
          <Route exact path={match.path} render={() =>
            <Link to={`${match.url}/add`}>
              <Button type="primary" block>添加成员</Button>
            </Link>
          } />
          <Route path={`${match.path}/add`} render={
            props => <MemberAdd {...props}
              onSuccess={() => setUpdate(!update)}
            />
          } />
        </>
        <Table
          columns={columns1}
          rowKey={users => users.id}
          dataSource={groupData.users}
        />
      </div>
    </Card>
  )
}


