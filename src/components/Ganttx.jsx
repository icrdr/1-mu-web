import React, { useState, useContext, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Row, Col, Button, Empty, Badge } from 'antd'
import Gantt from 'react-gantt-antd'
import { getPhase, getStage, toLocalDate } from '../utility'
import Loading from '../components/Loading'
import { globalContext } from '../App';
function Ganttx({ match, loading, projects }) {
  const { isSm } = useContext(globalContext);
  const now = new Date()
  const [zoom, setZoom] = useState(1);
  const [t_projects, setTprojects] = useState([])
  const [timelineStart, setTimelineStart] = useState(new Date(now.getTime() - 1000))
  const [timelineEnd, setTimelineEnd] = useState(new Date(now.getTime() + 1000))

  useEffect(() => {
    const new_t_projects = []
    loop1:
    for (const project of projects) {
      const s_tasks = []
      const s_t_projects = []
      let color = ''
      switch (project.status) {
        case 'modify':
        case 'progress':
          color = '#1890ff'
          break;
        case 'pending':
          color = '#13c2c2'
          break;
        case 'delay':
          color = '#ff4d4f'
          break;
        default:
          break;
      }

      for (let i in project.stages) {
        const stage = project.stages[i]
        let start, end
        const p_tasks = []
        for (let j in stage.phases) {
          const phase = stage.phases[j]
          if (phase.start_date) {
            start = toLocalDate(phase.start_date)
          } else if (j > 0) {
            const prePhase = stage.phases[j - 1]
            if (prePhase.feedback_date) {
              start = toLocalDate(prePhase.feedback_date)
            } else if (prePhase.upload_date) {
              start = now
            } else {
              start = p_tasks[j - 1].end
            }
          } else {
            if (i > 0) {
              const prePhase = getPhase(project.stages[i - 1])
              if (prePhase.feedback_date) {
                start = toLocalDate(prePhase.feedback_date)
              } else if (prePhase.upload_date) {
                start = now
              } else {
                const pre_p_tasks = s_t_projects[i - 1].tasks
                start = pre_p_tasks[pre_p_tasks.length - 1].end
              }
            } else {
              continue loop1
            }
          }

          if (phase.feedback_date) {
            end = toLocalDate(phase.feedback_date)
          } else if (phase.upload_date) {
            end = toLocalDate(phase.upload_date)
          } else {
            let ddl
            if (phase.deadline_date) {
              ddl = toLocalDate(phase.deadline_date)
            } else {
              ddl = new Date(start.getTime() + 1000 * 60 * 60 * 24 * (phase.days_need))
            }

            if (ddl > now) {
              end = ddl
            } else {
              end = now
            }
          }

          p_tasks.push({
            id: phase.id,
            title: `${parseInt(j) + 1}`,
            start: start,
            end: end,
            style: {
            }
          })
        }
        s_t_projects.push({
          id: stage.id,
          title: <Link to={`${match.path}/${project.id}/stages/${stage.id}/phases/${getPhase(stage).id}`}>{`${parseInt(i) + 1}.${stage.name}`}</Link>,
          tasks: p_tasks,
        })

        s_tasks.push({
          id: stage.id,
          title: stage.name,
          start: p_tasks[0].start,
          end: p_tasks[p_tasks.length - 1].end,
          style: {
            backgroundColor: color,
          }
        })
      }
      let link_url = ''
      switch (project.status) {
        case 'draft':
        case 'await':
          link_url = `/projects/${project.id}/design`
          break;
        case 'finish':
          link_url = `/projects/${project.id}/done`
          break;
        default:
          link_url = `/projects/${project.id}/stages/${getStage(project).id}/phases/${getPhase(getStage(project)).id}`
          break;
      }
      new_t_projects.push({
        id: project.id,
        title: <Link to={link_url}>{`${project.title}`}</Link>,
        tasks: s_tasks,
        projects: s_t_projects,
        isOpen: false,
      })
    }
    setTprojects(new_t_projects)
    if (new_t_projects.length > 0) {
      let m_start = new_t_projects[0].tasks[0].start
      let m_end = new_t_projects[0].tasks[0].end
      for (const t_project of new_t_projects) {
        for (const tasks of t_project.tasks) {
          if (m_start > tasks.start) m_start = tasks.start
          if (m_end < tasks.end) m_end = tasks.end
        }
      }
      setTimelineStart(toLocalDate(new Date(m_start.getTime() - 0.25 * (m_end - m_start))))
      setTimelineEnd(toLocalDate(new Date(m_end.getTime() + 0.25 * (m_end - m_start))))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  if (loading) {
    return <Loading />
  } else if (projects.length === 0) {
    return <Empty description='没有数据' />
  }

  return (
    <div>
      <Row gutter={16} className='m-b:.5'>
        <Col span={16} className='t-a:l' style={{ lineHeight: '32px' }}>
          <Badge className='m-r:1' color="#1890ff" text="进行中" />
          <Badge className='m-r:1' color="#13c2c2" text="等待中" />
          <Badge color="#ff4d4f" text="超时" />
        </Col>
        <Col span={8} className='t-a:r'>
          <Button className='m-r:.5' onClick={() => { if (zoom + 1 < 10) setZoom(zoom + 1) }} disabled={zoom + 1 >= 10} icon="zoom-in" />
          <Button  onClick={() => { if (zoom - 1 > 0) setZoom(zoom - 1) }} disabled={zoom - 1 <= 0} icon="zoom-out" />
        </Col>
      </Row>
      <Gantt
        start={timelineStart}
        end={timelineEnd}
        zoom={zoom}
        now={now}
        projects={t_projects}
        sidebarWidth={isSm ? 120 : 200}
        enableSticky
        scrollToNow
      />
    </div>
  )
}
export default withRouter(Ganttx)