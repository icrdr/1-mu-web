import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
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
import queryString from 'query-string'

const { Step } = Steps;

export default function Project({ history, match, isAdmin, location }) {
  const [projectData, setProjectData] = useState();
  const [isloading, setLoading] = useState(false);
  const [update, setUpdate] = useState(true);
  const { meData, isSm } = useContext(globalContext);
  const [isWating, setWating] = useState(false);
  const [showUploadPlane, setUploadPlane] = useState(false);
  const [showFeedbackPlane, setFeedbackPlane] = useState(false);
  const [isAffixed, setAffixed] = useState(true);
  const [progressIndex, setProgressIndex] = useState(0)

  useEffect(() => {
    if (projectData) {
      const values = queryString.parse(location.search)

      if (values.progress_index) {
        setProgressIndex(parseInt(values.progress_index))
      } else {
        setProgressIndex(projectData.progress)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData, location])

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
      case 'finish':
        return project.stages.length+1
      default:
        return project.progress
    }
  }

  const setDescription = (stage, index) => {
    const status = projectData.status
    const step = stepCurrent(projectData)-1
    if (index < step) {
      return parseStatus('finish')
    } else if (index > step) {
      return parseStatus('await')
    } else if (status === 'modify' || status === 'progress') {
      return parseStatus(status) + ' ' + parseTimeLeft(timeLeft(stage))
    } else {
      return parseStatus(status)
    }
  }
  const onStart = () => {
    setWating(true)
    const path = `/projects/${match.params.project_id}/start`
    updateData(path).then(() => {
      setProgressIndex(projectData.progress)
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
                setProgressIndex(projectData.progress)
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
                setProgressIndex(projectData.progress)
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

  const stageRender = () => {
    if (progressIndex === 0) {
      return <Design onSuccess={() => setUpdate(!update)} project={projectData} />
    } else if (progressIndex === -1) {
      const phase = getPhase(projectData.stages[projectData.stages.length-1])
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
    } else {
      return <Stage stageData={projectData.stages[progressIndex-1]} />
    }
  }

  return (
    <>
      <PageHeader
        className='m-b:2'
        title={projectData.title}
        subTitle={<>阶段<StageShow project={projectData} /></>}
        tags={<StatusTag project={projectData} />}
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
            <Button type="link" onClick={() => setProgressIndex(0)}>设计初稿</Button>
          } description={projectData.status === 'await' ? '未确认' : '确认'} />
          {projectData.stages.map((stage, index) =>
            <Step key={stage.id} title={
              <Button type="link" onClick={() => setProgressIndex(index+1)}>{stage.name}</Button>
            } description={setDescription(stage, index)} />
          )}
          <Step title={projectData.status === 'finish' ?
            <Button type="link" onClick={() => setProgressIndex(-1)}>完成</Button>
            : '完成'
          } description='' />
        </Steps>
      </Card>
      <Card className='m-b:2'>
        {stageRender()}
      </Card>
      <Affix offsetBottom={0} onChange={affixed => setAffixed(affixed)}>
        {operation()}
      </Affix>
    </>
  )
}