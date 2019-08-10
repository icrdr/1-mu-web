import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Input, Breadcrumb, Row, Col, Icon } from 'antd'
import { fetchData, getPhase,getStage } from '../utility'
import Loading from '../components/Loading'
import ImgCard from '../components/ImgCard'
// import { meContext } from '../layouts/Web';
import queryString from 'query-string'
const { Search } = Input;
export default function Main({ location, history }) {

  const [projectList, setProjectList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 10 });
  // const [update, setUpdate] = useState(false);
  // const { meData } = useContext(meContext);

  useEffect(() => {
    setLoading(true)
    const path = '/projects'
    const params = {
      order: 'desc',
      pre_page: pagination.pageSize,
      status: 'finish',
      tags:'样图'
    }

    const values = queryString.parse(location.search)
    if (values.page) {
      setPagination(prevState => { return { ...prevState, current: parseInt(values.page) } })
      params.page = values.page
    } else {
      params.page = pagination.current
    }

    if (values.search) {
      params.search = values.search
    }

    fetchData(path, params).then(res => {
      setProjectList(res.data.projects)
      setPagination(prevState => { return { ...prevState, total: res.data.total } })
      setLoading(false)
    }).catch(() => {
      setProjectList([])
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (isLoading) {
    return <Loading />
  }

  const onSearch = v => {
    // if (v.length < 2) {
    //   message.info('关键词太短，至少2个字符')
    //   console.log('Too short.')
    //   return false
    // }
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, search: v, page: 1 });
    history.push(`${location.pathname}?${params}`)
  }

  return (
    <>
      <Breadcrumb className='m-b:1'>
        <Breadcrumb.Item>
          <Link to='/all'>总表</Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Card>
        <div className='m-b:1' >
          <Search placeholder="输入企划标题关键词" onSearch={onSearch} allowClear enterButton />
        </div>

        <Row gutter={12}>
          {projectList.map((project, index) => {
            const item = getPhase(getStage(project)).upload_files[0]
            return <Col md={8}>
              <Card cover={<ImgCard file={item} />}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                <Icon type="download" /><div className="fl:r">{project.title}</div>
                </a>
              </Card>
            </Col>
          })}
        </Row>
      </Card>
    </>
  )
}

