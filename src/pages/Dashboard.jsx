import React, { useEffect, useState, useContext } from 'react'
import { Card, Row, Col, Radio, PageHeader, Descriptions, Statistic } from 'antd'
import { fetchData } from '../utility'
import { globalContext } from '../App';
import Ganttx from '../components/Ganttx';
import Avatarx from '../components/Avatarx'
export default function Main() {
  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [meFilter, setMefilter] = useState('creator');

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

  return (
    <>
      <PageHeader className='m-b:1' title="仪表盘" subTitle="关于你的一切数据 🍜" />
      <Row gutter={16}>
        <Col xs={24} md={16} className='m-b:1'>
          <Card>
            <Row gutter={16}>
              <Col span={6} className='t-a:c'><Statistic title="Active Users" value={112893} /></Col>
              <Col span={6} className='t-a:c'><Statistic title="Active Users" value={112893} /></Col>
              <Col span={6} className='t-a:c'><Statistic title="Active Users" value={112893} /></Col>
              <Col span={6} className='t-a:c'><Statistic title="Active Users" value={112893} /></Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={8} className='m-b:1'>
          <Card>
            <Row gutter={16}>
              <Col span={8}><div className='t-a:c'><Avatarx size={64} url={meData.avatar_url} name={meData.name} /></div></Col>
              <Col span={16}> <Descriptions size="small" layout="vertical" >
                <Descriptions.Item label="ID">{meData.id}</Descriptions.Item>
                <Descriptions.Item label="登录名">{meData.name}</Descriptions.Item>
                <Descriptions.Item label="性别">{meData.sex === 'male' ? '男' : '女'}</Descriptions.Item>
              </Descriptions></Col>
            </Row>
          </Card>
        </Col>

      </Row>
      <Card className='m-b:1' bodyStyle={{ padding: isSm ? '24px 8px' : '' }}>
        <Row gutter={16} className='m-b:.5'>
          <Col xs={0} md={12} className='t-a:l'>
            <h3>进度可视化</h3>
          </Col>
          <Col xs={24} md={12} className='t-a:r'>
            <Radio.Group value={meFilter} onChange={e => setMefilter(e.target.value)}>
              <Radio value='client'>我作为审核者</Radio>
              <Radio value='creator'>我作为制作者</Radio>
            </Radio.Group>
          </Col>
        </Row>
        <Ganttx loading={isloading} projects={projectList} />
      </Card>
    </>
  )
}

