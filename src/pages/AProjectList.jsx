import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Row, Col, Button, Popconfirm, Checkbox, Divider, Radio, Input, message } from 'antd'
import { parseStatus, getStage, fetchData, updateData } from '../utility'
import { meContext } from '../layouts/Dashboard';
import ProjectPostByCsv from '../components/ProjectPostByCsv'
import queryString from 'query-string'
const { Search } = Input;

export default function ProjectList({ location, history, match }) {
  const plainOptions = ['草稿', '未开始', '进行中', '修改中', '逾期中', '待确认', '已完成', '异常']

  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [checkedList, setCheckedList] = useState(plainOptions);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);
  const [meFilter, setMefilter] = useState('all');
  const [update, setUpdate] = useState(false);
  const { meData } = useContext(meContext);

  const columns = [
    {
      title: '企划名',
      dataIndex: 'title',
      width: '20%',
      render: (name, project) => {
        let link_url = ''
        switch (project.status) {
          case 'draft':
          case 'await':
            link_url = `${match.path}/${project.id}/design`
            break;
          case 'finish':
            link_url = `${match.path}/${project.id}/done`
            break;
          default:
            link_url = `${match.path}/${project.id}/stages/${project.current_stage_index}`
            break;
        }
        return <Link to={link_url}>{name}</Link>
      }
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: '20%',
      render: (tags, project) => {
        return tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)
      }
    },
    {
      title: '目前阶段',
      dataIndex: 'current_stage_index',
      width: '10%',
      render: (index, project) => {
        const status = project.status
        switch (status) {
          case 'await':
            return <span>{`0/${project.stages.length}`}</span>
          case 'finish':
          case 'discard':
            return <span>{`${(index + 1).toString()}/${project.stages.length}`}</span>
          default:
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
            color = 'orange'
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
            color = '#ddd'
        }
        return <Tag color={color} >{str}</Tag>
      },
      width: '5%',
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
      render: (creators, project) => creators.map((creator, index) => (
        <Link className='m-r:.5' key={index} to={"/users/" + creator.id}>{creator.name}</Link>
      )),
      width: '10%',
    },
    {
      title: '删除',
      key: 'key2',
      render: (key, project) => (<>
        {project.status === 'discard' ? (
          <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => operateProject(project.id, 'resume')}
            okText="是"
            cancelText="否"
          >
            <Button size='small'>恢复</Button>
          </Popconfirm>
        ) : (
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
      width: '5%',
    }
  ];

  const operateProject = (id, action) => {
    const path = `/projects/${id}/${action}`
    updateData(path).then(res => {
      setUpdate(!update)
    })
  }

  useEffect(() => {
    setLoading(true)
    const path = '/projects'
    const status = checkedList.join(',')
      .replace('草稿', 'draft')
      .replace('未开始', 'await')
      .replace('进行中', 'progress')
      .replace('修改中', 'modify')
      .replace('逾期中', 'delay')
      .replace('待确认', 'pending')
      .replace('已完成', 'finish')
      .replace('异常', 'abnormal')
    const params = {
      order: 'desc',
      pre_page: pagination.pageSize,
      status: status,
    }
    switch (meFilter) {
      case 'client':
        params.client_id = meData.id
        break;
      case 'creator':
        params.creator_id = meData.id
        break;
      default:
    }
    
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
    }).catch(err => {
      setProjectList([])
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, checkedList, meFilter, update]);

  const onChangePage = (pagination) => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: pagination.current });
    history.push(`${location.pathname}?${params}`)
  }

  const onChangeMeFilter = e => {
    setMefilter(e.target.value)
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
  const onChangeStatusFilter = checkedList => {
    setCheckedList(checkedList)
    setCheckAll(checkedList.length === plainOptions.length)
    setIndeterminate(!!checkedList.length && checkedList.length < plainOptions.length)
  }

  const onCheckAllStatusFilter = e => {
    setCheckAll(e.target.checked)
    setCheckedList(e.target.checked ? plainOptions : [])
    setIndeterminate(false)
  }

  return (
    <Card>
      <Row gutter={16}>
        <Col xs={8} md={4} className='m-b:1'>
          <Button type='primary'><Link to='/admin/projects/post'>添加企划</Link></Button>
        </Col>
        <Col xs={16} md={10} className='m-b:1'>
          <ProjectPostByCsv />
        </Col>
        <Col xs={24} md={10} className='m-b:1'>
          <Search placeholder="输入企划标题关键词" onSearch={onSearch} allowClear enterButton />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={8} className='m-b:1'>
          <Radio.Group value={meFilter} onChange={onChangeMeFilter}>
            <Radio value='all'>全部</Radio>
            <Radio value='client'>我作为发起方</Radio>
            <Radio value='creator'>我作为制作方</Radio>
          </Radio.Group>
        </Col>
        <Col xs={24} md={16} className='m-b:1'>
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllStatusFilter}
            checked={checkAll}
          >
            全选
          </Checkbox>
          <Divider type="vertical" />
          <Checkbox.Group
            options={plainOptions}
            value={checkedList}
            onChange={onChangeStatusFilter}
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        rowKey={project => project.id}
        dataSource={projectList}
        loading={isloading}
        pagination={pagination}
        onChange={onChangePage}
      />
    </Card>
  )
}
