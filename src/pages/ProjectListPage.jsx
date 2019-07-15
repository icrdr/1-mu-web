import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Row, Col, Button } from 'antd'
import axios from 'axios'
import { parseStatus, getPhase, getStage } from '../utility'
import queryString from 'query-string'
const DOMAIN_URL = window.DOMAIN_URL

const columns = [
  {
    title: '企划名',
    dataIndex: 'name',
    width: '20%',
    render: (name, project) => {
      return <Link to={"/projects/" + project.id}>{name}</Link>
    }
  },
  {
    title: '状态',
    render: (project) => {
      const status = getPhase(getStage(project)).status
      const str = parseStatus(status)
      let color = ''
      switch (status) {
        case 'await':
          color = 'grey'
          break
        case 'finish':
          color = 'green'
          break
        case 'pending':
          color = 'cyan'
          break
        case 'progress':
          color = 'blue'
          break
        case 'modify':
          color = 'blue'
          break
        case 'discard':
          color = 'grey'
          break
        case 'abnormal':
          color = 'purple'
          break
        case 'delay':
          color = 'red'
          break
        default:
          color = '#eee'
      }
      return <Tag color={color} >{str}</Tag>
    },
    width: '20%',
  },
  {
    title: '发起方',
    dataIndex: 'client.name',
    render: (name, project) => {
      return <Link to={"/users/" + project.client.id}>{name}</Link>
    }
  },
  {
    title: '制作方',
    dataIndex: 'creator.name',
    render: (name, project) => {
      return <Link to={"/users/" + project.creator.id}>{name}</Link>
    }
  },
  {
    title: '操作',
    dataIndex: 'id',
    render: (id) => (
      <Link to={"/projects/" + id}>详情</Link>
    ),
  }
];

export default function ProjectListPage({ location, history }) {

  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });

  useEffect(() => {
    setLoading(true)
    let url = DOMAIN_URL + '/api/projects'
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

    axios.get(url, {
      params: params,
      withCredentials: true
    }).then(res => {
      console.log(res.data)
      setProjectList(res.data.projects)
      setPagination(prevState => { return { ...prevState, total: res.data.total } })
      setLoading(false)
    }).catch(err => {
      if (err.response) console.log(err.response.data)
      setProjectList([])
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const changePage = (pagination) => {
    const params = queryString.stringify({ page: pagination.current });
    history.push("/projects?" + params)
  }

  return (
    <Card>
      <Row>
        <Col>
          <Button type='primary'><Link to='/projects/add'>添加企划</Link></Button>
        </Col>
      </Row>
      <Table
        className='m-t:2'
        columns={columns}
        rowKey={project => project.id}
        dataSource={projectList}
        loading={isloading}
        pagination={pagination}
        onChange={changePage}
      />
    </Card>
  )
}

