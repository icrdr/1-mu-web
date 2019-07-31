import React, { useState, useEffect } from 'react'
import { Upload, Button, Icon, Select, Card, message, Input, BackTop } from 'antd';
import { uploadData, fetchData } from '../utility'
import StackGrid from "react-stack-grid";
import queryString from 'query-string'
const { Search } = Input;
const { Dragger } = Upload;
export default function FileList({ location, history }) {
  const [stackGrid, setStackGrid] = useState()
  const [fileList, setFileList] = useState([])
  const [page, setPage] = useState(1)
  const [imgList, setImgList] = useState([])
  const [tags, setTags] = useState([])
  const [isUploading, setUploading] = useState(false)
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
    }).catch(err => {
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

  const handleUpload = () => {
    setUploading(true)
    const path = '/files'
    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('tags', tags);
    formData.append('public', 1);

    uploadData(path, formData).then(() => {
      setFileList([])
      setTags([])
      setImgList([])
      setPage(1)
      setUpdate(!update)

    }).finally(() => {
      setUploading(false)
    })
  }

  const onTagsChange = v => {
    setTags(v)
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
      <Card className='m-b:1'>
        <h1>传图</h1>

        <div className='m-b:1'>
          <Dragger
            style={{ width: '100%' }}
            onRemove={() => {
              setFileList([])
            }}
            beforeUpload={file => {
              const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
              if (!isJpgOrPng) {
                message.error('You can only upload JPG/PNG file!');
                return false
              }
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error('Image must smaller than 2MB!');
                return false
              }
              console.log(file)

              setFileList([file])
              return false
            }}
            listType='picture'
            fileList={fileList}
            showUploadList={false}
          >
            <Icon type="upload" />选择文件
        </Dragger>
        </div>
        {fileList.length > 0 &&
          <Card className='m-b:1'><img width='100%' alt='图片' src={URL.createObjectURL(fileList[0])} /></Card>
        }
        <div className='m-b:1'>
          <span >图片标签</span>
          <Select className='m-t:.5' mode="tags" style={{ width: '100%' }} placeholder='请填写标签，起码2个' value={tags} onChange={onTagsChange} />
        </div>
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0 || tags.length < 2}
          loading={isUploading}
          block
        >
          {isUploading ? '上传中' : '开始上传'}
        </Button>
      </Card>
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
              return <a key={index} target="_blank" rel="noopener noreferrer" href={img.url}><img width='100%' alt='图片' src={img.previews[0].url} /></a>
            } else {
              return <div style={{ width: '100%', height: '200px' }} key={index}>{img.name}.{img.format}</div>
            }
          })}
        </StackGrid>
      </Card>
    </div>
  )
}
