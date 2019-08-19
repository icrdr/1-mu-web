import React, { useEffect, useState, useContext } from 'react'
import moment from 'moment';
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Row, Col, Input, Button, Icon, Select, Radio, DatePicker } from 'antd'
import { parseStatus, getStage, fetchData, parseDate, timeLeft, parseTimeLeft, updateData } from '../utility'
import { meContext } from '../layouts/Web';
import queryString from 'query-string'
import Ganttx from '../components/Ganttx';
import { useMediaQuery } from 'react-responsive'
const {RangePicker} = DatePicker;
const { Option } = Select;
export default function Main({ location, history }) {
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [tableSorter, setTableSorter] = useState({});
  const [tableFilter, setTableFilter] = useState({});
  const [tableSearch, setTableSearch] = useState({});
  const [tableDate, setTableDate] = useState({});
  const allTableFilter = { status: [], creator_id:[], current_stage_index:[]}
  const allTableSearch = { title: [],tags: [] }
  const allTableDate = {start_date: []}
  const [projectList, setProjectList] = useState([]);
  const [projectList2, setProjectList2] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [isloading2, setLoading2] = useState(false);
  
  const [update, setUpdate] = useState(false);
  const [meFilter, setMefilter] = useState('creator');
  const [memberList, setMemberList] = useState([]);
  const [adminIds, setAdminIds] = useState([]);

  const { meData } = useContext(meContext);

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
    filterIcon: () => (
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
            link_url = `/projects/${project.id}/design`
            break;
          case 'finish':
            link_url = `/projects/${project.id}/done`
            break;
          default:
            link_url = `/projects/${project.id}/stages/${project.current_stage_index}`
            break;
        }
        return <Link to={link_url} className='dont-break-out'>{name}</Link>
      }
    },
    {
      title: '标签',
      dataIndex: 'tags',
      ...getColumnSearchProps('tags'),
      width: 250,
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
      width: 200,
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
      width: 200,
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
      title: '死线',
      dataIndex: 'ddl',
      width: 160,
      render: (index, project) => {
        const status = project.status
        switch (status) {
          case 'delay':
          case 'progress':
          case 'modify':
            const time_left = timeLeft(getStage(project))
            return <span style={{ color: time_left >= 0 ? '' : 'red' }}>{parseTimeLeft(time_left)}</span>
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
      width: 140,
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
          case 'pause':
            color = 'cyan'
            break
          case 'delay':
            color = 'red'
            break
          default:
            color = '#ddd'
        }
        return <Tag color={color} >{str}</Tag>
      },
    },

    {
      title: '制作者',
      dataIndex: 'creator_id',
      sorter: true,
      sortOrder: tableSorter['creator_id'],
      sortDirections: ['descend', 'ascend'],
      filters: memberList.map((creator) => { return { text: creator.name, value: creator.id } }),
      filteredValue: tableFilter['creator_id'] || [],
      width: 200,
      render: (creator_id, project) => {
        const creator = project.creator
        if (project.client.id === meData.id) {
          return <Select
            style={{ width: '100%'}}
            placeholder="选择小组"
            onChange={v => handleChangeCreator(v, project)}
            value={creator.name}
          >
            {memberList.map((item) =>
              <Option key={item.id}>{item.name}</Option>)
            }
          </Select>
        } else {
          return <Link to={"/users/" + creator.id}>{creator.name}</Link>
        }
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
    }
  ]
  
  useEffect(() => {
    setLoading(true)
    const path = '/groups'
    const group_ids = []
    for (const group of meData.groups) {
      group_ids.push(group.id)
    }
    const params = {
      include: group_ids.join(',')
    }
    fetchData(path, params).then(res => {
      const new_memberList = []
      const member_ids = []
      const admin_ids = []
      for (const group of res.data.groups) {
        for (const member of group.users) {
          if (member_ids.indexOf(member.id) === -1) {
            new_memberList.push(member)
            member_ids.push(member.id)
          }
        }
        for (const admin of group.admins) {
          admin_ids.push(admin.id)
        }
      }
      setMemberList(new_memberList)
      setAdminIds(admin_ids)
      setUpdate(!update)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (adminIds.length > 0) {
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
      
      if (!values.creator_id){
        params.creator_id = memberList.map((creator) => { return creator.id}).join(',')
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

  useEffect(() => {
    setLoading2(true)
    setProjectList2([])
    const path = '/projects'
    const params = {
      order: 'desc',
      pre_page: 20,
      status: 'progress,modify,delay,pending',
      order_by: 'status',
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
    fetchData(path, params).then(res => {
      setProjectList2(res.data.projects)
    }).catch(() => {
      setProjectList2([])
    }).finally(() => {
      setLoading2(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meFilter]);

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

  return (
    <>
      <Card className='m-b:2'>
        <Row gutter={16} className='m-b:1'>
          <Col xs={24} md={12} className='t-a:l'>
            <h2>进度可视化</h2>
          </Col>
          <Col xs={24} md={12} className='t-a:r'>
            <Radio.Group value={meFilter} onChange={e => setMefilter(e.target.value)}>
              <Radio value='client'>我作为发起方</Radio>
              <Radio value='creator'>我作为制作方</Radio>
            </Radio.Group>
          </Col>
        </Row>
        <Ganttx loading={isloading2} projects={projectList2} />
      </Card>

      <Card >
        <Table
          columns={columns}
          rowKey={project => project.id}
          dataSource={projectList}
          loading={isloading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1600 }}
        />
      </Card>

    </>
  )
}

