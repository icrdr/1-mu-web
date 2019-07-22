import React, { useState } from 'react'
import { Card, Typography, Button, Row, Col, Upload, Icon, Alert } from 'antd';
import useForm from '../hooks/useForm'
import ImgCard from './ImgCard'
import axios from 'axios'
import BraftEditor from 'braft-editor'
const { Paragraph } = Typography;
const SERVER_URL = window.SERVER_URL
const { Dragger } = Upload;

export default function ProjectUpload({ history, match, upload, file }) {
  let submit = ''
  const [fileArray, setFileArray] = useState(file)

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
    let final = {
      ...v,
      upload: v.upload.toHTML(),
      upload_files: fileArray
    }
    if (submit === 'upload') {
      final['action'] = 'upload'
    }
    console.log(final);
    let url = SERVER_URL + '/api/projects/' + match.params.id
    axios.put(url, {
      ...final,
    }, { withCredentials: true }
    ).then(res => {
      console.log(res.data)
      if (submit === 'upload') {
        history.push("/projects/" + match.params.id)
      }
    }).catch(err => {
      if (err.response) console.log(err.response.data)
    })
  }
  const removeFile = key => {
    setFileArray(fileArray.filter(item => { return item.id !== key }))
  }

  const imgRender = [...fileArray].reverse().map(item =>
    <Card key={item.id} className='m-t:2'
      cover={<ImgCard file={item} />}>
      <Icon type="close" onClick={() => removeFile(item.id)} /><div className='fl:r'>{item.name}.{item.format}</div>
    </Card>
  )

  const uploadArgs = {
    name: 'file',
    action: `${SERVER_URL}/api/files`,
    withCredentials: true,
    multiple: true,
    onChange(info) {
      if (info.file.status !== 'uploading') {
      }
      if (info.file.status === 'done') {
        const res = info.file.response
        console.log(res)
        setFileArray(fileArray.concat(res))
      } else if (info.file.status === 'error') {
        console.log(info.file.response)
      }
    },
  };

  return (<>
  <h1>阶段成品提交</h1>
    <form onSubmit={handleSubmit}>
      <Paragraph>*说明</Paragraph>
      <Card size='small'
        cover={
          <BraftEditor contentStyle={{ height: '200px' }}
            {...field('upload', BraftEditor.createEditorState(upload))}
            controls={['bold', 'headings', 'separator', 'link', 'separator']}
          />}
      >
        {errors['upload'] && <Alert message={errors['upload']} type="error" />}
      </Card>
      <div className='m-t:4'>
        <Paragraph>*文件</Paragraph>
        <Dragger {...uploadArgs}>
          <Icon type="inbox" />
          添加文件
        </Dragger>
        {imgRender}
      </div>
      <Row className='m-t:2' gutter={12}>
        <Col span={12}>
          <Button name='upload' size='large' block type="primary" onClick={(e) => submit = e.target.name} htmlType="submit">提交</Button>
        </Col>
        <Col span={12}>
          <Button name='save' size='large' block onClick={(e) => submit = e.target.name} htmlType="submit">保存</Button>
        </Col>
      </Row>
    </form >
    </>
  )
}