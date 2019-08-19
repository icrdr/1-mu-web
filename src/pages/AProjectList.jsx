import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Button, Popconfirm, Input, Select, Modal, InputNumber, Icon, Progress,message,DatePicker  } from 'antd'
import { parseStatus, getStage, fetchData, updateData, parseDate, timeLeft, parseTimeLeft } from '../utility'
import ProjectPostByCsv from '../components/ProjectPostByCsv'
import queryString from 'query-string'
import { useMediaQuery } from 'react-responsive'
import useInterval from '../hooks/useInterval'
const { Option } = Select;
const { TextArea } = Input;
const {RangePicker} = DatePicker;

export default function ProjectList({ location, history, match }) {
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [tableSorter, setTableSorter] = useState({});
  const [tableFilter, setTableFilter] = useState({});
  const [tableSearch, setTableSearch] = useState({});
  const [tableDate, setTableDate] = useState({});
  const [taskId, setTaskId] = useState('');
  const allTableFilter = { status: [], client_id: [], current_stage_index:[] }
  const allTableSearch = { title: '',tags: '' }
  const allTableDate = {start_date: []}
  const [projectList, setProjectList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isloading, setLoading] = useState(false);

  const [update, setUpdate] = useState(false);
  const [showPostponeModel, setPostponeModel] = useState();
  const [postponeDay, setPostponeDay] = useState(3);
  const [showRemarkModel, setRemarkModel] = useState();
  const [remark, setRemark] = useState('');

  const [isBatch, setBatch] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [isZipping, setZipping] = useState(false)
  const [taskData, setTaskData] = useState()

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: () => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder='输入关键词'
          value={tableSearch[dataIndex]}
          onChange={e => {
            e.persist()
            setTableSearch(prevState => {
              prevState[dataIndex] = e.target.value ? e.target.value : ''
              return { ...prevState }
            })
          }}
          onPressEnter={() => handleSearch(dataIndex, tableSearch[dataIndex])}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        
        <Button
          type="primary"
          onClick={() => handleSearch(dataIndex, tableSearch[dataIndex])}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => handleSearch(dataIndex, '')} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: tableSearch[dataIndex] ? '#1890ff' : undefined }} />
    )
  })

  const getColumnDateProps = dataIndex => ({
    filterDropdown: () => (
      <div style={{ padding: 8 }}>
        <RangePicker onChange={dates=>{
          setTableDate(prevState => {
              prevState[dataIndex] = dates
              return { ...prevState }
            })
          }}
          value={tableDate[dataIndex]}
          style={{ width: 218, marginBottom: 8, display: 'block' }}/>
        <Button
          type="primary"
          onClick={() => handleDateRange(dataIndex, tableDate[dataIndex])}
          size="small"
          style={{ width: 105, marginRight: 8 }}
        >
          Confirm
        </Button>
        <Button onClick={() => handleDateRange(dataIndex, [])} size="small" style={{ width: 105 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="calendar" style={{ color: tableDate[dataIndex] ? '#1890ff' : undefined }} />
    )
  })

  const columns = [
    {
      title: '企划名',
      dataIndex: 'title',
      width: isSm ? 150 : 200,
      sorter: true,
      sortOrder: tableSorter['title'],
      sortDirections: ['descend', 'ascend'],
      ...getColumnSearchProps('title'),
      fixed: 'left',
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
        return <Link to={link_url} className='dont-break-out'>{name}</Link>
      }
    },
    {
      title: '标签',
      dataIndex: 'tags',
      ...getColumnSearchProps('tags'),
      width: 120,
      render: (tags) => {
        return tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)
      }
    },
    {
      title: '开始时间',
      dataIndex: 'start_date',
      sorter: true,
      sortOrder: tableSorter['start_date'],
      sortDirections: ['descend', 'ascend'],
      ...getColumnDateProps('start_date'),
      width: 150,
      render: (start_date) => {
        if (start_date) {
          return parseDate(start_date)
        } else {
          return '未开始'
        }
      },
    },
    {
      title: '目前阶段',
      dataIndex: 'current_stage_index',
      sorter: true,
      sortOrder: tableSorter['current_stage_index'],
      sortDirections: ['descend', 'ascend'],
      filters: [
        { text: '参考-草图', value: 0 },
        { text: '线稿-铺色', value: 1 },
        { text: '细化-特效', value: 2 },
      ],
      filteredValue: tableFilter['current_stage_index'] || [],
      width: 150,
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
      key: 'ddl',
      width: 120,
      render: (project) => {
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
      dataIndex: 'status',
      sorter: true,
      sortOrder: tableSorter['status'],
      sortDirections: ['descend', 'ascend'],
      filters: [
        { text: '草稿', value: 'draft' },
        { text: '未开始', value: 'await' },
        { text: '进行中', value: 'progress' },
        { text: '修改中', value: 'modify' },
        { text: '逾期中', value: 'delay' },
        { text: '待确认', value: 'pending' },
        { text: '已完成', value: 'finish' },
        { text: '暂停', value: 'pause' },
        { text: '废弃', value: 'discard' },
      ],
      filteredValue: tableFilter['status'] || [],
      width: 100,
      render: (status) => {
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
      }
    },
    {
      title: '小组',
      dataIndex: 'client_id',
      sorter: true,
      sortOrder: tableSorter['client_id'],
      sortDirections: ['descend', 'ascend'],
      filters: groupList.map((group, index) => { return { text: group.name, value: index } }),
      filteredValue: tableFilter['client_id'] || [],
      width: 200,
      render: (client_id, project) =>
        <Select
          style={{ width: '100%', maxWidth: '120px' }}
          placeholder="选择小组"
          onChange={v => handleChangeGroup(v, project)}
          value={project.client.name}
        >
          {groupList.map((item) =>
            <Option key={item.id}>{item.name}</Option>)
          }
        </Select>
    },
    {
      title: '制作者',
      dataIndex: 'creator_id',
      sorter: true,
      sortOrder: tableSorter['creator_id'],
      sortDirections: ['descend', 'ascend'],
      width: 200,
      render: (creator_id, project) => {
        const creator = project.creator
        const the_group = groupList.filter(group => {
          return group.admins[0].id === project.client.id
        })[0]
        return <Select
          style={{ width: '100%', maxWidth: '120px' }}
          placeholder="选择制作"
          onChange={v => handleChangeCreator(v, project)}
          value={creator.name}
        >
          {the_group && the_group.users.map((item) =>
            <Option key={item.id}>{item.name}</Option>)
          }
        </Select>
      }
    },
    {
      title: '暂停',
      key: 'pause',
      width: 80,
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

    },
    {
      title: '删除',
      key: 'discard',
      width: 50,
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
    },
    {
      title: '备注',
      dataIndex: 'remark',
      render: (remark, project) => {
        return <div>
          {remark}
          <Button type="link" size='small' onClick={() => {
            setRemark(remark)
            setRemarkModel(project)
          }}>{remark ? '修改' : '添加'}</Button>
        </div>
      }
    },
  ];

  const handleChangeGroup = (v, project) => {
    const the_group = groupList.filter(group => group.id === parseInt(v))[0]
    if (project.client.id === the_group.admins[0].id) return false

    const path = `/projects/${project.id}`
    const data = {
      client_id: the_group.admins[0].id,
      creator_id: the_group.admins[0].id,
    }

    updateData(path, data).then(() => {
      setUpdate(!update)
    })
  }

  const handleChangeCreator = (v, project) => {
    if (project.creator.id === parseInt(v)) return false
    const path = `/projects/${project.id}`
    const data = {
      creator_id: v,
    }
    updateData(path, data).then(() => {
      setUpdate(!update)
    })
  }

  const operateProject = (id, action) => {
    const path = `/projects/${id}/${action}`
    updateData(path).then(() => {
      setUpdate(!update)
    })
  }
  useEffect(() => {
    setLoading(true)
    const path = '/groups'

    fetchData(path).then(res => {
      setGroupList(res.data.groups)
      setUpdate(!update)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (groupList.length > 0) {
      setLoading(true)
      const path = '/projects'
      const params = {
        pre_page: pagination.pageSize,
      }

      const values = queryString.parse(location.search)
      if (values.page) {
        setPagination(prevState => { return { ...prevState, current: parseInt(values.page) } })
        params.page = values.page
      } else {
        params.page = pagination.current
      }

      const new_tableSorter = {}
      if (values.order) {
        new_tableSorter[values.order_by] = values.order === "desc" ? 'descend' : 'ascend'
        params.order = values.order
        params.order_by = values.order_by
      } else {
        params.order = 'desc'
        params.order_by = 'status'
      }
      setTableSorter(new_tableSorter)

      const new_tableFilter = {}
      for (const filter in allTableFilter) {
        if (filter in values) {
          new_tableFilter[filter] = values[filter].split(',')
          params[filter] = values[filter]
        }
      }
      setTableFilter(new_tableFilter)

      const new_tableSearch = {}
      for (const filter in allTableSearch) {
        if (filter in values) {
          new_tableSearch[filter] = values[filter]
          params[filter] = values[filter]
        }
      }
      setTableSearch(new_tableSearch)

      const new_tableDate = {}
      for (const filter in allTableDate) {
        if (filter in values) {
          new_tableDate[filter] = values[filter].split(',').map(date_str=>{return moment.utc(date_str,'YYYY-MM-DD').local()})
          params[filter] = values[filter]
        }
      }
      setTableDate(new_tableDate)

      if (values.client_id) {
        const client_ids = []
        for (const group_index of values.client_id.split(',')) {
          const the_groups = groupList[group_index]
          if (the_groups) {
            for (const admin of the_groups.admins) {
              client_ids.push(admin.id)
            }
          }
        }
        if (client_ids.length > 0) params.client_id = client_ids.join(',')
      }

      fetchData(path, params).then(res => {
        setProjectList(res.data.projects)
        setPagination(prevState => { return { ...prevState, total: res.data.total } })
      }).catch(() => {
        setProjectList([])
      }).finally(() => {
        setLoading(false)
      })

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, update]);

  const handleTableChange = (pagination, filters, sorter) => {
    const values = queryString.parse(location.search)

    const paramsObject = {
      ...values,
      page: pagination.current,
    }

    if (Object.keys(sorter).length !== 0) {
      paramsObject.order = sorter.order === "descend" ? 'desc' : 'asc'
      paramsObject.order_by = sorter.field
    } else {
      delete paramsObject.order
      delete paramsObject.order_by
    }

    for (const filter in filters) {
      if (filters[filter].length !== 0) {
        paramsObject[filter] = filters[filter].join(',')
      } else {
        delete paramsObject[filter]
      }
    }
    // console.log(paramsObject)
    const params = queryString.stringify(paramsObject);
    history.push(`${location.pathname}?${params}`)
  }

  const handleSearch = (dataIndex, keyWord) => {
    const values = queryString.parse(location.search)
    const paramsObject = {
      ...values
    }
    if (keyWord) {
      paramsObject[dataIndex] = keyWord
    } else {
      delete paramsObject[dataIndex]
    }
    const params = queryString.stringify(paramsObject);
    history.push(`${location.pathname}?${params}`)
  }

  const handleDateRange = (dataIndex, dates) => {
    const values = queryString.parse(location.search)
    const paramsObject = {
      ...values
    }
    if (dates.length===2) {
      const dates_str = dates.map(date=>{
        return moment.utc(date).format('YYYY-MM-DD')
      }).join(',')
      paramsObject[dataIndex] = dates_str
    } else {
      delete paramsObject[dataIndex]
    }
    const params = queryString.stringify(paramsObject);
    history.push(`${location.pathname}?${params}`)
  }

  const handlePostpone = () => {
    const path = `/projects/${showPostponeModel.id}/postpone`
    const data = {
      days: postponeDay
    }

    updateData(path, data).then(() => {
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
    updateData(path, data).then(() => {
      setUpdate(!update)
      setRemarkModel()
    })
  }

  const onSelectChange = selectedRowKeys => {
    setSelectedRowKeys(selectedRowKeys)
  }

  const handleDownload = () => {
    setZipping(true)
    const path = '/download/projects'
    const params = {
      project_id: selectedRowKeys.join(',')
    }
    fetchData(path, params).then(res => {
      console.log(res)
      setTaskId(res.data.task_id)
    })
  }

  useInterval(() => {
    const path = '/download/zip/' + taskId
    fetchData(path).then(res => {
      setTaskData(res.data)
      switch (res.data.state) {
        case 'SUCCESS':
          setZipping(false)
          setTaskId()
          setTaskData()
          window.location.href = res.data.result.result
          break
        case 'FAILURE':
          setZipping(false)
          setTaskId()
          setTaskData()
          message.error('未知错误')
          break
        default:
          break;
      }

    }).finally(() => {
    })
  }, taskId ? 2000 : null);

  const progressRender = task => {
    switch (task.state) {
      case 'PENDING':
        return <Progress percent={0} format={() => '等待中'} />
      case 'PROGRESS':
        return <Progress percent={task.result.current / task.result.total * 100} />
      case 'SUCCESS':
        return <Progress percent={100} format={() => '成功'} />
      default:
        return ''
    }
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
      <div className='m-b:1'>
        <Button className='m-r:.5' type={isBatch ? "" : 'link'} onClick={() => setBatch(!isBatch)}>批量操作</Button>
        <Button className='m-r:.5' type='primary'><Link to='/admin/projects/post'>添加企划</Link></Button>
        <ProjectPostByCsv onSucceed={() => setUpdate(!update)} />
      </div>
      {isBatch &&
        <div className='m-b:1'>
          <Button className='m-r:.5' type="primary" onClick={handleDownload} disabled={selectedRowKeys.length === 0 || isZipping}>批量下载成品</Button>
          <Button className='m-r:.5' type="primary" disabled={selectedRowKeys.length === 0}>批量执行A</Button>
          <Button className='m-r:.5' type="primary" disabled={selectedRowKeys.length === 0}>批量执行B</Button>
        </div>
      }
      {taskId && <div className='m-b:1'>
        压缩文件中...{taskData && progressRender(taskData)}
      </div>}
      <Table
        rowSelection={
          isBatch ? {
            columnWidth: isSm ? 48 : 60,
            selectedRowKeys,
            onChange: onSelectChange
          } : undefined}
        columns={columns}
        rowKey={project => project.id}
        dataSource={projectList}
        loading={isloading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1600 }}
      />
    </Card>
  )
}

