import React, { useState, useEffect } from 'react'
import { Card, message, Input, BackTop } from 'antd';
import { fetchData } from '../utility'
import StackGrid from "react-stack-grid";
import queryString from 'query-string'
import ImgPost from '../components/ImgPost'
const { Search } = Input;

export default function FileList({ location, history }) {
  const [stackGrid, setStackGrid] = useState()
  const [page, setPage] = useState(1)
  const [imgList, setImgList] = useState([])
  const [update, setUpdate] = useState(false)
  const [isLoading, setLoading] = useState(false)
  
  useEffect(() => {
    setLoading(true)
    const path = '/files'
    const params = {
      order: 'desc',
      pre_page: 10,
      page: page,
      public: 1
    }
    console.log('Fetch more list items!')
    const values = queryString.parse(location.search)
    if (values.search) {
      params.search = values.search
    }

    fetchData(path, params).then(res => {
      setImgList(preState => {
        return preState.concat(res.data.files)
      })
      setPage(preState => { return preState + 1 })
      setTimeout(() => {
        if (stackGrid) stackGrid.updateLayout()
      }, 200);
    }).catch(() => {
    }).finally(() => {
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, location]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    if (document.documentElement.offsetHeight + document.documentElement.scrollTop !== document.documentElement.scrollHeight) return
    if (!isLoading) {
      setUpdate(preState => { return !preState })
    }
  }

  const onSearch = v => {
    setImgList([])
    setPage(1)
    if (v.length < 2 && v.length !== 0) {
      message.info('关键词太短，至少2个字符')
      console.log('Too short.')
      return false
    }
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, search: v, page: 1 });
    history.push(`${location.pathname}?${params}`)
  }
  return (
    <div>
      <BackTop />
      <ImgPost onSucceed={()=>{
        setImgList([])
        setPage(1)
        setUpdate(preState=>!preState)
      }}/>
      <Card>
        <h1>检索库</h1>
        <div className='m-b:1'>
          <Search placeholder="输入关键词" onSearch={onSearch} allowClear enterButton />
        </div>
        <StackGrid
          columnWidth='33.33%'
          monitorImagesLoaded={true}
          gridRef={grid => setStackGrid(grid)}
          duration={180}
          gutterWidth={12}
          gutterHeight={12}
        >
          {imgList.map((img, index) => {
            if (img.previews.length > 0) {
              return <a key={index} target="_blank" rel="noopener noreferrer" href={img.url}>
                <img width='100%' alt='图片' src={img.previews[0].url} />
              </a>
            } else {
              return <a key={index} target="_blank" rel="noopener noreferrer" href={img.url}>
                <div style={{ width: '100%', height: '200px' }} key={index}>{img.name}.{img.format}</div>
              </a>
            }
          })}
        </StackGrid>
      </Card>
    </div>
  )
}
