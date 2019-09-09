import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Card, Row, Col, Descriptions, Button, Tabs, message, Icon } from 'antd'
import ImgCard from '../ImgCard'
import { getPhase, parseDate, fetchData } from '../../utility'
import queryString from 'query-string'

const { TabPane } = Tabs;

function Stage({ location, stageData }) {

  const [isWating, setWating] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState('')

  useEffect(() => {
    if (stageData) {
      const values = queryString.parse(location.search)

      if (values.phase_index) {
        setPhaseIndex(values.phase_index)
      } else {
        setPhaseIndex((stageData.phases.length - 1).toString())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageData, location])

  if (!stageData) return ''

  const phaseArr = [...stageData.phases].reverse()

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

  return (<>
    <h1>{stageData.name}</h1>
    <Descriptions size="small" className='m-b:1' >
      <Descriptions.Item label="起始日期">{stageData.phases.length>0 ? parseDate(stageData.phases[0].start_date) : '未开始'}</Descriptions.Item>
      <Descriptions.Item label="重启日期">{stageData.phases.length>0 ? parseDate(getPhase(stageData).start_date) : '未开始'}</Descriptions.Item>
      <Descriptions.Item label="死线日期">{stageData.phases.length>0 ? parseDate(getPhase(stageData).deadline_date) : '未开始'}</Descriptions.Item>
      <Descriptions.Item label="预计时间（天）">{stageData.days_planned}</Descriptions.Item>
    </Descriptions>
    {phaseArr.length > 0 &&
      <Tabs
        activeKey={phaseIndex}
        type="card"
        onChange={activeKey => {
          setPhaseIndex(activeKey)
        }}
        tabPosition='top'>
        {phaseArr.map((phase, index) =>
          <TabPane tab={phase.upload_date ? parseDate(phase.upload_date).split(' ')[0] : '有待上传'} key={phaseArr.length - 1 - index}>
            {phase.upload_date?
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
            :<h2>内容有待上传</h2>}
          </TabPane>)}
      </Tabs>
    }
  </>)
}
export default withRouter(Stage)