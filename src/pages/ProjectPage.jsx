import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Descriptions, Steps } from 'antd'
import Loading from '../components/Loading'
import axios from 'axios'
import { parseStatus,getPhase, getStage, parseDate, timeLeft, parseTimeLeft } from '../utility'
import Avatarx from '../components/Avatarx'
const { Step } = Steps;
const { Meta } = Card;
const DOMAIN_URL = window.DOMAIN_URL

export default function ProjectPage({ match }) {
  const [projectData, setProjectData] = useState();
  const [isloading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    let url = DOMAIN_URL + '/api/projects'
    let params = {
      include: match.params.id
    }
    axios.get(url, {
      params: params,
      withCredentials: true
    }).then(res => {
      console.log(res.data)
      setProjectData(res.data.projects[0])
      setLoading(false)
    }).catch(err => {
      if (err.response) console.log(err.response.data)
      setLoading(false)
    })
  }, [match]);

  if (isloading) {
    return <Loading />
  }else if (!projectData){
    return <div>没有内容</div>
  }

  const stepStatus = (project) => {
    if (getPhase(getStage(projectData)).status === 'await') return 'wait'
    const x_days = timeLeft(getStage(project))
    if (x_days >= 0) {
      return 'process'
    } else {
      return 'error'
    }
  }

  const stepDescription = (stage, index)=>{
    const status = getPhase(stage).status
    if(index !== projectData.current_stage_index || status === 'await'){
      return parseStatus(status)
    }else{
      return parseStatus(status) + ' ' + parseTimeLeft(stage)
    }
  }

  return (
    <Card className='p:2' title={'企划：' + projectData.name}>
      <Row className='m-t:2'>
        <Col span={12}>
          <Meta className="fl:l"
            avatar={<Avatarx user={projectData.client}/>}
            title={projectData.client.name}
            description="发起方"
          />
        </Col>
        <Col span={12}>
          <Meta
            avatar={<Avatarx user={projectData.creator}/>}
            title={projectData.creator.name}
            description="制作方"
          />
        </Col>
      </Row>
      <Descriptions className="m-t:5" layout="vertical" bordered>
        <Descriptions.Item label="企划起始日期">{parseDate(projectData.stages[0].start_date)}</Descriptions.Item>
        <Descriptions.Item label="目前阶段">{getStage(projectData).name}</Descriptions.Item>
        <Descriptions.Item label="目前状态">{parseStatus(getPhase(getStage(projectData)).status)}</Descriptions.Item>
        <Descriptions.Item label="阶段起始日期">{parseDate(getStage(projectData).start_date)}</Descriptions.Item>
        <Descriptions.Item label="阶段共需时间（天）">{getPhase(getStage(projectData)).days_need}</Descriptions.Item>
      </Descriptions>

      <Steps className="m-t:6" status={stepStatus(projectData)} current={projectData.current_stage_index}>
        {projectData.stages.map((stage, index) =>
          <Step key={index} title={stage.name} description={stepDescription(stage,index)} />
        )}
        <Step title='完成' description='' />
      </Steps>
    </Card>
  )
}
