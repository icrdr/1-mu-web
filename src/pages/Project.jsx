import React, { useEffect, useState, useContext } from 'react'
import { Route, Link } from 'react-router-dom'
import { Card, Steps, Button, Icon, PageHeader, Divider, Affix, Popconfirm, Drawer } from 'antd'
import ProjectUpload from '../components/projectPage/ProjectUpload'
import ProjectFeedback from '../components/projectPage/ProjectFeedback'
import Loading from '../components/Loading'
import ImgCard from '../components/ImgCard'
import Stage from '../components/projectPage/Stage'
import Design from '../components/projectPage/Design'
import { parseStatus, getPhase, getStage, timeLeft, parseTimeLeft, fetchData, updateData } from '../utility'
import { globalContext } from '../App';
import StatusTag from '../components/projectPage/StatusTag'
import StageShow from '../components/projectPage/StageShow'

const { Step } = Steps;

export default function Project({ history, match, isAdmin }) {
  const [projectData, setProjectData] = useState();
  const [isloading, setLoading] = useState(false);
  const [update, setUpdate] = useState(true);
  const { meData, isSm } = useContext(globalContext);
  const [isWating, setWating] = useState(false);
  const [showUploadPlane, setUploadPlane] = useState(false);
  const [showFeedbackPlane, setFeedbackPlane] = useState(false);
  const [isAffixed, setAffixed] = useState(true);

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
  const onStart = () => {
    setWating(true)
    const path = `/projects/${match.params.project_id}/start`
    updateData(path).then(() => {
      const current_stage = getStage(projectData)
      history.push(`${match.url}/stages/${current_stage.id}/phases/${getPhase(current_stage).id}`)
      setUpdate(!update)
    }).finally(() => {
      setWating(false)
    })
  }


  const operation = () => {
    switch (projectData.status) {
      case 'await':
        return projectData.client.id === meData.id || isAdmin ?
          <Popconfirm
            title="确定如此操作么？"
            onConfirm={onStart}
            okText="是"
            cancelText="否"
          >
            <Button size='large' disabled={isWating} type="primary" block>确认开始企划</Button>
          </Popconfirm> : null
      case 'delay':
      case 'progress':
      case 'modify':
        return projectData.creator.id === meData.id || isAdmin ? <>
          <Button className={isAffixed ? 'shadow' : ''} size='large' type="primary" disabled={showUploadPlane} onClick={() => setUploadPlane(true)} block>阶段成品提交</Button>
          <Drawer
            title="阶段成品提交"
            placement='bottom'
            onClose={() => setUploadPlane(false)}
            visible={showUploadPlane}
            height={'auto'}
          >
            <ProjectUpload
              onSuccess={() => {
                const current_stage = getStage(projectData)
                history.push(`${match.url}/stages/${current_stage.id}/phases/${getPhase(current_stage).id}`)
                setUploadPlane(false)
                setUpdate(!update)
              }}
              file={getPhase(getStage(projectData)).upload_files}
              upload={getPhase(getStage(projectData)).creator_upload}
            />
          </Drawer>
        </> : null
      case 'pending':
        return projectData.client.id === meData.id || isAdmin ? <>
          <Button className={isAffixed ? 'shadow' : ''} size='large' type="primary" disabled={showFeedbackPlane} onClick={() => setFeedbackPlane(true)} block>反馈建议</Button>
          <Drawer
            title="反馈建议"
            placement='bottom'
            onClose={() => setFeedbackPlane(false)}
            visible={showFeedbackPlane}
            height={'auto'}
          >
            <ProjectFeedback
              onSuccess={() => {
                const current_stage = getStage(projectData)
                history.push(`${match.url}/stages/${current_stage.id}/phases/${getPhase(current_stage).id}`)
                setFeedbackPlane(false)
                setUpdate(!update)
              }}
              feedback={getPhase(getStage(projectData)).client_feedback}
            />
          </Drawer>
        </> : null
      default:
        break;
    }
  }
  return (
    <>
      <PageHeader
        className='m-b:2'
        title={projectData.title}
        subTitle={<>阶段<StageShow project={projectData} /></>}
        tags={<StatusTag status={projectData.status} />}
        extra={<>
          {!isSm && <>
            <div className='d:i m-r:.5' style={{ lineHeight: '25px' }}>
              审核者：
            <Link to={"/users/" + projectData.client.id}>{projectData.client.name}</Link>
            </div>
            <div className='d:i' style={{ lineHeight: '25px' }}>
              制作者：
            <Link to={"/users/" + projectData.creator.id}>{projectData.creator.name}</Link>
            </div>
            <Divider type="vertical" />
          </>}
          <div className='d:i' style={{ lineHeight: '25px' }}>
            <Icon type="more" style={{ fontSize: '16px', color: '#1890ff' }} />
          </div>
        </>}
      >
      </PageHeader>
      <Card className='m-b:2'>
        <Steps status={stepStatus(projectData)} current={stepCurrent(projectData)}>
          <Step title={
            <Link to={`${match.url}/design`}>
              <Button type="link" >设计初稿</Button>
            </Link>
          } description={projectData.status === 'await' ? '未确认' : '确认'} />
          {projectData.stages.map((stage, index) =>
            <Step key={stage.id} title={
              <Link to={`${match.url}/stages/${stage.id}/phases/${getPhase(stage).id}`}>
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
      <Card className='m-b:2'>
        <Route path={`${match.path}/design`} render={props =>
          <Design {...props} onSuccess={() => setUpdate(!update)} project={projectData} />
        } />
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
        }} />
        <Route path={`${match.path}/stages/:stage_id(\\d+)/phases/:phase_id(\\d+)`} render={props =>
          <Stage {...props} onSuccess={() => setUpdate(!update)} project={projectData} />
        } />
      </Card>
      <Affix offsetBottom={0} onChange={affixed => setAffixed(affixed)}>
        {operation()}
      </Affix>
    </>
  )
}