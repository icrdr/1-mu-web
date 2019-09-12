import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Radio, Statistic, DatePicker } from 'antd'
import moment from 'moment';
import { fetchData, getMonthRange, getWeekRange, getYearRange, getQuarterRange } from '../utility'
const { RangePicker } = DatePicker;

export default function UserData({ userID, ...rest }) {
  const [data, setData] = useState();
  const [dateRangeFilter, setDateRangeFilter] = useState(getMonthRange(new Date()).join(','));
  const [dateFilter, setDatefilter] = useState('month');
  useEffect(() => {
    const path = `/dashboard/data/${userID}`
    let params = {}
    if (dateRangeFilter) {
      params = {
        date_range: dateRangeFilter,
      }
    }
    fetchData(path, params).then(res => {
      setData(res.data)
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
  const extra = (
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
  )
  return (
    <Card {...rest} extra={extra}>{data &&
      <Row gutter={16}>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="所有参与的阶段数" value={data.stages_all} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="一次通过的阶段数" value={data.stages_one_pass_c + data.stages_one_pass_d} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="修改通过的阶段数" value={data.stages_mod_pass_c + data.stages_mod_pass_d} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="尚未通过的阶段数" value={data.stages_no_pass_c + data.stages_no_pass_d} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="所有发起的提交数" value={data.phases_all} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="审核通过的提交数" value={data.phases_pass} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="审核不通过的提交数" value={data.phases_modify} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="未审核的提交数" value={data.phases_pending} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="贡献的参考图" value={data.files_ref} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="贡献的样图" value={data.project_sample} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="超时完成的提交数" value={data.phases_overtime} valueStyle={{ color: '#cf1322' }} /></Col>
        <Col xs={12} md={6} className='m-b:1'><Statistic title="累计提交超时" value={parseInt(data.overtime_sum / 3600)} valueStyle={{ color: '#cf1322' }} suffix='小时' /></Col>
      </Row>
    }
    </Card>
  )
}
