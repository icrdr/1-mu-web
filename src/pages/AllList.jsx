import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Input, Row, Col, Select } from 'antd'
import { fetchData } from '../utility'
// import { meContext } from '../layouts/Web';
import queryString from 'query-string'
import { useMediaQuery } from 'react-responsive'
const { Search } = Input;
const { Option } = Select;
export default function Main({ location, history }) {
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })
  const [projectList, setProjectList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  // const [update, setUpdate] = useState(false);
  // const { meData } = useContext(meContext);

  const columns = [
    {
      title: '企划名',
      dataIndex: 'title',
      width: isSm ? 150 : 250,
      fixed: 'left',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags) => {
        return tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)
      }
    },
    {
      title: '小组',
      dataIndex: 'client',
      width: 200,
      render: (client, project) => {
        return <Link to={"/users/" + client.id}>{client.name}</Link>
      }
      
    },
    {
      title: '制作者',
      dataIndex: 'creator',
      width: 200,
      render: (creator, project) => {
        return <Link to={"/users/" + creator.id}>{creator.name}</Link>
      }
    }
  ]

  useEffect(() => {
    setLoading(true)
    let path = '/groups'

    fetchData(path).then(res => {
      setGroupList(res.data.groups)
    })

    path = '/projects'
    const params = {
      order: 'desc',
      pre_page: pagination.pageSize,
      status: 'await,progress,delay,pending,abnormal,modify,pause,finish'
    }

    const values = queryString.parse(location.search)
    if (values.page) {
      setPagination(prevState => { return { ...prevState, current: parseInt(values.page) } })
      params.page = values.page
    } else {
      params.page = pagination.current
    }

    if (values.client_id) {
      params.client_id = values.client_id
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
  }, [location]);

  const onChangePage = (pagination) => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: pagination.current });
    history.push(`${location.pathname}?${params}`)
  }

  const onSearch = v => {
    // if (v.length < 2) {
    //   message.info('关键词太短，至少2个字符')
    //   console.log('Too short.')
    //   return false
    // }
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, search: v, page: 1 });
    history.push(`${location.pathname}?${params}`)
  }
  const onChangeGroupFilter = v => {
    const client_ids = []
    for (const group_id of v){
      const the_groups = groupList.filter(group=>group.id===parseInt(group_id))[0]
      if (the_groups){
        client_ids.push(the_groups.admins[0].id)
      }
    }
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, client_id: client_ids.join(','), page: 1 });
    history.push(`${location.pathname}?${params}`)
  }
  return (
    <>
      <Card>
        <Row gutter={16}>
          <Col xs={24} md={12} className='m-b:1'>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="选择小组"
              onChange={onChangeGroupFilter}
            >
              {groupList.map((group, index) =>
                <Option key={group.id}>{group.name}</Option>)
              }
            </Select>
          </Col>
          <Col xs={24} md={12} className='m-b:1'>
            <Search placeholder="输入企划标题关键词" onSearch={onSearch} allowClear enterButton />
          </Col>
        </Row>
        <Table
          columns={columns}
          rowKey={project => project.id}
          dataSource={projectList}
          loading={isloading}
          pagination={pagination}
          onChange={onChangePage}
          scroll={{ x: 800 }}
        />
      </Card>
    </>
  )
}

