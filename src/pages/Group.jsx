import React, { useEffect, useState, useContext } from 'react'
import { Link, Route } from 'react-router-dom'
import { Card, Button, Descriptions, Table, Popconfirm,Breadcrumb } from 'antd'
import Loading from '../components/Loading'
import { fetchData, updateData } from '../utility'
import MemberAdd from '../components/MemberAdd'
import { globalContext } from '../App';

export default function Group({ match, location }) {
  const [groupData, setGroupData] = useState();
  const [update, setUpdate] = useState(true);
  const [isAdmin, setAdmin] = useState(false);
  const { meData } = useContext(globalContext);
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
        return <Link to={`/users/${user.id}`}>{name}</Link>
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
        return <Link to={`/users/${user.id}`}>{name}</Link>
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
      const admins = res.data.groups[0].admins
      for (let i in admins) {
        if (admins[i].id === meData.id) {
          setAdmin(true)
          break
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.params.group_id, update]);

  if (!groupData) {
    return <Loading />
  }

  return (
    <>
      <Breadcrumb className='m-b:1'>
        <Breadcrumb.Item>
          <Link to='/groups'>小组列表</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={location.pathname}>{groupData.name}</Link>
        </Breadcrumb.Item>
      </Breadcrumb>
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
          {isAdmin &&
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
            </>}
          <Table
            columns={isAdmin ? columns1 : columns2}
            rowKey={users => users.id}
            dataSource={groupData.users}
          />
        </div>
      </Card>
    </>
  )
}


