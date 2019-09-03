import React, { useEffect, useState, useContext } from 'react'
import { Card, Row, Col, Radio, Statistic, DatePicker } from 'antd'
import moment from 'moment';
import { fetchData, getMonthRange, getWeekRange } from '../utility'
import { globalContext } from '../App';
import Ganttx from '../components/Ganttx';
import DoneProject from '../components/DoneProject'
const { RangePicker } = DatePicker;

export default function Main() {
  const [projectList, setProjectList] = useState([]);
  const [donePhases, setDonePhases] = useState(0);
  const [doneStages, setDoneStages] = useState(0);
  const [doneProjects, setDoneProjects] = useState(0);
  const [doneOverTime, setDoneOverTime] = useState(0);
  const [isloading, setLoading] = useState(false);
  const [meFilter, setMefilter] = useState('creator');
  const [dateRangeFilter, setDateRangeFilter] = useState(getMonthRange(new Date()).join(','));
  const [dateFilter, setDatefilter] = useState('month');

  const { meData, isSm } = useContext(globalContext);

  useEffect(() => {
    setLoading(true)
    setProjectList([])
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
      setProjectList(res.data.projects)
    }).catch(() => {
      setProjectList([])
    }).finally(() => {
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meFilter]);

  useEffect(() => {
    const path = '/dashboard/' + meData.id
    const params = {
      finish_date: dateRangeFilter,
    }
    fetchData(path, params).then(res => {
      setDoneProjects(res.data.done_projects)
      setDoneStages(res.data.done_stages)
      setDonePhases(res.data.done_phases)
      setDoneOverTime(res.data.done_overtime)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRangeFilter]);

  const handleDateRange = dates => {
    if (dates.length === 2) {
      const dates_str = dates.map(date => {
        return moment(date.format('YYYY-MM-DD')).utc().format('YYYY-MM-DD HH:mm:ss')
      }).join(',')
      setDateRangeFilter(dates_str)
      setDatefilter('')
    }
  }

  return (
    <>
      <Card title="数据" bordered={false} className='m-b:1' extra={
        <>
          <Radio.Group value={dateFilter} onChange={e => {
            setDatefilter(e.target.value)
            switch (e.target.value) {
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
            <Radio value="month">本月</Radio>
            <Radio value="week">本周</Radio>
          </Radio.Group>
          <RangePicker onChange={handleDateRange} allowClear={false} value={dateRangeFilter.split(',').map(date_str => { return moment.utc(date_str, 'YYYY-MM-DD HH:mm:ss').local() })} size='small' style={{ width: 220 }} />
        </>
      }>
        <Row gutter={16}>
          <Col span={6} className='t-a:c'><Statistic title="参与完成的企划" value={doneProjects} /></Col>
          <Col span={6} className='t-a:c'><Statistic title="参与完成的阶段" value={doneStages} /></Col>
          <Col span={6} className='t-a:c'><Statistic title="完成的提交数" value={donePhases} /></Col>
          <Col span={6} className='t-a:c'><Statistic title="累计提交超时" value={parseInt(doneOverTime / 3600)} valueStyle={{ color: '#cf1322' }} suffix='小时' /></Col>
        </Row>
      </Card>
      <Card title="进行中" extra={
        <Radio.Group value={meFilter} onChange={e => setMefilter(e.target.value)}>
          <Radio value='client'>我作为审核者</Radio>
          <Radio value='creator'>我作为制作者</Radio>
        </Radio.Group>
      } className='m-b:1' bordered={false} bodyStyle={{ padding: isSm ? '24px 8px' : '' }}>
        <Ganttx loading={isloading} projects={projectList} />
      </Card>
      <Card title="参与过的企划" bordered={false} bodyStyle={{ padding: isSm ? '24px 8px' : '' }}>
        <DoneProject />
      </Card>
    </>
  )
}

