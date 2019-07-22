import React, { useEffect, useState } from 'react'
import { Route, Link } from 'react-router-dom'
import { Card, Row, Col, Descriptions, Steps, Button, Tabs, Icon } from 'antd'
import Loading from '../components/Loading'
import ImgCard from '../components/ImgCard'
import ProjectUpload from '../components/ProjectUpload'
import ProjectFeedback from '../components/ProjectFeedback'
import axios from 'axios'
import { parseStatus, getPhase, getStage, parseDate, timeLeft, parseTimeLeft } from '../utility'
import Avatarx from '../components/Avatarx'
const { Step } = Steps;
const { Meta } = Card;
const { TabPane } = Tabs;
const SERVER_URL = window.SERVER_URL

export default function Project({ history, match, location }) {
  const [projectData, setProjectData] = useState();
  const [isloading, setLoading] = useState(false);
  const [stageShow, setStageShow] = useState(-1);

  useEffect(() => {
    setLoading(true)
    let url = SERVER_URL + '/api/projects/' + match.params.project_id
    axios.get(url, {
      withCredentials: true
    }).then(res => {
      console.log(res.data)
      setProjectData(res.data)
      setStageShow(res.data.status === 'await' ? -1 : res.data.current_stage_index)
      setLoading(false)
    }).catch(err => {
      if (err.response) console.log(err.response.data)
      setLoading(false)
    })
  }, [match.params.project_id]);

  if (isloading) {
    return <Loading />
  } else if (!projectData) {
    return <div>没有内容</div>
  }

  const operateProject = (action) => {
    let url = SERVER_URL + '/api/projects/' + match.params.project_id
    let params = {
      action: action,
    }
    axios.put(url, { ...params }, {
      withCredentials: true
    }).then(res => {
      console.log(res.data)
      history.push("/projects/" + match.params.project_id)
    }).catch(err => {
      if (err.response) console.log(err.response.data)
    })
  }

  const stepStatus = (project) => {
    if (projectData.status === 'await') return 'wait'
    const x_days = timeLeft(getStage(project))
    if (x_days >= 0) {
      return 'process'
    } else {
      return 'error'
    }
  }

  const stepCurrent = (project) => {
    switch (project.status) {
      case 'await':
        return project.current_stage_index
      case 'finish':
        return project.current_stage_index + 2
      default:
        return project.current_stage_index + 1
    }
  }

  const setDescription = (stage, index) => {
    const status = projectData.status
    if (index < projectData.current_stage_index) {
      return parseStatus('finish')
    } else if (index > projectData.current_stage_index) {
      return parseStatus('await')
    } else if (status === 'modify' || status === 'progress') {
      return parseStatus(status) + ' ' + parseTimeLeft(timeLeft(stage))
    } else {
      return parseStatus(status)
    }
  }

  return (
    <Card className='p:2' title={'企划：' + projectData.title}>
      <Row className='m-t:2' gutter={12}>
        <Col sm={24} md={12} className='m-b:4'>
          <Meta
            avatar={<Avatarx url={projectData.client.avatar_url} name={projectData.client.name} />}
            title={<Link to={"/users/" + projectData.client.id}>{projectData.client.name}</Link>}
            description="发起方"
          />
        </Col>
        <Col sm={24} md={12} className='d:f flx-w:w'>
          {projectData.creators.map((creator, index) =>
            <Meta key={index} className='m-b:.5 m-r:1'
              avatar={<Avatarx url={creator.avatar_url} name={creator.name} />}
              title={<Link to={"/users/" + creator.id}>{creator.name}</Link>}
              description="制作方"
            />)}
        </Col>
      </Row>

      <Descriptions className="m-t:5" layout="vertical" bordered>
        <Descriptions.Item label="企划起始日期">{projectData.start_date ? parseDate(projectData.start_date) : '未开始'}</Descriptions.Item>
        <Descriptions.Item label="目前阶段">
          {projectData.status === 'await' ? `阶段0/${projectData.stages.length}` : `阶段${(projectData.current_stage_index + 1).toString()}/${projectData.stages.length}：` + getStage(projectData).name}</Descriptions.Item>
        <Descriptions.Item label="目前状态">{parseStatus(projectData.status)}</Descriptions.Item>
      </Descriptions>

      <Steps className="m-t:6" status={stepStatus(projectData)} current={stepCurrent(projectData)}>
        <Step title={
          <Link to={match.url}>
            <Button type="link" >{'设计初稿'}</Button>
          </Link>
        } description={projectData.status === 'await' ? '未确认' : '确认'} />
        {projectData.stages.map((stage, index) =>
          <Step key={index} title={
            <Link to={`${match.url}/stages/${index}`}>
              <Button type="link" >{stage.name}</Button>
            </Link>
          } description={setDescription(stage, index)} />
        )}
        <Step title='完成' description='' />
      </Steps>
      <div className='m-t:4'>
        <Route exact path={match.path} render={() =><>
            <h1>初始设计稿</h1>
            <div dangerouslySetInnerHTML={{
              __html: projectData.design
            }} />
            {projectData.status === 'await' && <Button size='large' type="primary" block onClick={() => operateProject('start')}>确认开始企划</Button>}
          </>}
        />
        <Route path={`${match.path}/stages/:stage_index(\\d+)`} render={props => <Stage {...props} project={projectData} />} />
      </div>
    </Card>
  )
}

function Stage({ match, project }) {
  const index = parseInt(match.params.stage_index)
  const stage = project.stages[index]

  const operationRender = status => {
    switch (status) {
      case 'progress':
      case 'modify':
        return <>
          <Route exact path={match.path} render={() =>
            <Link to={`${match.url}/upload`}>
              <Button size='large' type="primary" block>阶段成品提交</Button>
            </Link>
          } />
          <Route path={`${match.path}/upload`} render={
            props => <ProjectUpload {...props}
              file={getPhase(stage).upload_files}
              upload={getPhase(stage).creator_upload} />
          } />
        </>
      case 'pending':
        return <>
          <Route exact path={match.path} render={() =>
            <Row gutter={12}>
              <Col sm={24} md={12} className='m-b:2'>
                {/* <Button type="primary" size='large' block onClick={() => operateProject('finish')}>确认通过</Button> */}
              </Col>
              <Col sm={24} md={12}>
                <Link to={`${match.url}/feedback`}>
                  <Button size='large' block >需要修改</Button>
                </Link>
              </Col>
            </Row>
          } />
          <Route path={`${match.path}/feedback`} render={
            props => <ProjectFeedback {...props} feedback={getPhase(stage).client_feedback} />
          } />
        </>
      default:
        break;
    }
  }
  const phaseRender = stage => {
    const phaseArr = [...stage.phases].reverse().filter(x => x.upload_date != null)
    if (phaseArr.length > 0) {
      return <>
        <Tabs className='m-t:4' tabPosition='top'>
          {phaseArr.map((phase, i) =>
            <TabPane tab={parseDate(phase.upload_date).split(' ')[0]} key={i}>
              <div dangerouslySetInnerHTML={{ __html: phase.creator_upload }} />
              {phase.upload_files.map((item, j) =>
                <Card key={j} className='m-t:2'
                  cover={<ImgCard file={item} />}>
                  <div className="t-a:c">{item.name}.{item.format}</div>
                </Card>
              )}
              {phase.feedback_date && <>
                <h2 className='m-t:4'>修改意见</h2>
                {phase.client_feedback ?
                  <div dangerouslySetInnerHTML={{ __html: phase.client_feedback }} /> : <div>无</div>}
              </>}
            </TabPane>)}
        </Tabs>
      </>
    }
  }
  return (<>
    {project.current_stage_index === index &&
      <div className='m-t:4'>
        {operationRender(project.status)}
      </div>
    }
    <h1>{stage.name}</h1>
    <Descriptions layout="vertical" bordered>
      <Descriptions.Item label="阶段起始日期">{stage.start_date ? parseDate(stage.start_date) : '未开始'}</Descriptions.Item>
      <Descriptions.Item label="阶段计划时间（天）">{getPhase(stage).days_need}</Descriptions.Item>
    </Descriptions>

    {phaseRender(stage)}
  </>)
}