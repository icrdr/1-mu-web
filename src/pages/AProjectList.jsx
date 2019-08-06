import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Row, Col, Button, Popconfirm, Checkbox, Divider, Radio, Input, message, Select, Modal, InputNumber } from 'antd'
import { parseStatus, getStage, fetchData, updateData, parseDate, timeLeft, parseTimeLeft } from '../utility'
import { meContext } from '../layouts/Dashboard';
import ProjectPostByCsv from '../components/ProjectPostByCsv'
import queryString from 'query-string'
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
export default function ProjectList({ location, history, match }) {
  const plainOptions = ['草稿', '未开始', '进行中', '修改中', '逾期中', '待确认', '已完成', '暂停', '废弃']

  const [projectList, setProjectList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [checkedList, setCheckedList] = useState(plainOptions);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);
  const [meFilter, setMefilter] = useState('all');
  const [update, setUpdate] = useState(false);
  const [showPostponeModel, setPostponeModel] = useState();
  const [postponeDay, setPostponeDay] = useState(3);
  const [showRemarkModel, setRemarkModel] = useState();
  const [remark, setRemark] = useState('');
  const { meData } = useContext(meContext);

  const columns = [
    {
      title: '企划名',
      dataIndex: 'title',
      width: '10%',
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
      width: '10%',
      render: (tags, project) => {
        return tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: '10%',
      render: (remark, project) => {
        return <div style={{ width: '120px' }}>
          {remark}
          <Button type="link" size='small' onClick={() => {
            setRemark(remark)
            setRemarkModel(project)
          }}>{remark ? '修改' : '添加'}</Button>
        </div>
      }
    },
    {
      title: '开始时间',
      dataIndex: 'start_date',
      render: (start_date, project) => {
        if (start_date) {
          return parseDate(start_date)
        } else {
          return '未开始'
        }
      },
      width: '10%',
    },
    {
      title: '目前阶段',
      dataIndex: 'current_stage_index',
      width: '10%',
      render: (index, project) => {
        const status = project.status
        const goBack = <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => operateProject(project.id, 'back')}
            okText="是"
            cancelText="否"
          >
            <Button type="link" size='small'>回溯</Button>
          </Popconfirm>
        switch (status) {
          case 'await':
            return <span>{`0/${project.stages.length}`}</span>
          case 'finish':
          case 'discard':
            return <span>{`${(index + 1).toString()}/${project.stages.length}`}{goBack}</span>
          default:
            return <span>{`${(index + 1).toString()}/${project.stages.length}：` + getStage(project).name}{goBack}</span>
        }
      }
    },
    {
      title: '死线',
      dataIndex: 'key',
      width: '10%',
      render: (index, project) => {
        const status = project.status
        switch (status) {
          case 'delay':
          case 'progress':
          case 'modify':
            const time_left = timeLeft(getStage(project))
            return <span style={{ color: time_left >= 0 ? '' : 'red' }}>{parseTimeLeft(time_left)}
              <Button type="link" size='small' onClick={() => setPostponeModel(project)}>延期</Button>
            </span>
          default:
            return ''
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
          case 'pause':
            color = 'cyan'
            break
          default:
            color = '#ddd'
        }
        return <Tag color={color} >{str}</Tag>
      },
      width: '5%',
    },

    {
      title: '小组',
      dataIndex: 'client',
      render: (client, project) =>
        <Select
          style={{ width: '100%', maxWidth: '120px' }}
          placeholder="选择小组"
          onChange={v => onChangeGroup(v, project)}
          value={client.name}
        >
          {groupList.map((item, index) =>
            <Option key={item.id}>{item.name}</Option>)
          }
        </Select>
      ,
      width: '10%',
    },
    {
      title: '制作者',
      dataIndex: 'creator',
      render: (creator, project) =>{
        const the_group = groupList.filter(group => {
          return group.admins[0].id === project.client.id
        })[0]
        return <Select
          style={{ width: '100%', maxWidth: '120px' }}
          placeholder="选择制作"
          onChange={v => onChangeCreator(v, project)}
          value={creator.name}
        >
          {the_group && the_group.users.map((item, index) =>
            <Option key={item.id}>{item.name}</Option>)
          }
        </Select>
      },
      width: '10%',
    },
    {
      title: '暂停',
      key: 'key2',
      render: (key, project) => (<>
        {project.status === 'pause' ? (
          <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => operateProject(project.id, 'resume')}
            okText="是"
            cancelText="否"
          >
            <Button type='primary' size='small'>恢复</Button>
          </Popconfirm>
        ) : (
            <Popconfirm
              title="确定如此操作么？"
              onConfirm={() => operateProject(project.id, 'pause')}
              okText="是"
              cancelText="否"
            >
              <Button size='small'>暂停</Button>
            </Popconfirm>
          )}
      </>),
      width: '3%',
    },
    {
      title: '删除',
      key: 'key3',
      render: (key, project) => (<>
        {project.status === 'discard' ? (
          <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => operateProject(project.id, 'resume')}
            okText="是"
            cancelText="否"
          >
            <Button type='primary' size='small'>撤销</Button>
          </Popconfirm>
        ) : (
            <Popconfirm
              title="确定如此操作么？"
              onConfirm={() => operateProject(project.id, 'discard')}
              okText="是"
              cancelText="否"
            >
              <Button size='small'>删除</Button>
            </Popconfirm>
          )}
      </>),
      width: '3%',
    }
  ];
  const onChangeGroup = (v, project) => {
    const the_group = groupList.filter(group => group.id === parseInt(v))[0]
    if (project.client.id === the_group.admins[0].id)return false

    const path = `/projects/${project.id}`
    const data = {
      client_id: the_group.admins[0].id,
      creator_id: the_group.admins[0].id,
    }
    
    updateData(path, data).then(res => {
      setUpdate(!update)
    })
  }
  const onChangeCreator = (v, project) => {
    if (project.creator.id === parseInt(v))return false
    const path = `/projects/${project.id}`
    const data = {
      creator_id: v,
    }
    updateData(path, data).then(res => {
      setUpdate(!update)
    })
  }

  const operateProject = (id, action) => {
    const path = `/projects/${id}/${action}`
    updateData(path).then(res => {
      setUpdate(!update)
    })
  }

  useEffect(() => {
    setLoading(true)
    let path = '/groups'

    fetchData(path).then(res => {
      setGroupList(res.data.groups)
    })
    path = '/projects'
    const status = checkedList.join(',')
      .replace('草稿', 'draft')
      .replace('未开始', 'await')
      .replace('进行中', 'progress')
      .replace('修改中', 'modify')
      .replace('逾期中', 'delay')
      .replace('待确认', 'pending')
      .replace('已完成', 'finish')
      .replace('暂停', 'pause')
      .replace('废弃', 'discard')
    const params = {
      order: 'desc',
      order_by: 'status',
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
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: 1 });
    history.push(`${location.pathname}?${params}`)
  }

  const onSearch = v => {
    if (v.length < 2 && v.length !== 0) {
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
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: 1 });
    history.push(`${location.pathname}?${params}`)
  }

  const onCheckAllStatusFilter = e => {
    setCheckAll(e.target.checked)
    setCheckedList(e.target.checked ? plainOptions : [])
    setIndeterminate(false)
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: 1 });
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
  const handlePostpone = () => {
    const path = `/projects/${showPostponeModel.id}/postpone`
    const data = {
      days: postponeDay
    }
    updateData(path, data).then(res => {
      setUpdate(!update)
      setPostponeModel()
      setPostponeDay(3)
    })
  }

  const handleRemark = () => {
    console.log(remark)
    const path = `/projects/${showRemarkModel.id}`
    const data = {
      remark: remark
    }
    updateData(path, data).then(res => {
      setUpdate(!update)
      setRemarkModel()
    })
  }

  return (
    <Card>
      <Modal
        title="备注"
        visible={showRemarkModel !== undefined}
        onOk={handleRemark}
        onCancel={() => setRemarkModel()}
      >
        备注  <TextArea
          placeholder="备注说明"
          autosize={{ minRows: 2, maxRows: 6 }}
          value={remark} onChange={e => {
            e.persist()
            setRemark(e.target.value)
          }} />
      </Modal>
      <Modal
        title="延期"
        visible={showPostponeModel !== undefined}
        onOk={handlePostpone}
        onCancel={() => setPostponeModel()}
      >
        延期时间  <InputNumber value={postponeDay} onChange={v => setPostponeDay(v)} />
      </Modal>
      <Row gutter={16}>
        <Col md={12} className='m-b:1'>
          <Button type='primary'><Link to='/admin/projects/post'>添加企划</Link></Button>
        </Col>
        <Col md={12} className='m-b:1'>
          <ProjectPostByCsv />
        </Col>
      </Row>
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

