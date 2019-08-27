import React, { useState } from 'react'
import { Card, Row, Col, Descriptions, Button, Tabs, message, Icon } from 'antd'
import ImgCard from '../ImgCard'

import { getPhase, parseDate, fetchData } from '../../utility'
const { TabPane } = Tabs;

export default function Stage({ history, match, project }) {
  const stage = project.stages.filter(stage => stage.id === parseInt(match.params.stage_id))[0]
  const phaseId = match.params.phase_id || getPhase(stage).id.toString()
  const [isWating, setWating] = useState(false);

  const handleDownload = phase => {
    setWating(true)
    let file_id = []
    for (let i in phase.upload_files) {
      file_id.push(phase.upload_files[i].id)
    }

    if (file_id.length === 0) {
      console.log('No file.')
      message.info('没有文件，下载取消')
      return false
    }

    const path = '/download/files'
    const params = {
      file_id: file_id.join(',')
    }
    const hide = message.loading('压缩文件中...', 0);
    fetchData(path, params).then(res => {
      hide()
      window.location.href = res.data.download_url
    }).finally(() => {
      setWating(false)
    })
  }

  const phaseArr = [...stage.phases].reverse().filter(x => x.upload_date != null)

  return (<>
    <h1>{stage.name}</h1>
    <Descriptions size="small" className='m-b:1' >
      <Descriptions.Item label="起始日期">{stage.phases[0].start_date? parseDate(stage.phases[0].start_date): '未开始'}</Descriptions.Item>
      <Descriptions.Item label="重启日期">{getPhase(stage).start_date? parseDate(getPhase(stage).start_date): '未开始'}</Descriptions.Item>
      <Descriptions.Item label="死线日期">{getPhase(stage).start_date ? parseDate(getPhase(stage).deadline_date) : '未开始'}</Descriptions.Item>
      <Descriptions.Item label="预计时间（天）">{getPhase(stage).days_need}</Descriptions.Item>
    </Descriptions>
    {phaseArr.length > 0 &&
      <Tabs activeKey={phaseId} type="card" onChange={activeKey => {
        const url = match.url.split('/')
        url[url.length - 1] = activeKey
        history.push(url.join('/'))
      }} tabPosition='top'>
        {phaseArr.map((phase) =>
          <TabPane tab={parseDate(phase.upload_date).split(' ')[0]} key={phase.id}>
            <Row gutter={16}>
              <Col sm={24} md={8} className='m-b:1'>
                {phase.feedback_date && <>
                  <h2>修改的建议（{phase.client.name}）</h2>
                  {phase.client_feedback ?
                    <div dangerouslySetInnerHTML={{ __html: phase.client_feedback }} /> : <div>无</div>}
                </>}
              </Col>
              <Col sm={24} md={16} className=''>
                <Row>
                  <Col><h2 className='fl:l'>提交的文件（{phase.creator.name}）</h2></Col>
                  <Col><Button className='fl:r' type='primary' disabled={isWating} onClick={() => handleDownload(phase)}>批量下载</Button></Col>
                </Row>
                <div dangerouslySetInnerHTML={{ __html: phase.creator_upload }} />
                {phase.upload_files.map((item, j) =>
                  <Card key={j} className='m-t:2'
                    cover={<ImgCard file={item} />}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"><Icon type="download" /><div className="fl:r">{item.name}.{item.format}</div></a>
                  </Card>
                )}

              </Col>
            </Row>
          </TabPane>)}
      </Tabs>
    }
  </>)
}
