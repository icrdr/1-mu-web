import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Popconfirm, Button, Input, message,Breadcrumb } from 'antd'
import { fetchData, updateData } from '../utility'
import { meContext } from '../layouts/Web';
import queryString from 'query-string'
const { Search } = Input;

export default function Main({ location, history }) {

  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [update,setUpdate] = useState(false);
  const [isAdmin,setAdmin] = useState(false);
  const { meData } = useContext(meContext);

  const columns = [
    {
      title: '企划名',
      dataIndex: 'title',
      width: '20%'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: '20%',
      render: (tags) => {
        return tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)
      }
    },
    {
      title: '操作',
      key: 'key',
      render: (key, project) => (
          <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => addProject(project.id)}
            okText="是"
            cancelText="否"
          >
            <Button size='small'>添加任务</Button>
          </Popconfirm>
        ),
      width: '5%',
    }
  ];
  const columns2 = [
    {
      title: '企划名',
      dataIndex: 'title',
      width: '20%'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: '20%',
      render: (tags) => {
        return tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)
      }
    }
  ];
  function addProject(id){
    const path = '/projects/'+id
    const data = {
      client_id:meData.id,
      group_id: meData.groups_as_admin[0].id,
    }
    updateData(path, data).then(()=>{
      setUpdate(!update)
    })
  }
  useEffect(() => {
    setLoading(true)
    const path = '/projects'
    const params = {
      order: 'desc',
      pre_page: pagination.pageSize,
      client_id:1,
      status: ['await'],
    }
    if(meData.groups_as_admin.length>0)setAdmin(true)
    const values = queryString.parse(location.search)
    if (values.page) {
      setPagination(prevState => { return { ...prevState, current: parseInt(values.page) } })
      params.page = values.page
    } else {
      params.page = pagination.current
    }

    if (values.search) {
      params.search = values.search
    }

    fetchData(path, params).then(res => {
      setProjectList(res.data.projects)
      setPagination(prevState => { return { ...prevState, total: res.data.total } })
      setLoading(false)
    }).catch(() => {
      setProjectList([])
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, update]);

  const onChangePage = (pagination) => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: pagination.current });
    history.push(`${location.pathname}?${params}`)
  }

  const onSearch = v => {
    if (v.length < 2) {
      message.info('关键词太短，至少2个字符')
      console.log('Too short.')
      return false
    }
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, search: v, page: 1 });
    history.push(`${location.pathname}?${params}`)
  }

  return (
    <>
    <Breadcrumb className='m-b:1'>
    <Breadcrumb.Item>
    <Link to='/all'>总表</Link>
    </Breadcrumb.Item>
  </Breadcrumb>
    <Card>
      <div className='m-b:1'>
        <Search placeholder="输入企划标题关键词" onSearch={onSearch} allowClear enterButton />
      </div>
      <Table
        columns={isAdmin?columns:columns2}
        rowKey={project => project.id}
        dataSource={projectList}
        loading={isloading}
        pagination={pagination}
        onChange={onChangePage}
      />
    </Card>
    </>
  )
}

