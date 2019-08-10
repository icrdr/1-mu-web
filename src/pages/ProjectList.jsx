import React, { useEffect, useState, useContext } from 'react'

import { Link } from 'react-router-dom'
import { Table, Card, Tag, Row, Col, Checkbox, Divider, Input, message, Breadcrumb, Select, Switch, Radio, Button } from 'antd'
import { parseStatus, getStage, fetchData, parseDate, timeLeft, parseTimeLeft, updateData } from '../utility'
import { meContext } from '../layouts/Web';
import queryString from 'query-string'
import Ganttx from '../components/Ganttx';

const { Search } = Input;
const { Option } = Select;
export default function Main({ location, history, match }) {
  const plainOptions = ['草稿', '未开始', '进行中', '修改中', '逾期中', '待确认', '已完成', '暂停']

  const [projectList, setProjectList] = useState([]);
  const [isGantt, setGantt] = useState(false);
  const [isloading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  const [checkedList, setCheckedList] = useState(plainOptions);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);
  const [update, setUpdate] = useState(false);
  const [meFilter, setMefilter] = useState('creator');
  const [memberList, setMemberList] = useState([]);
  const [adminIds, setAdminIds] = useState([]);
  const [zoom, setZoom] = useState(40);
  const { meData } = useContext(meContext);

  const columns = [
    {
      title: '企划名',
      dataIndex: 'title',
      width: '15%',
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
        return <Link to={link_url}>{name}</Link>
      }
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: '10%',
      render: (tags) => {
        return tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: '10%',
    },
    {
      title: '开始时间',
      dataIndex: 'start_date',
      render: (start_date) => {
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
      dataIndex: 'key',
      width: '10%',
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
      width: '5%',
    },

    {
      title: '制作者',
      dataIndex: 'creator',
      render: (creator, project) => {
        if (project.client.id === meData.id) {
          return <Select
            style={{ width: '100%', maxWidth: '120px' }}
            placeholder="选择小组"
            onChange={v => onChangeCreator(v, project)}
            value={creator.name}
          >
            {memberList.map((item, index) =>
              <Option key={item.id}>{item.name}</Option>)
            }
          </Select>
        } else {
          return <Link to={"/users/" + creator.id}>{creator.name}</Link>
        }
      },
      width: '5%',
    },
  ];
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
    }).finally(() => {
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (adminIds.length > 0) {
      setLoading(true)
      setProjectList([])
      const path = '/projects'
      const status = checkedList.join(',')
        .replace('草稿', 'draft')
        .replace('未开始', 'await')
        .replace('进行中', 'progress')
        .replace('修改中', 'modify')
        .replace('逾期中', 'delay')
        .replace('待确认', 'pending')
        .replace('已完成', 'finish')
        .replace('暂停', 'pause')
      let params
      if (isGantt) {
        params = {
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
      } else {
        params = {
          order: 'desc',
          pre_page: pagination.pageSize,
          status: status,
          order_by: 'status',
          client_id: adminIds.join(',')
        }

        const values = queryString.parse(location.search)
        if (values.page) {
          setPagination(prevState => { return { ...prevState, current: parseInt(values.page) } })
          params.page = values.page
        } else {
          params.page = pagination.current
        }

        if (values.creator_id) {
          params.creator_id = values.creator_id
        }

        if (values.search) {
          params.search = values.search
        }
      }

      fetchData(path, params).then(res => {
        setProjectList(res.data.projects)
        setPagination(prevState => { return { ...prevState, total: res.data.total } })
        setLoading(false)
      }).catch(() => {
        setProjectList([])
      }).finally(() => {
        setLoading(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGantt, location, checkedList, meFilter, update]);

  const onChangePage = (pagination) => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, page: pagination.current });
    history.push(`${location.pathname}?${params}`)
  }
  const onChangeCreator = (v, project) => {
    if (project.creator.id === parseInt(v)) return false
    const path = `/projects/${project.id}`
    const data = {
      creator_id: v,
    }
    updateData(path, data).then(res => {
      setUpdate(!update)
    })
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

  const onChangeCreatorFilter = v => {
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, creator_id: v.join(','), page: 1 });
    history.push(`${location.pathname}?${params}`)
  }

  return (
    <>
      <Breadcrumb className='m-b:1'>
        <Breadcrumb.Item>
          <Link to='/projects'>企划列表</Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Card>
        <div>
          <div className='m-b:1'>
            <span className='m-r:1'>甘特图</span><Switch className='m-r:4' checked={isGantt} onChange={checked => setGantt(checked)} />
          </div>
          {isGantt && <>
            <Row gutter={16}>
              <Col xs={12} md={12} className='m-b:1 t-a:l'>
                <div className='m-r:1 fl:l'><div className='m-r:.5 fl:l' style={{ width: '21px', height: '21px', backgroundColor: '#1890ff' }} />进行中</div>
                <div className='m-r:1 fl:l'><div className='m-r:.5 fl:l' style={{ width: '21px', height: '21px', backgroundColor: '#13c2c2' }} />等待中</div>
                <div className='m-r:1 fl:l'><div className='m-r:.5 fl:l' style={{ width: '21px', height: '21px', backgroundColor: '#ff4d4f' }} />超时</div>
              </Col>
              <Col xs={12} md={12} className='m-b:1 t-a:r'>
                <Radio.Group value={meFilter} onChange={e => setMefilter(e.target.value)}>
                  <Radio value='client'>我作为发起方</Radio>
                  <Radio value='creator'>我作为制作方</Radio>
                </Radio.Group>
              </Col>
            </Row>
            <Button onClick={()=>{if(zoom+5<100)setZoom(zoom+5)}} className='pos:a' style={{ right: '60px', top: '20px' }} disabled={zoom+5>=100} icon="zoom-in" />
            <Button onClick={()=>{if(zoom-5>0)setZoom(zoom-5)}} className='pos:a' style={{ right: '20px', top: '20px' }} disabled={zoom-5<=0} icon="zoom-out" />
          </>}
        </div>
        {isGantt ? <Ganttx zoom={zoom} projects={projectList} /> :
          <>
            <div className='m-b:1'>
              <Search placeholder="输入企划标题关键词" onSearch={onSearch} allowClear enterButton />
            </div>

            <Row gutter={16}>
              <Col xs={24} md={8} className='m-b:1'>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="选择制作方"
                  onChange={onChangeCreatorFilter}
                >
                  {memberList.map((item, index) =>
                    <Option key={item.id}>{item.name}</Option>)
                  }
                </Select>
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
          </>}
      </Card>
    </>
  )
}

