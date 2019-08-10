import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import Gantt from 'react-gantt-antd'
import { getPhase, toLocalDate } from '../utility'
import Loading from '../components/Loading'
function Ganttx({ match, zoom, projects }) {
  const now = new Date()
  const [tracks, setTracks] = useState([])
  const [timelineStart, setTimelineStart] = useState(new Date(now.getTime()-1000))
  const [timelineEnd, setTimelineEnd] = useState(new Date(now.getTime()+1000))

  useEffect(() => {
    const new_tracks = []
    loop1:
    for (const project of projects) {
      const s_elements = []
      const s_tracks = []
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
        const p_elements = []
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
              start = p_elements[j - 1].end
            }
          } else {
            if (i > 0) {
              const prePhase = getPhase(project.stages[i - 1])
              if (prePhase.feedback_date) {
                start = toLocalDate(prePhase.feedback_date)
              } else if (prePhase.upload_date) {
                start = now
              } else {
                const pre_p_elements = s_tracks[i - 1].elements
                start = pre_p_elements[pre_p_elements.length - 1].end
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

          p_elements.push({
            id: phase.id,
            title: `${parseInt(j) + 1}`,
            start: start,
            end: end,
            style: {
            }
          })
        }
        s_tracks.push({
          id: stage.id,
          title: <Link to={`${match.path}/${project.id}/stages/${i}`}>{`${parseInt(i) + 1}.${stage.name}`}</Link>,
          elements: p_elements,
        })

        s_elements.push({
          id: stage.id,
          title: stage.name,
          start: p_elements[0].start,
          end: p_elements[p_elements.length - 1].end,
          style: {
            backgroundColor: color,
          }
        })
      }
      let link_url = ''
      switch (project.status) {
        case 'draft':
        case 'await':
          link_url = `${match.path}/${project.id}/design`
          break;
        case 'finish':
          link_url = `${match.path}/${project.id}/done`
          break;
        default:
          link_url = `${match.path}/${project.id}/stages/${project.current_stage_index}`
          break;
      }
      new_tracks.push({
        id: project.id,
        title: <Link to={link_url}>{`${project.title}：${project.creator.name}`}</Link>,
        elements: s_elements,
        tracks: s_tracks,
        isOpen: false,
      })
    }
    setTracks(new_tracks)
    if (new_tracks.length>0) {
      let m_start = new_tracks[0].elements[0].start
      let m_end = new_tracks[0].elements[0].end
      for (const track of new_tracks) {
        for (const elements of track.elements) {
          if (m_start > elements.start) m_start = elements.start
          if (m_end < elements.end) m_end = elements.end
        }
      }
      
      setTimelineStart(toLocalDate(new Date(m_start.getTime() - 0.5 * (m_end - m_start))))
      setTimelineEnd(toLocalDate(new Date(m_end.getTime() + 0.5 * (m_end - m_start))))

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  const handleToggleTrackOpen = track => {
    setTracks(state => {
      for (const _track of state) {
        if (_track.id === track.id) {
          _track.isOpen = !track.isOpen
        }
      }
      return [...state]
    })
  }
  if (projects.length ===0){
    return <Loading/>
  }
  return (
    <div>
      <Gantt
        scale={{
          start: timelineStart,
          end: timelineEnd,
          zoom: zoom,
        }}
        tracks={tracks}
        now={now}
        toggleTrackOpen={handleToggleTrackOpen}
        enableSticky
        scrollToNow
      />
    </div>
  )
}
export default withRouter(Ganttx)