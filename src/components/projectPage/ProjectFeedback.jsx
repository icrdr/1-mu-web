import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Card, Typography, Button, Row, Col, Alert, Modal } from 'antd';
import useForm from '../../hooks/useForm'
import BraftEditor from 'braft-editor'
import { updateData } from '../../utility'
const { Paragraph } = Typography;
const { confirm } = Modal;
function ProjectFeedback({ history, match, feedback, onSuccess }) {
  let submit = ''
  const [isWating, setWating] = useState(false);

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
    setWating(true)
    let path
    const data = {
      ...v,
      feedback: v.feedback.toHTML(),
    }

    if (submit === 'modify') {
      data.confirm = 1
      path = `/projects/${match.params.project_id}/modify`
    } else {
      path = `/projects/${match.params.project_id}/finish`
    }

    updateData(path, data).then(res => {
      onSuccess()
    }).finally(() => {
      setWating(false)
    })
  }

  function showPassConfirm() {
    confirm({
      title: '确认',
      content: '您确定通过该阶段么？',
      okText: '确认通过',
      cancelText: '取消',
      onOk() {
        handleSubmit()
      },
      onCancel() {
      },
    });
  }
  
  function showModifyConfirm() {
    confirm({
      title: '确认',
      content: '您确定提交的修改内容么？',
      okText: '确认修改内容',
      cancelText: '取消',
      onOk() {
        handleSubmit()
      },
      onCancel() {
      },
    });
  }

  return (
    <Row type="flex" justify="space-around" align="middle">
      <Col xs={24} md={20} lg={16}>
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
            <Button name='pass' size='large' block disabled={isWating}
              onClick={(e) => {
                submit = e.target.name
                showPassConfirm()
              }}
            >通过</Button>
          </Col>
          <Col span={12}>
            <Button name='modify' size='large' block type="primary" disabled={isWating}
              onClick={(e) => {
                submit = e.target.name
                showModifyConfirm()
              }}
            >返修</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default withRouter(ProjectFeedback)