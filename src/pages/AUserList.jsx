import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Transfer, Table, Card, Popconfirm, Button, Progress, message, Modal, Radio, DatePicker } from 'antd'
import { fetchData, deleteData, getMonthRange, getWeekRange, getYearRange, getQuarterRange } from '../utility'
import queryString from 'query-string'
import moment from 'moment';
import Avatarx from '../components/Avatarx'
import { globalContext } from '../App';
import useInterval from '../hooks/useInterval'
const { RangePicker } = DatePicker;
export default function UserList({ location, history }) {
  const { isSm } = useContext(globalContext);
  const [userList, setUserList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [update, setUpdate] = useState(false);
  const [taskId, setTaskId] = useState('');

  const [isBatch, setBatch] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showTableModel, setTableModel] = useState(false);
  const [isZipping, setZipping] = useState(0)
  const [taskData, setTaskData] = useState()
  const [transferTargetKeys, setTransferTargetKeys] = useState([])

  const [dateRangeFilter, setDateRangeFilter] = useState(getMonthRange(new Date()).join(','));
  const [dateFilter, setDatefilter] = useState('month');

  const headerData = [
    {
      key: 'id',
      title: 'ID',
    },
    {
      key: 'name',
      title: '昵称',
    },
    {
      key: 'score',
      title: '总分',
    },
    {
      key: 'speed',
      title: '手速',
    },
    {
      key: 'power',
      title: '绘力',
    },
    {
      key: 'knowledge',
      title: '学识',
    },
    {
      key: 'energy',
      title: '活力',
    },
    {
      key: 'contribution',
      title: '贡献',
    },
    {
      key: 'phases_all',
      title: '所有发起的提交数',
    },
    {
      key: 'phases_pass',
      title: '审核通过的提交数',
    },
    {
      key: 'phases_modify',
      title: '审核不通过的提交数',
    },
    {
      key: 'phases_pending',
      title: '未审核的提交数',
    },
    {
      key: 'stages_all',
      title: '企划进度',
    },
    {
      key: 'stages_one_pass',
      title: '一次通过的阶段数（总）',
    },
    {
      key: 'stages_mod_pass',
      title: '修改通过的阶段数（总）',
    },
    {
      key: 'stages_no_pass',
      title: '尚未通过的阶段数（总）',
    },
    {
      key: 'stages_one_pass_c',
      title: '一次通过的阶段数（成图）',
    },
    {
      key: 'stages_mod_pass_c',
      title: '修改通过的阶段数（成图）',
    },
    {
      key: 'stages_no_pass_c',
      title: '尚未通过的阶段数（成图）',
    },
    {
      key: 'stages_one_pass_d',
      title: '一次通过的阶段数（草图）',
    },
    {
      key: 'stages_mod_pass_d',
      title: '修改通过的阶段数（草图）',
    },
    {
      key: 'stages_no_pass_d',
      title: '尚未通过的阶段数（草图）',
    },
    {
      key: 'files_ref',
      title: '贡献的参考图',
    },
    {
      key: 'project_sample',
      title: '贡献的样图',
    },
    {
      key: 'phases_overtime',
      title: '超时完成的提交数',
    },
    {
      key: 'overtime_sum',
      title: '累计提交超时（小时）',
    },
  ]
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: isSm ? 32 : 50,
      fixed: 'left',
    },
    {
      title: '昵称',
      dataIndex: 'name',
      width: isSm ? 80 : 120,
      fixed: 'left',
      render: (name, user) => {
        return <Link to={"/admin/users/" + user.id}>{name}</Link>
      }
    },
    {
      title: '头像',
      key: 'key',
      width: 80,
      render: (user) => {
        return <Avatarx url={user.avatar_url} name={user.name} />
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: isSm ? 120 : 200,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      width: isSm ? 120 : 200,
    },
    {
      title: '删除',
      key: 'key2',
      render: (key, user) => {
        if (user.id !== 1) {
          return <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => deleteUser(user.id)}
            okText="是"
            cancelText="否"
          >
            <Button size='small'>删除</Button>
          </Popconfirm>
        } else {
          return ''
        }
      },
    }
  ]
  const handleDateRange = dates => {
    if (dates.length === 2) {
      const dates_str = dates.map(date => {
        return moment(date.format('YYYY-MM-DD')).utc().format('YYYY-MM-DD HH:mm:ss')
      }).join(',')
      setDateRangeFilter(dates_str)
      setDatefilter('')
    }
  }

  const handleExportTable = () => {
    setTableModel(false)
    setZipping(3)
    const path = '/download/users/csv'
    const params = {
      user_id: selectedRowKeys.join(','),
      keys: transferTargetKeys.join(','),
    }
    if (dateRangeFilter) {
      params.date_range = dateRangeFilter
    }
    const values = queryString.parse(location.search)
    if (values.order) {
      params.order = values.order
      params.order_by = values.order_by
    } else {
      params.order = 'desc'
      params.order_by = 'status'
    }

    fetchData(path, params).then(res => {
      setTaskId(res.data.task_id)
      checkTask(res.data.task_id)
    })
  }

  const progressRender = task => {
    switch (task.state) {
      case 'PENDING':
        return <Progress percent={0} format={() => '等待中'} />
      case 'PROGRESS':
        return <Progress percent={parseFloat(Number(task.result.current / task.result.total * 100).toFixed(1))} />
      case 'SUCCESS':
        return <Progress percent={100} format={() => '成功'} />
      default:
        return ''
    }
  }
  function deleteUser(id) {
    const path = '/users/' + id
    deleteData(path).then(res => {
      setUpdate(!update)
    })
  }

  useEffect(() => {
    setLoading(true)
    const path = '/users'
    const params = {
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

    fetchData(path, params).then(res => {
      setUserList(res.data.users)
      setPagination(prevState => { return { ...prevState, total: res.data.total } })
      setLoading(false)
    }).catch(err => {
      setUserList([])
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, location]);

  const onChangePage = (pagination) => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: pagination.current });
    history.push(`${location.pathname}?${params}`)
  }
  const onSelectChange = selectedRowKeys => {
    setSelectedRowKeys(selectedRowKeys)
  }

  const checkTask = (id) => {
    const path = '/tasks/' + id
    fetchData(path).then(res => {
      setTaskData(res.data)
      switch (res.data.state) {
        case 'SUCCESS':
          setZipping(0)
          setTaskId()
          setTaskData()
          window.location.href = res.data.result.result
          break
        case 'FAILURE':
          setZipping(0)
          setTaskId()
          setTaskData()
          message.error('未知错误')
          break
        default:
          break;
      }
    })
  }
  useInterval(() => {
    checkTask(taskId)
  }, taskId ? 1000 : null);

  const handleTransferChange = (nextTargetKeys, direction, moveKeys) => {
    if (direction === 'right') {
      setTransferTargetKeys(prevState => prevState.concat(moveKeys))
    } else {
      setTransferTargetKeys(nextTargetKeys)
    }
  };
  return (
    <>
      <Modal
        title="生成表格"
        visible={showTableModel}
        onOk={handleExportTable}
        onCancel={() => setTableModel(false)}
        width='690px'
      >
        <Transfer
        className='m-b:1'
          showSearch
          listStyle={{ width: '300px',height:'300px'}}
          dataSource={headerData}
          titles={['可选数据', '目标数据']}
          targetKeys={transferTargetKeys}
          onChange={handleTransferChange}
          render={item => item.title}
          locale={{ itemUnit: '项', itemsUnit: '项' }}
        />
        <>
          <Radio.Group value={dateFilter} onChange={e => {
            setDatefilter(e.target.value)
            switch (e.target.value) {
              case 'all':
                setDateRangeFilter()
                break;
              case 'year':
                setDateRangeFilter(getYearRange(new Date()).join(','))
                break;
              case 'quarter':
                setDateRangeFilter(getQuarterRange(new Date()).join(','))
                break;
              case 'month':
                setDateRangeFilter(getMonthRange(new Date()).join(','))
                break;
              case 'week':
                setDateRangeFilter(getWeekRange(new Date()).join(','))
                break;
              default:
                break;
            }
          }}>
            <Radio value="all">累计</Radio>
            <Radio value="year">本年</Radio>
            <Radio value="quarter">本季</Radio>
            <Radio value="month">本月</Radio>
            <Radio value="week">本周</Radio>
          </Radio.Group>
          <RangePicker onChange={handleDateRange} allowClear={false}
            value={dateRangeFilter ?
              dateRangeFilter.split(',').map(date_str => { return moment.utc(date_str, 'YYYY-MM-DD HH:mm:ss').local() }) : undefined
            } size='small' style={{ width: 220 }} />
        </>
      </Modal>
      <Card bodyStyle={{ padding: isSm ? '24px 8px' : '' }}>
        <div className='m-b:1'>
          <Button className='m-r:.5' type={isBatch ? "" : 'link'} onClick={() => setBatch(!isBatch)}>批量操作</Button>
        </div>
        {isBatch &&
          <div className='m-b:1'>
            <span className='m-r:.5'>已选择{selectedRowKeys.length}个项目</span>
            <Button className='m-r:.5' onClick={() => setSelectedRowKeys([])} disabled={selectedRowKeys.length === 0}>取消所有</Button>
            <Button className='m-r:.5' type="primary" onClick={() => setTableModel(true)} loading={isZipping === 1} disabled={selectedRowKeys.length === 0 || (isZipping !== 3 && isZipping)}>导出为表格</Button>
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
          rowKey={user => user.id}
          dataSource={userList}
          loading={isloading}
          pagination={pagination}
          onChange={onChangePage}
          scroll={{ x: 600 }}
        />
      </Card>
    </>
  )
}

