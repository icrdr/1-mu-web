import React, { useState, useEffect } from 'react'
import { Button } from 'antd';
import { blue } from '@ant-design/colors'
import { fetchData, getPhase } from '../utility'
import Timeline from '../react-timelines/src/index'
import Loading from '../components/Loading';

export default function Main({ location }) {
  const [projectList, setProjectList] = useState([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)

    const path = '/projects'

    const params = {
      order: 'desc',
      pre_page: 10,
      status: 'progress,modify,delay,pending,finish',
      order_by: 'status',
    }

    fetchData(path, params).then(res => {
      setProjectList(res.data.projects)
    }).catch(() => {
      setProjectList([])
    }).finally(() => {
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const tracks = []
  for (let i in projectList) {
    const project = projectList[i]
    const tasks = []
    for (let j in project.stages) {
      const stage = project.stages[j]
      const phase = getPhase(stage)
      const start_date = new Date(stage.start_date + ' UTC')
      let end_date
      if (phase.feedback_date) {
        end_date = new Date(getPhase(stage).feedback_date + ' UTC')
      } else {
        end_date = new Date(start_date.getTime() + 1000 * 60 * 60 * 24 * phase.days_need)
      }
      tasks.push({
        id: j,
        title: stage.name,
        start: start_date,
        end: end_date,
        style: {
          backgroundColor: blue[5-parseInt(j)],
          color: '#fff',
        },
      })
    }
    tracks.push({
      id: i,
      title: project.title,
      elements: tasks,
      isOpen: false,
    })
  }

  const start = new Date('2019-06-03 00:00:00')
  const end = new Date('2019-09-01 00:00:00')
  const zoom = 40
  const buildMonthCells = () => {
    const months_count = end.getMonth() - start.getMonth() + (12 * (end.getFullYear() - start.getFullYear()));
    function parseDate(y, m) {
      while (m >= 12) {
        m -= 12
        y += 1
      }
      return new Date(`${y}-${m}`)
    }
    const v = []
    for (let i = 0; i < months_count; i++) {
      const cell_start = parseDate(start.getFullYear(), start.getMonth() + i + 1)
      const cell_end = parseDate(start.getFullYear(), start.getMonth() + i + 2)
      v.push({
        id: `m${i}`,
        title: `${cell_start.getMonth() + 1}月`,
        start: cell_start,
        end: cell_end,
      })
    }
    return v
  }

  const buildWeekCells = () => {
    const weeks_count = Math.round((end - start) / (1000 * 60 * 60 * 24 * 7))
    const v = []
    for (let i = 0; i < weeks_count + 1; i++) {
      const offset = start.getDay()
      const cell_start = new Date(start.getTime() + 1000 * 60 * 60 * 24 * ((i - 1) * 7 - offset))
      const cell_end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * (i * 7 - offset))
      v.push({
        id: `d${i}`,
        title: '\t',
        start: cell_start,
        end: cell_end
      })
    }
    return v
  }

  const buildDateCells = () => {
    const days_count = Math.round((end - start) / (1000 * 60 * 60 * 24))
    const v = []
    for (let i = 0; i < days_count; i++) {
      const cell_start = new Date(start.getTime() + 1000 * 60 * 60 * 24 * i)
      const cell_end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * (i + 1))
      v.push({
        id: `d${i}`,
        title: `${cell_start.getDate()}`,
        start: cell_start,
        end: cell_end,
        style: {
          backgroundColor: cell_start.getDay() === 0 ? blue[5] : '#fff',
          color: cell_start.getDay() === 0 ? '#fff' : '#000',
        },
      })
    }
    return v
  }
  const timebar = [
    {
      id: 'months',
      title: '月份',
      cells: buildMonthCells(),
      style: {},
    },
    {
      id: 'days',
      title: '日期',
      cells: buildDateCells(),
      useAsGrid: true,
      style: {},
    },
  ]

  if (isLoading) {
    return <Loading />
  }

  return (
    <div>
      <Timeline
        scale={{
          start,
          end,
          zoom,
          zoomMin: 6,
          zoomMax: 20,
        }}
        toggleOpen={() => { }}
        clickElement={() => { }}
        clickTrackButton={() => { }}
        isOpen={true}
        timebar={timebar}
        tracks={tracks}
        now={new Date()}
        toggleTrackOpen={() => { }}
        enableSticky
        scrollToNow
      />
    </div>
  )
}
