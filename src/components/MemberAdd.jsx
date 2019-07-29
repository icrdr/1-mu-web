import React from 'react'
import { Button, Row, Col, InputNumber,Alert } from 'antd';
import { updateData, isUserExist } from '../utility'
import useForm from '../hooks/useForm'

export default function MemberAdd({ history, match, onSuccess }) {
  const validation = {
    user:[
    {
      error: 'id不存在',
      validate: v => isUserExist(v)
    }]
  }

  const {errors, field, handleSubmit } = useForm(onSubmit, undefined, validation)
  
  function onSubmit(v) {
    const path = `/groups/${match.params.group_id}/add/${v.user}`
    updateData(path).then(() => {
      onSuccess()
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Row gutter={12}>
      <Col span={3}>
        用户id
        </Col>
        <Col span={9}>
          <InputNumber {...field(`user`, 1, true)} />
          {errors['user'] && <Alert message={errors['user']} type="error" />}
        </Col>
        <Col span={12}>
          <Button block htmlType="submit">添加</Button> 
        </Col>
      </Row>
    </form>
  )
}
