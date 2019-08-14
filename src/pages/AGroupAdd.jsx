import React, { useState } from 'react'
import { Card, Input, InputNumber, Button, Icon, Row, Col, Alert, Typography } from 'antd';
import useForm from '../hooks/useForm'
import { fetchData, postData } from '../utility'
const { Title, Paragraph } = Typography;

function PostProjectForm({history}) {
  const [memberList, setMemberList] = useState([1])

  const validation = {
    'name': [
      {
        error: '请填小组名称',
        validate: v => va.isRequired(v)
      },
      {
        error: '小组名不要超过30个字符',
        validate: v => va.inLength(v, 1, 20)
      }
    ],
    'admin_id[0]': [
      {
        error: 'id不存在',
        validate: v => isUserExist(v)
      }
    ],
    'user_id': [
      {
        error: '重复了',
        validate: arr => va.isUniqueArr(arr)
      }
    ]
  }

  const { va, errors, field, validate, handleSubmit } = useForm(onSubmit, undefined, validation)

  function onSubmit(v) {
    const path = '/groups'
    const data = {
      ...v
    }
    //auto complete
    console.log(data)
    postData(path, data).then(res => {
      history.push("/admin/groups/" + res.data.id)
    })
  }

  const removeMember = i => {
    setMemberList(memberList.filter((key, index) => { return i !== index }))
  }

  const addMember = () => {
    setMemberList(memberList.concat(1))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='m-b:1'>
        <Paragraph>*小组名</Paragraph>
        <Input {...field('name', '', true)} placeholder="小组的名称" />
        {errors['name'] && <Alert message={errors['name']} type="error" showIcon />}
      </div>
      <div className='m-b:1'>
        <Paragraph>*管理员</Paragraph>
        <InputNumber {...field('admin_id[0]', 1, true)} />
        {errors['admin_id[0]'] && <Alert message={errors['admin_id[0]']} type="error" showIcon />}
      </div>
      <div className='m-b:1'>
        <Paragraph>*小组成员</Paragraph>
        {errors['user_id'] && <Alert message={errors['user_id']} type="error" showIcon />}
        <Button className='m-b:.5' onClick={addMember}>添加</Button>
        {
          memberList.map((member, index) => {
            validation[`user_id[${index}]`] = [
              {
                error: 'id不存在',
                validate: v => isUserExist(v)
              }
            ]
            return <div className='m-b:.5' key={index} onBlur={() => validate('user_id')}>
              <InputNumber className='m-r:.5' {...field(`user_id[${index}]`, 1, true)} />
              {index>0 && <Icon style={{ fontSize: '16px' }} type="close-circle" theme="twoTone"
                onClick={() => removeMember(index)} />}
              {errors[`user_id[${index}]`] && <Alert message={errors[`user_id[${index}]`]} type="error" showIcon />}
            </div>
          })
        }
      </div>
      <Button block type="primary" htmlType="submit">提交</Button>
    </form>
  )
}

export default function ProjectPost({ history }) {
  return (
    <Card className='p:2'>
      <Row type="flex" justify="space-around" align="middle">
        <Col xs={24} md={20} lg={16}>
          <Title>小组添加</Title>
          <PostProjectForm history={history} />
        </Col>
      </Row>
    </Card>
  )
}

function isUserExist(v) {
  return new Promise(resolve => {
    const path = '/users/' + v

    fetchData(path, null, false).then(() => {
      resolve(true)
    }).catch(() => {
      resolve(false)
    })
  });
}