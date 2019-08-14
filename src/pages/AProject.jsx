import React, { useEffect, useState } from 'react'
import { Route, Link } from 'react-router-dom'
import { Card, Row, Col, Tag, Descriptions, Steps, Button, Tabs, message, Icon, Popconfirm } from 'antd'
import Loading from '../components/Loading'
import ImgCard from '../components/ImgCard'
import ProjectUpload from '../components/ProjectUpload'
import ProjectFeedback from '../components/ProjectFeedback'
import ProjectDesign from '../components/ProjectDesign'
import { parseStatus, getPhase, getStage, parseDate, timeLeft, parseTimeLeft, fetchData, updateData } from '../utility'
import Avatarx from '../components/Avatarx'
import { useMediaQuery } from 'react-responsive'
const { Step } = Steps;
const { Meta } = Card;
const { TabPane } = Tabs;

export default function Project({ history, match, location }) {
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })
  const [projectData, setProjectData] = useState();
  const [isloading, setLoading] = useState(false);
  const [update, setUpdate] = useState(true);

  useEffect(() => {
    setLoading(true)
    const path = '/projects/' + match.params.project_id
    fetchData(path).then(res => {
      setProjectData(res.data)
    }).finally(() => {
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.params.project_id, update]);

  if (isloading) {
    return <Loading />
  } else if (!projectData) {
    return <div>没有内容</div>
  }

  const stepStatus = (project) => {
    switch (project.status) {
      case 'pending':
        return 'process'
      case 'draft':
      case 'await':
        return 'wait'
      case 'finish':
        return 'finish'
      default:
        const x_days = timeLeft(getStage(project))
        if (x_days >= 0) {
          return 'process'
        } else {
          return 'error'
        }
    }
  }

  const stepCurrent = (project) => {
    switch (project.status) {
      case 'draft':
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
    } else if (status === 'modify' || status === 'progress' || status === 'delay') {
      return parseStatus(status) + ' ' + parseTimeLeft(timeLeft(stage))
    } else {
      return parseStatus(status)
    }
  }

  return (
    <>
      <Card className='p:2' title={'企划：' + projectData.title}
        extra={isSm?'':projectData.tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)}
      >
        <Row className='m-t:2' gutter={12}>
          <Col sm={24} md={12} className='m-b:4'>
            <Meta
              avatar={<Avatarx url={projectData.client.avatar_url} name={projectData.client.name} />}
              title={<Link to={"/users/" + projectData.client.id}>{projectData.client.name}</Link>}
              description="发起方"
            />
          </Col>
          <Col sm={24} md={12} className='d:f flx-w:w'>
            <Meta className='m-b:.5 m-r:1'
              avatar={<Avatarx url={projectData.creator.avatar_url} name={projectData.creator.name} />}
              title={<Link to={"/users/" + projectData.creator.id}>{projectData.creator.name}</Link>}
              description="制作方"
            />
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
            <Link to={`${match.url}/design`}>
              <Button type="link" >设计初稿</Button>
            </Link>
          } description={projectData.status === 'await' ? '未确认' : '确认'} />
          {projectData.stages.map((stage, index) =>
            <Step key={index} title={
              <Link to={`${match.url}/stages/${index}`}>
                <Button type="link" >{stage.name}</Button>
              </Link>
            } description={setDescription(stage, index)} />
          )}
          <Step title={projectData.status === 'finish' ?
            <Link to={`${match.url}/done`}>
              <Button type="link" >完成</Button>
            </Link> : '完成'
          } description='' />
        </Steps>
      </Card>
      <Card className='m-t:2'>
        <Route path={`${match.path}/design`} render={props =>
          <Design {...props} onSuccess={() => setUpdate(!update)} project={projectData} />}
        />
        <Route path={`${match.path}/done`} render={() => {
          const phase = getPhase(getStage(projectData))
          return <>
            <h1>最终成品</h1>
            <div dangerouslySetInnerHTML={{ __html: phase.creator_upload }} />
            {phase.upload_files.map((item, j) =>
              <Card key={j} className='m-t:2'
                cover={<ImgCard file={item} />}>
                <a href={item.url}><Icon type="download" /><div className="fl:r">{item.name}.{item.format}</div></a>
              </Card>
            )}
          </>
        }}
        />
        <Route path={`${match.path}/stages/:stage_index(\\d+)`} render={props => <Stage {...props} onSuccess={() => setUpdate(!update)} project={projectData} />} />
      </Card>
    </>
  )
}

function Design({ history, match, project, onSuccess }) {
  const onStart = () => {
    const path = `/projects/${match.params.project_id}/start`
    updateData(path).then(() => {
      history.push(`/admin/projects/${match.params.project_id}/stages/0`)
      onSuccess()
    })
  }

  return (
    <>
      <Route exact path={match.path} render={() => <>
        {project.status === 'await' &&
          <Popconfirm
            title="确定如此操作么？"
            onConfirm={onStart}
            okText="是"
            cancelText="否"
          >
            <Button size='large' type="primary" block>确认开始企划</Button>
          </Popconfirm>
        }
        <h1>初始设计稿</h1>
        <div dangerouslySetInnerHTML={{
          __html: project.design
        }} />
        <Link to={`${match.url}/edit`}>
          <Button size='large' block>修改</Button>
        </Link>

      </>
      } />
      <Route path={`${match.path}/edit`} render={
        props => <ProjectDesign {...props} onSuccess={onSuccess} design={project.design} />
      } />
    </>
  )
}

function Stage({ history, match, project, onSuccess }) {
  const index = parseInt(match.params.stage_index)
  const stage = project.stages[index]

  const onBatchDownload = phase => {
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
    fetchData(path, params).then(res => {
      window.location.href = res.data.download_url
    })
  }

  const onFinish = () => {
    const path = `/projects/${match.params.project_id}/finish`
    updateData(path).then(() => {
      if (project.stages.length - 1 > index) {
        history.push(`/admin/projects/${match.params.project_id}/stages/${index + 1}`)
      } else {
        history.push(`/admin/projects/${match.params.project_id}/done`)
      }
      onSuccess()
    })
  }

  const operationRender = status => {
    switch (status) {
      case 'delay':
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
              onSuccess={onSuccess}
              file={getPhase(stage).upload_files}
              upload={getPhase(stage).creator_upload} />
          } />
        </>
      case 'pending':
        return <>
          <Route exact path={match.path} render={() =>
            <Row gutter={12}>
              <Col sm={24} md={12} className='m-b:2'>
                <Popconfirm
                  title="确定如此操作么？"
                  onConfirm={onFinish}
                  okText="是"
                  cancelText="否"
                >
                  <Button type="primary" size='large' block >确认通过</Button>
                </Popconfirm>
              </Col>
              <Col sm={24} md={12}>
                <Link to={`${match.url}/feedback`}>
                  <Button size='large' block >需要修改</Button>
                </Link>
              </Col>
            </Row>
          } />
          <Route path={`${match.path}/feedback`} render={
            props => <ProjectFeedback {...props} onSuccess={onSuccess} feedback={getPhase(stage).client_feedback} />
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
              <Row gutter={16}>
                <Col sm={24} md={12} className='m-b:1'>
                  <Row>
                    <Col><h2 className='fl:l'>提交的文件（{phase.creator.name}）</h2></Col>
                    <Col><Button className='fl:r' type='primary' onClick={() => onBatchDownload(phase)}>批量下载</Button></Col>
                  </Row>
                  <div dangerouslySetInnerHTML={{ __html: phase.creator_upload }} />
                  {phase.upload_files.map((item, j) =>
                    <Card key={j} className='m-t:2'
                      cover={<ImgCard file={item} />}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer"><Icon type="download" /><div className="fl:r">{item.name}.{item.format}</div></a>
                    </Card>
                  )}
                </Col>
                <Col sm={24} md={12} className=''>
                  {phase.feedback_date && <>
                    <h2>修改意见（{phase.client.name}）</h2>
                    {phase.client_feedback ?
                      <div dangerouslySetInnerHTML={{ __html: phase.client_feedback }} /> : <div>无</div>}
                  </>}
                </Col>
              </Row>
            </TabPane>)}
        </Tabs>
      </>
    }
  }

  return (<>
    {project.current_stage_index === index &&
      <div>
        {operationRender(project.status)}
      </div>
    }
    <h1>{stage.name}</h1>
    <Descriptions layout="vertical" bordered>
      <Descriptions.Item label="起始日期">{stage.start_date ? parseDate(stage.start_date) : '未开始'}</Descriptions.Item>
      <Descriptions.Item label="死线">{getPhase(stage).start_date ? parseDate(getPhase(stage).deadline_date) : '未开始'}</Descriptions.Item>
      <Descriptions.Item label="计划时间（天）">{getPhase(stage).days_need}</Descriptions.Item>
    </Descriptions>

    {phaseRender(stage)}
  </>)
}