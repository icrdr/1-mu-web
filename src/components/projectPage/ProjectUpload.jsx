import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Card, Button, Row, Col, Upload, Icon, message, Modal } from 'antd';
import { ContentUtils } from 'braft-utils'
import ImgCard from '../ImgCard'
import { updateData, uploadData } from '../../utility'
import BraftEditor from 'braft-editor'
const { confirm } = Modal;
const { Dragger } = Upload;
const API_URL = window.API_URL


function ProjectUpload({ match, phase, onSuccess }) {
  const [fileArray, setFileArray] = useState(phase.upload_files)
  const [fileList, setFileList] = useState([])
  const [isWating, setWating] = useState(false);
  const [content, setContent] = useState(BraftEditor.createEditorState(phase.creator_upload))
  const [imgList, setImgList] = useState(phase.files)

  function onSubmit(isSave = false) {
    if (content.isEmpty()) {
      message.warn('没有填写任何内容')
      return false
    }

    setWating(true)
    const idList = []
    for (const img of imgList){
      idList.push(img.id)
    }
    const path = `/projects/${match.params.project_id}/upload`
    const data = {
      upload: content.toHTML(),
      upload_files: fileArray,
      files: idList,
    }

    if (!isSave) {
      if (fileArray.length === 0) {
        message.info('没有文件，提交取消')
        console.log('No file.')
        setWating(false)
        return false
      }
      data.confirm = 1
    }

    
    updateData(path, data).then(() => {
      onSuccess()
    }).finally(() => {
      setWating(false)
    })
  }
  const uploadHandler = async (param) => {
    if (!param.file) {
      return false
    }
    const path = '/files'
    let formData = new FormData();
    formData.append('file', param.file);

    await uploadData(path, formData).then(res => {
      const url = res.data.previews[0].url
      setImgList(prevState => [...prevState, res.data])
      setContent(prevState => ContentUtils.insertMedias(prevState, [{ type: 'IMAGE', url: url }]))
    })
  }

  const extendControls = [
    {
      key: 'antd-uploader',
      type: 'component',
      component: (
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={uploadHandler}
        >
          {/* 这里的按钮最好加上type="button"，以避免在表单容器中触发表单提交，用Antd的Button组件则无需如此 */}
          <button type="button" className="control-item button upload-button" data-title="插入图片">
            <Icon type="picture" theme="filled" />
          </button>
        </Upload>
      )
    }
  ]

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

  function showUploadConfirm() {
    confirm({
      title: '确认',
      content: '您确定提交内容（提交后无法再改）？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        onSubmit(false)
      },
      onCancel() {
      },
    });
  }

  return (
    <Row type="flex" justify="space-around" align="middle" style={{ height: 'auto' }}>
      <Col xs={24} md={20} lg={16}>
        <div className='m-b:2'>
          <Dragger className='m-b:1' {...uploadArgs}>
            <Icon type="inbox" />
            添加文件
            </Dragger>
        </div>
        <Row gutter={12} className='m-b:2' style={{ height: '200px', overflowY: 'scroll' }}>
          {imgRender}
        </Row>
        <Card className='m-b:2' size='small'
          cover={
            <BraftEditor contentStyle={{ height: '100px' }}
            value={content}
            onChange={v => setContent(v)}
            controls={['bold', 'headings', 'separator', 'link', 'separator']}
            extendControls={extendControls}
            />}
        >
        </Card>
        <Row gutter={12}>
          <Col span={12}>
            <Button size='large' block type="primary" disabled={isWating}
              onClick={(e) => {
                showUploadConfirm()
              }}
            >上传</Button>
          </Col>
          <Col span={12}>
            <Button size='large' block disabled={isWating}
              onClick={(e) => {
                onSubmit(true)
              }}
            >保存</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default withRouter(ProjectUpload)