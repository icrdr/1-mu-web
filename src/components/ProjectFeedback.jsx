import React, {  } from 'react'
import { Card, Typography, Button, Row, Col, Alert } from 'antd';
import useForm from '../hooks/useForm'
import axios from 'axios'
import BraftEditor from 'braft-editor'
const { Paragraph } = Typography;
const SERVER_URL = window.SERVER_URL

export default function ProjectFeedback({ history, match, feedback, callback }) {
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
    let final = {
      ...v,
      feedback: v.feedback.toHTML(),
    }
    if (submit === 'feedback') {
      final['action'] = 'modify'
    }
    console.log(final);
    let url = SERVER_URL + '/api/projects/' + match.params.project_id
    axios.put(url, {
      ...final,
    }, { withCredentials: true }
    ).then(res => {
      console.log(res.data)
      if (submit === 'feedback') {
        history.push(`/projects/${match.params.project_id}/stages/${match.params.stage_index}`)
        callback()
      }
    }).catch(err => {
      if (err.response) console.log(err.response.data)
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