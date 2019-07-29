import React from 'react'
import { Card, Typography, Button, Row, Col, Alert } from 'antd';
import useForm from '../hooks/useForm'
import BraftEditor from 'braft-editor'
import {updateData} from '../utility'
const { Paragraph } = Typography;

export default function ProjectFeedback({ history, match, feedback, onSuccess }) {
  let submit = ''
  const validation = {
    'feedback': [
      {
        error: '必须填写说明',
        validate: v => !v.isEmpty()
      }
    ],
  }

  const { errors, field, handleSubmit } = useForm(onSubmit, undefined, validation)

  function onSubmit(v) {
    const path =  `/projects/${match.params.project_id}/modify`
    const data = {
      ...v,
      feedback: v.feedback.toHTML(),
    }
    if (submit === 'feedback') {
      data.confirm = 1
    }
    updateData(path, data).then(res => {
      if (submit === 'feedback') {
        history.push(match.url.split('/').slice(0,-1).join('/'))
      }
      onSuccess()
    })
  }

  return (<>
    <h1>修改反馈提交</h1>
    <form onSubmit={handleSubmit}>
      <Paragraph>*修改意见</Paragraph>
      <Card size='small'
        cover={
          <BraftEditor contentStyle={{ height: '200px' }}
            {...field('feedback', BraftEditor.createEditorState(feedback))}
            controls={['bold', 'headings', 'separator', 'link', 'separator']}
          />}
      >
        {errors['feedback'] && <Alert message={errors['feedback']} type="error" />}
      </Card>
      <Row className='m-t:2' gutter={12}>
        <Col span={12}>
          <Button name='feedback' size='large' block type="primary" onClick={(e) => submit = e.target.name} htmlType="submit">提交</Button>
        </Col>
        <Col span={12}>
          <Button name='save' size='large' block onClick={(e) => submit = e.target.name} htmlType="submit">保存</Button>
        </Col>
      </Row>
    </form ></>
  )
}