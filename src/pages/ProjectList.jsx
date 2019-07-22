import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Row, Col, Button, Popconfirm } from 'antd'
import axios from 'axios'
import { parseStatus, getStage } from '../utility'
import queryString from 'query-string'
const SERVER_URL = window.SERVER_URL


export default function ProjectList({ location, history }) {

  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const columns = [
    {
      title: '企划名',
      dataIndex: 'title',
      width: '30%',
      render: (name, project) => {
        return <Link to={"/projects/" + project.id}>{name}</Link>
      }
    },
    {
      title: '目前阶段',
      dataIndex: 'current_stage_index',
      width: '10%',
      render: (index, project) => {
        const status = project.status
        if (status === 'finish' || status === 'discard') {
          return <span>{`${(index + 1).toString()}/${project.stages.length}`}</span>
        } else {
          return <span>{`${(index + 1).toString()}/${project.stages.length}：` + getStage(project).name}</span>
        }
      }
    },
    {
      title: '状态',
      render: (project) => {
        const status = project.status
        const str = parseStatus(status)
        let color = ''
        switch (status) {
          case 'await':
            color = 'cyan'
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
      width: '10%',
    },
    {
      title: '发起方',
      dataIndex: 'client.name',
      render: (name, project) => {
        return <Link to={"/users/" + project.client.id}>{name}</Link>
      },
      width: '10%',
    },
    {
      title: '制作方',
      dataIndex: 'creators',
      render: (creators, project) => creators.map((creator,index) =>(
        <Link className='m-r:.5' key={index} to={"/users/" + creator.id}>{creator.name}</Link>
      )),
      width: '10%',
    },
    {
      title: '删除',
      key: 'key2',
      render: (key, project) => (<>
          {project.status === 'discard'?(
            <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => operateProject(project.id, 'resume')}
            okText="是"
            cancelText="否"
          >
            <Button size='small'>恢复</Button>
          </Popconfirm>
          ):(
          <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => operateProject(project.id, 'discard')}
            okText="是"
            cancelText="否"
          >
            <Button size='small'>废弃</Button>
          </Popconfirm>
          )}
      </>),
      width: '15%',
    }
  ];

  const operateProject = (id, action) => {
    let url = SERVER_URL + '/api/projects/'+id
    let params = {
      action: action,
    }

    axios.put(url, {...params}, {
      withCredentials: true
    }).then(res => {
      console.log(res.data)
      history.push("/projects")
    }).catch(err => {
      if (err.response) console.log(err.response.data)
    })
  }

  useEffect(() => {
    setLoading(true)
    let url = SERVER_URL + '/api/projects'
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
          <Button type='primary'><Link to='/projects/post'>添加企划</Link></Button>
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

