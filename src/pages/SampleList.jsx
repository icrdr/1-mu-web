import React, { useEffect, useState } from 'react'
import { Card, Input, Modal, Tag, Button,Icon } from 'antd'
import { fetchData, getPhase, getStage } from '../utility'
import ImgCard from '../components/ImgCard'
import queryString from 'query-string'
import { useMediaQuery } from 'react-responsive'
import StackGrid from "react-stack-grid";

const { Search } = Input;
export default function SampleList({ location, history }) {
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })
  const [stackGrid, setStackGrid] = useState()
  const [update, setUpdate] = useState(false)
  const [page, setPage] = useState(1)
  const [projectList, setProjectList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [lightBox, setLightBox] = useState()
  // const [update, setUpdate] = useState(false);
  // const { meData } = useContext(meContext);

  useEffect(() => {
    setLoading(true)
    const path = '/projects'
    const params = {
      order: 'desc',
      pre_page: 7,
      page: page,
      status: 'finish',
      tags: '样图'
    }

    const values = queryString.parse(location.search)

    if (values.search) {
      params.search = values.search
    }

    fetchData(path, params).then(res => {
      setProjectList(prevState => {
        return prevState.concat(res.data.projects)
      })
      if (res.data.projects.length > 0) setPage(prevState => { return prevState + 1 })
      setTimeout(() => {
        if (stackGrid) stackGrid.updateLayout()
        setLoading(false)
      }, 200);
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, location]);

  useEffect(() => {
    function handleScroll() {
      if (document.documentElement.offsetHeight + document.documentElement.scrollTop < document.documentElement.scrollHeight - 100) return
      if (!isLoading) {
        setUpdate(!update)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const onSearch = v => {
    setProjectList([])
    setPage(1)
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, search: v, page: 1 });
    history.push(`${location.pathname}?${params}`)
  }

  const handleDownload = files => {
    const file_id = []
    for (const file of files) {
      file_id.push(file.id)
    }

    const path = '/download/files'
    const params = {
      file_id: file_id.join(',')
    }
    fetchData(path, params).then(res => {
      window.location.href = res.data.download_url
    })
  }

  return (
    <>
      {lightBox != null &&
        <Modal
          title={lightBox.title}
          centered
          visible={lightBox != null}
          onCancel={() => setLightBox()}
          okButtonProps={{ className: 'd:n' }}
          cancelButtonProps={{ className: 'd:n' }}
          width={isSm ? '100%' : '60%'}
          bodyStyle={{
            padding: 0
          }}
        >{getPhase(getStage(lightBox)).upload_files.map((file, index) => { return <ImgCard key={index} file={file} /> })}
          <div className='p:2'>
            {lightBox.tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)}
          </div>
        </Modal>
      }

      <Card>
        <div className='m-b:1' >
          <Search placeholder="输入企划标题关键词" onSearch={onSearch} allowClear enterButton />
        </div>
        <StackGrid
          columnWidth={isSm ? '100%' : '33.33%'}
          monitorImagesLoaded={true}
          gridRef={grid => setStackGrid(grid)}
          duration={180}
          gutterWidth={12}
          gutterHeight={12}
        >
          {projectList.map((project, index) => {
            const item = getPhase(getStage(project)).upload_files[0]
            return <Card key={index} cover={<div onClick={() => setLightBox(project)}><ImgCard file={item} /></div>}>
              <Button type='link' size='small' onClick={() => handleDownload(getPhase(getStage(project)).upload_files)}>
                <Icon type="download" />
                {project.title}
              </Button>
            </Card>
          })}
        </StackGrid>
      </Card>
    </>
  )
}

