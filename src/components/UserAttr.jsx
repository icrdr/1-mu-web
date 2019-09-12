import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { fetchData } from '../utility'
import { Chart, Geom, Axis, Tooltip, Coord } from 'bizcharts';

export default function UserAttr({ userID, ...rest }) {
  const [attr, setAttr] = useState();
  useEffect(() => {
    const path = `/dashboard/attr/${userID}`
    fetchData(path).then(res => {
      setAttr(res.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const attrData = [
    {
      item: '手速',
      score: attr ? attr.speed === -1 ? undefined : attr.speed : 0,
    },
    {
      item: '绘力',
      score: attr ? attr.power === -1 ? undefined : attr.power : 0,
    },
    {
      item: '学识',
      score: attr ? attr.knowledge === -1 ? undefined : attr.knowledge : 0,
    },
    {
      item: '活力',
      score: attr ? attr.energy === -1 ? undefined : attr.energy : 0,
    },
    {
      item: '贡献',
      score: attr ? attr.contribution === -1 ? undefined : attr.contribution : 0,
    }
  ]

  return (
    <Card {...rest} >
      {attr && <>
        <Chart className='m-b:1' height={300} data={attrData} padding={[30, 'auto', 'auto', 'auto']} scale={{ score: { min: 0, max: 5 } }} forceFit>
          <Coord type="polar" radius={1} />
          <Axis name="item" line={{ lineWidth: 1 }} tickLine={null} grid={{
            lineStyle: {
              lineDash: null,
            },
            hideFirstLine: false,
          }} />
          <Axis name="score" line={null} tickLine={null} label={null} grid={{
            type: 'polygon',
            alternateColor: 'rgba(0, 0, 0, 0.04)',
          }} />
          <Tooltip />
          <Geom type="line" position="item*score" color='#1890ff' size={2} />
          <Geom type="point" position="item*score" color='#1890ff' shape="circle" size={4} style={{ stroke: '#fff', lineWidth: 1, fillOpacity: 1 }} />
        </Chart>
        <Row gutter={16}>
          <Col xs={12} md={12} className='t-a:c m-b:1'><Statistic title="加权总分" valueStyle={{ color: '#1890ff' }} value={attr.score} /></Col>
          <Col xs={12} md={12} className='t-a:c m-b:1'><Statistic title="团队均分" value={'未知'} /></Col>
        </Row></>}
    </Card>
  )
}
