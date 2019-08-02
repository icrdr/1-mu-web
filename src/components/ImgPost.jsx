import React, { useState } from 'react'
import { Row, Col, Upload, Button, Icon, Select, Card, message, Input } from 'antd';
import { uploadData } from '../utility'
const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;
export default function ImgPost({ onSucceed }) {
  const [fileList, setFileList] = useState([])
  const [tagList, setTagList] = useState([])
  const [isUploading, setUploading] = useState(false)

  const handleUpload = async () => {
    // check if file has tags
    for (const file of fileList) {
      if (file.tags.length < 2) {
        message.error('请填写图片标签')
        return false
      }
    }

    setUploading(true)
    console.log('start')
    for (const file of fileList) {
      const path = '/files'
      const formData = new FormData();
      formData.append('file', file.file)
      formData.append('tags', file.tags)
      formData.append('description', file.description)
      formData.append('public', 1)
      await uploadData(path, formData)
    }
    console.log('done')
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    setFileList([])
    onSucceed()
    setUploading(false)
  }

  const onChangeTags = (index, v) => {
    for (let i in v) {
      if (tagList.indexOf(v[i]) === -1) {
        setTagList(preState => {
          return preState.concat(v[i])
        })
      }
    }
    setFileList(preState => {
      preState[index].tags = v
      return [...preState]
    })
  }

  const onChangeDescription = (index, e) => {
    e.persist()
    setFileList(preState => {
      preState[index].description = e.target.value
      return [...preState]
    })
  }

  return (
    <Card className='m-b:1'>
      <div className='m-b:1'>
        <Dragger
          style={{ width: '100%' }}
          multiple
          beforeUpload={file => {
            // check file type and size
            if (file.type !== 'image/jpeg'
              && file.type !== 'image/png') {
              message.error('只支持jpg/png图片格式');
              return false
            }
            if (file.size / 1024 / 1024 >= 4) {
              message.error('图片不可大于2mb');
              return false
            }
            console.debug(file)
            setFileList(preState => {
              preState.unshift({
                file: file,
                tags: []
              })
              return [...preState]
            })
            return false
          }}
          listType='picture'
          fileList={fileList}
          showUploadList={false}
        >
          <h2><Icon type="upload" />选择文件（可多选）</h2>
          <p>图片要求：jpg或者png格式，尺寸小于4mb</p>
          <p>（部分图片虽然以jpg结尾，但本质不是，导致无法解析，请确保图片文件正常）</p>
        </Dragger>
      </div>
      <Row gutter={16}>
        {fileList.map((file, index) =>
          <Col sm={24} md={8} key={index} >
            <Card className='m-b:2' cover={<img width='100%' alt='图片' src={URL.createObjectURL(file.file)} />}>
              <Icon className='pos:a' style={{
                top:'16px',
                right:'16px',
                fontSize: '24px'
                }} type="close-circle" theme="twoTone" onClick={() =>
                setFileList(preState => {
                  return preState.filter(item => { return item !== file })
                })
              } />
              <Select className='m-b:1' mode="tags"
                style={{ width: '100%' }}
                placeholder='请填写标签，至少2个'
                value={file.tags}
                onChange={v => onChangeTags(index, v)}
              >
                {tagList.map((tag, index) => <Option key={index} value={tag}>{tag}</Option>)}
              </Select>
              <TextArea
                placeholder="描述（选填）"
                autosize={{ minRows: 1, maxRows: 4 }}
                value={file.description}
                onChange={e => onChangeDescription(index, e)}
              />
            </Card>
          </Col>
        )}
      </Row>

      <Button disabled={isUploading} size='large' type="primary" onClick={handleUpload} block>
        {isUploading ? '上传中...' : '开始上传'}
      </Button>
    </Card>
  )
}
