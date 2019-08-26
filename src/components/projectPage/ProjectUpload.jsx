import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Card, Typography, Button, Row, Col, Upload, Icon, Alert, message, Modal } from 'antd';
import useForm from '../../hooks/useForm'
import ImgCard from '../ImgCard'
import { updateData } from '../../utility'
import BraftEditor from 'braft-editor'
const { Paragraph } = Typography;
const { confirm } = Modal;
const { Dragger } = Upload;
const API_URL = window.API_URL


function ProjectUpload({ history, match, upload, file, onSuccess }) {
  let submit = ''
  const [fileArray, setFileArray] = useState(file)
  const [fileList, setFileList] = useState([])
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
        setWating(false)
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
    <Col key={item.id} xs={24} md={8} className='m-b:1'>
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
    fileList: fileList,
    onChange({ file, fileList }) {
      setFileList([...fileList])
      if (file.status !== 'uploading') {
      }
      if (file.status === 'done') {
        const res = file.response
        setFileArray(fileArray.concat(res))
        setFileList(prevstate=>{
          return prevstate.filter(f=>f.uid!==file.uid)
        })
      } else if (file.status === 'error') {
        console.log(file.response)
      }
    },
    // beforeUpload: file => {
    //   setFileList(prevState=>{return prevState.concat(file)})
    // }
  };
  function showConfirm() {
    confirm({
      title: '确认',
      content: '你确定提交内容（提交后无法再改）？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        handleSubmit()
      },
      onCancel() {
      },
    });
  }
  return (
    <Row type="flex" justify="space-around" align="middle" style={{ height: 'auto' }}>
      <Col xs={24} md={20} lg={16}>
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
        </div>
        <Row gutter={12} className='m-b:2' style={{ height: '300px', overflowY: 'scroll' }}>
          {imgRender}
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Button name='upload' size='large' block type="primary" disabled={isWating}
              onClick={(e) => {
                submit = e.target.name
                showConfirm()
              }}
            >上传</Button>
          </Col>
          <Col span={12}>
            <Button name='save' size='large' block disabled={isWating}
              onClick={(e) => {
                submit = e.target.name
                handleSubmit()
              }}
            >保存</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default withRouter(ProjectUpload)