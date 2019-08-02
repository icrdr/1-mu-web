import React, { useState, useEffect, useContext } from 'react'
import { Row, Col, Card, message, Input, BackTop, Radio, Tag, Modal } from 'antd';

import { fetchData } from '../utility'
import StackGrid from "react-stack-grid";
import queryString from 'query-string'
import ImgPost from '../components/ImgPost'
import { meContext } from '../layouts/Web';
const { Search } = Input;
const { CheckableTag } = Tag;
export default function FileList({ location, history }) {
  const [stackGrid, setStackGrid] = useState()
  const [page, setPage] = useState(1)
  const [imgList, setImgList] = useState([])
  const [update, setUpdate] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [meFilter, setMefilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([])
  const [lightBox, setLightBox] = useState()
  const { meData } = useContext(meContext)
  const tagsFromServer = [
    '普通外科', '骨科', '神经外科', '妇产科', '泌尿外科', '胸外科', '眼科', '耳鼻喉科', '整形',
    '心外科', '心内科', '神经内科', '肾内科', '皮肤科', '血液科', '儿科', '内分泌科', '肿瘤科',
    '肿瘤', '生物', '分子', '婴儿', '成人', '解剖', '器官',
    '人体', '研究', '手术', '器材', '设备', '场景'
  ]

  useEffect(() => {
    setLoading(true)
    const path = '/files'
    const params = {
      order: 'desc',
      pre_page: 10,
      page: page,
      public: 1
    }
    const values = queryString.parse(location.search)
    if (values.search) {
      params.search = values.search
    }

    switch (meFilter) {
      case 'me':
        params.user_id = meData.id
        break;
      case 'group':
        params.group_id = meData.groups[0].id
        break;
      default:
    }

    fetchData(path, params).then(res => {
      setImgList(preState => {
        return preState.concat(res.data.files)
      })
      if (res.data.files.length > 0) setPage(preState => { return preState + 1 })
      setTimeout(() => {
        if (stackGrid) stackGrid.updateLayout()
        setLoading(false)
      }, 200);
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, meFilter, location]);

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
    setImgList([])
    setPage(1)
    setSelectedTags([])
    if (v.length < 2 && v.length !== 0) {
      message.info('关键词太短，至少2个字符')
      console.log('Too short.')
      return false
    }
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, search: v, page: 1 });
    history.push(`${location.pathname}?${params}`)
  }

  const onChangeMeFilter = e => {
    setImgList([])
    setPage(1)
    setMefilter(e.target.value)
  }

  const handleChange = (tag, checked) => {
    setImgList([])
    setPage(1)
    const newSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag)
    const values = queryString.parse(location.search)
    const params = queryString.stringify({ ...values, search: newSelectedTags.join(','), page: 1 });
    history.push(`${location.pathname}?${params}`)
    setSelectedTags(newSelectedTags)
  }

  return (
    <div>
      {lightBox != null &&
        <>
          <Modal
            title={lightBox.name}
            centered
            visible={lightBox != null}
            onCancel={() => setLightBox()}
            okButtonProps={{ className: 'd:n' }}
            cancelButtonProps={{ className: 'd:n' }}
            width='60%'
            bodyStyle={{
              padding: 0
            }}
          ><a target="_blank" rel="noopener noreferrer" href={lightBox.url}>
              <img width='100%' alt='图片' src={lightBox.url} />
            </a>
            <div className='p:2'>
              {lightBox.tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>)}
            </div>
          </Modal>
        </>
      }
      <BackTop />
      <ImgPost onSucceed={() => {
        setImgList([])
        setPage(1)
        setUpdate(!update)
      }} />
      <Card>
        <div className='m-b:1'>
          {tagsFromServer.map(tag => (
            <CheckableTag
              key={tag}
              checked={selectedTags.indexOf(tag) > -1}
              onChange={checked => handleChange(tag, checked)}
            >
              {tag}
            </CheckableTag>
          ))}
        </div>
        <Row gutter={16}>
          <Col xs={24} md={8} className='m-b:1'>
            <Radio.Group value={meFilter} onChange={onChangeMeFilter}>
              <Radio value='all'>全部</Radio>
              <Radio value='group'>小组上传</Radio>
              <Radio value='me'>我上传</Radio>
            </Radio.Group>
          </Col>
          <Col xs={24} md={16} className='m-b:1'>
            <Search placeholder="输入关键词" onSearch={onSearch} allowClear enterButton />
          </Col>
        </Row>
        <StackGrid
          columnWidth='33.33%'
          monitorImagesLoaded={true}
          gridRef={grid => setStackGrid(grid)}
          duration={180}
          gutterWidth={12}
          gutterHeight={12}
        >
          {imgList.map((img, index) =>
            <div onClick={() => setLightBox(img)} key={index}>
              {img.previews.length > 0 ? (
                <img width='100%' alt='图片' src={img.previews[0].url} />
              ) : (
                  <div style={{ width: '100%', height: '200px' }}>{img.name}.{img.format}</div>
                )}
            </div>
          )}
        </StackGrid>
      </Card>
    </div>
  )
}
