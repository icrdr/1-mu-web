import React, { useEffect, useState, useContext } from 'react'
import moment from 'moment';
import { Link } from 'react-router-dom'
import { Table, Card, Tag, Input, Button, Icon, DatePicker, Divider } from 'antd'
import { getStage, fetchData, parseDate, timeLeft, parseTimeLeft } from '../utility'
import { globalContext } from '../App';
import queryString from 'query-string'
import StatusTag from '../components/projectPage/StatusTag'
import StageShow from '../components/projectPage/StageShow'

const { RangePicker } = DatePicker;

export default function Main({ location, history }) {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [tableSorter, setTableSorter] = useState({});
  const [tableFilter, setTableFilter] = useState({});
  const [tableSearch, setTableSearch] = useState({});
  const [tableDate, setTableDate] = useState({});
  const allTableFilter = { status: [], creator_id: [], current_stage_index: [] }
  const allTableSearch = { title: [], tags: [] }
  const allTableDate = { start_date: [] }
  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);

  const { isSm } = useContext(globalContext);

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: () => (
      <div>
        <div className='p:.8'>
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
            style={{ width: 188, display: 'block' }}
          />
        </div>
        <Divider className='m-y:0' />
        <div className='p-y:.6 p-x:.1'>
          <Button
            type="link"
            onClick={() => handleSearch(dataIndex, tableSearch[dataIndex])}
            size="small"
          >
            OK
        </Button>
          <Button className='fl:r' type="link" onClick={() => handleSearch(dataIndex, '')} size="small">
            Reset
        </Button>
        </div>
      </div>
    ),
    filterIcon: () => (
      <Icon type="edit" theme="filled" style={{ color: tableSearch[dataIndex] ? '#1890ff' : undefined }} />
    )
  })

  const getColumnDateProps = dataIndex => ({
    filterDropdown: () => (
      <div>
        <div className='p:.8'>
        <RangePicker onChange={dates => {
          setTableDate(prevState => {
            prevState[dataIndex] = dates
            return { ...prevState }
          })
        }}
          value={tableDate[dataIndex]}
          style={{ width: 218, display: 'block' }} />
        </div>
        <Divider className='m-y:0' />
        <div className='p-y:.6 p-x:.1'>
        <Button
          type="link"
          onClick={() => handleDateRange(dataIndex, tableDate[dataIndex])}
          size="small"
        >
          OK
        </Button>
        <Button className='fl:r' type="link" onClick={() => handleDateRange(dataIndex, [])} size="small">
          Reset
        </Button>
        </div>
      </div>
    ),
    filterIcon: () => (
      <Icon type="calendar" theme="filled" style={{ color: tableDate[dataIndex] ? '#1890ff' : undefined }} />
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
      fixed: 'left'
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
      render: (index, project) => <StageShow project={project}/>
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
      render: (status) => <StatusTag status={status}/>
    },
    {
      title: '审核者',
      dataIndex: 'client_id',
      sorter: true,
      sortOrder: tableSorter['client_id'],
      sortDirections: ['descend', 'ascend'],
      width: 200,
      render: (client_id, project) => {
        return <Link to={"/users/" + project.client.id}>{project.client.name}</Link>
      },
    },
    {
      title: '制作者',
      dataIndex: 'creator_id',
      sorter: true,
      sortOrder: tableSorter['creator_id'],
      sortDirections: ['descend', 'ascend'],
      width: 200,
      render: (creator_id, project) => {
        return <Link to={"/users/" + project.creator.id}>{project.creator.name}</Link>
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
    }
  ]

  useEffect(() => {
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
          new_tableDate[filter] = values[filter].split(',').map(date_str => { return moment.utc(date_str, 'YYYY-MM-DD HH:mm:ss').local() })
          params[filter] = values[filter]
        }
      }
      setTableDate(new_tableDate)

      fetchData(path, params).then(res => {
        setProjectList(res.data.projects)
        setPagination(prevState => { return { ...prevState, total: res.data.total } })
      }).catch(() => {
        setProjectList([])
      }).finally(() => {
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

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

  const handleDateRange = (dataIndex, dates) => {
    const values = queryString.parse(location.search)
    const paramsObject = {
      ...values,
      page:1
    }
    if (dates.length === 2) {
      const dates_str = dates.map(date => {
        return moment(date.format('YYYY-MM-DD')).utc().format('YYYY-MM-DD HH:mm:ss')
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
      ...values,
      page:1
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
      <Card bodyStyle={{padding:isSm?'24px 8px':''}}>
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

