import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Card, Typography, Button, Row, Col, Upload, Icon, Alert, message } from 'antd';
import useForm from '../../hooks/useForm'
import ImgCard from '../ImgCard'
import { updateData } from '../../utility'
import BraftEditor from 'braft-editor'
const { Paragraph } = Typography;
const API_URL = window.API_URL
const { Dragger } = Upload;

function ProjectUpload({ history, match, upload, file, onSuccess }) {
  let submit = ''
  const [fileArray, setFileArray] = useState(file)
  const [isWating, setWating] = useState(false);

  const validation = {
    'upload': [
      {
        error: '必须填写说明',
        validate: v => !v.isEmpty()
      }
    ],
  }

  const { errors, field, handleSubmit } = useForm(onSubmit, undefined, validation)

  function onSubmit(v) {
    setWating(true)
    const data = {
      ...v,
      upload: v.upload.toHTML(),
      upload_files: fileArray
    }
    if (submit === 'upload') {
      if (fileArray.length === 0) {
        message.info('没有文件，提交取消')
        console.log('No file.')
        return false
      }
      data.confirm = 1
    }
    const path = `/projects/${match.params.project_id}/upload`
    updateData(path, data).then(() => {
      onSuccess()
    }).finally(() => {
      setWating(false)
    })
  }
  const removeFile = key => {
    setFileArray(fileArray.filter(item => { return item.id !== key }))
  }

  const imgRender = [...fileArray].reverse().map(item =>
    <Col key={item.id} xs={24} md={8} className='m-t:1'>
      <Card 
        cover={<ImgCard file={item} />}>
        <Icon type="close-circle" theme="twoTone" onClick={() => removeFile(item.id)} /><div className='fl:r'>{item.name}.{item.format}</div>
      </Card>
    </Col>
  )

  const uploadArgs = {
    name: 'file',
    action: `${API_URL}/files`,
    withCredentials: true,
    multiple: true,
    onChange(info) {
      if (info.file.status !== 'uploading') {
      }
      if (info.file.status === 'done') {
        const res = info.file.response
        setFileArray(fileArray.concat(res))
      } else if (info.file.status === 'error') {
        console.log(info.file.response)
      }
    },
  };

  return (
    <Row type="flex" justify="space-around" align="middle" style={{ height: '100%', overflowY: 'scroll' }}>
      <Col xs={24} md={20} lg={16}>
        <form onSubmit={handleSubmit}>
          <Paragraph>*说明</Paragraph>
          <Card className='m-b:2' size='small'
            cover={
              <BraftEditor contentStyle={{ height: '200px' }}
                {...field('upload', BraftEditor.createEditorState(upload))}
                controls={['bold', 'headings', 'separator', 'link', 'separator']}
              />}
          >
            {errors['upload'] && <Alert message={errors['upload']} type="error" />}
          </Card>
          <div className='m-b:2'>
            <Paragraph>*文件</Paragraph>
            <Dragger className='m-b:1' {...uploadArgs}>
              <Icon type="inbox" />
              添加文件
            </Dragger>
            <Row gutter={12}>
              {imgRender}
            </Row>
          </div>
          <Row gutter={12}>
            <Col span={12}>
              <Button name='upload' size='large' block type="primary" disabled={isWating} onClick={(e) => submit = e.target.name} htmlType="submit">提交</Button>
            </Col>
            <Col span={12}>
              <Button name='save' size='large' block disabled={isWating} onClick={(e) => submit = e.target.name} htmlType="submit">保存</Button>
            </Col>
          </Row>
        </form >
      </Col>
    </Row>
  )
}

export default withRouter(ProjectUpload)