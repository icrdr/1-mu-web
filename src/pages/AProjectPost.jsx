import React, { useState } from 'react'
import { Card, Input, InputNumber, Button, Icon, Row, Col, Alert, Typography, Select,Upload } from 'antd';
import useForm from '../hooks/useForm'
import { ContentUtils } from 'braft-utils'
import { postData, uploadData, fetchData } from '../utility'
import BraftEditor from 'braft-editor'
const { Title, Paragraph } = Typography;

function PostProjectForm({ history }) {
  let submit = ''
  const [stageArray, setStageArray] = useState([0])
  const [stageKey, setStageKey] = useState(0)
  const [creatorArray, setCreatorArray] = useState([0])
  const [creatorKey, setCreatorKey] = useState(0)

  const validation = {
    'title': [
      {
        error: '请填写标题',
        validate: v => va.isRequired(v)
      },
      {
        error: '标题内容不要超过30个字符',
        validate: v => va.inLength(v, 1, 30)
      }
    ],
    // 'design': [
    //   {
    //     error: '请填写设计',
    //     validate: v => !v.isEmpty()
    //   }
    // ],
    'client_id': [
      {
        error: 'id不存在',
        validate: v => isUserExist(v)
      }
    ],
    'creators': [
      {
        error: '制作方间不可重复',
        validate: v => va.isUniqueArr(v)
      }
    ]
  }

  const { va, errors, setValues, field, validate, handleSubmit } = useForm(onSubmit, undefined, validation)

  function onSubmit(v) {
    const path = '/projects'
    const data = {
      ...v, 
      design: v.design.isEmpty() ? '<p>企划初始设计<p>' : v.design.toHTML()
    }
    //auto complete
    if (!data.title) data.title = '[企划标题]'
    for (let i in data.stages) {
      const stage = data.stages[i]
      if (!stage.stage_name) stage.stage_name = '[阶段名]'
    }
    if (submit === 'post') {
      data.confirm = 1
    }
    postData(path, data).then(res => {
      if (submit === 'post') {
        history.push("/admin/projects/" + res.data.id)
      }
    })
  }

  const removeStage = k => {
    setStageArray(stageArray.filter((key, index) => { return k !== key }))
  }

  const addStage = () => {
    setStageKey(stageKey + 1)
    setStageArray(stageArray.concat(stageKey + 1))
  }

  const removeCreator = k => {
    setCreatorArray(creatorArray.filter((key, index) => { return k !== key }))
  }

  const addCreator = () => {
    setCreatorKey(creatorKey + 1)
    setCreatorArray(creatorArray.concat(creatorKey + 1))
  }

  const stagesRender = stageArray.map((k, i) => {
    // validation[`stages[${k}].stage_name`] = [
    //   {
    //     error: '请填写阶段名',
    //     validate: v => va.isRequired(v)
    //   }
    // ]
    // validation[`stages[${k}].days_need`] = [
    //   {
    //     error: '不能大于56天，不能少于2天',
    //     validate: v => va.inRange(v, 2, 56)
    //   }
    // ]
    return (
      <Card key={k} className='m-b:2'>
        <Row className='pos:r' gutter={12}>
          <Col span={12}>
            <Paragraph>*阶段名称</Paragraph>
            <Input {...field(`stages[${k}].stage_name`, undefined, true)} placeholder="概括阶段工作" />
            {errors[`stages[${k}].stage_name`] && <Alert message={errors[`stages[${k}].stage_name`]} type="error" showIcon />}
          </Col>
          <Col span={12}>
            <Paragraph>*计划天数</Paragraph>
            <InputNumber {...field(`stages[${k}].days_need`, 7)} defaultValue={3} min={1} max={56} />
            {errors[`stages[${k}].days_need`] && <Alert message={errors[`stages[${k}].days_need`]} type="error" showIcon />}
          </Col>
          {i === 0 ? null :
            (<Icon className='pos:a' style={{ top: '0', right: '0' }} theme="twoTone" type="close-circle" onClick={() => removeStage(k)} />)
          }
        </Row>
      </Card>)
  })

  const creatorsRender = creatorArray.map((k, i) => {
    validation[`creators[${k}]`] = [
      {
        error: 'id不存在',
        validate: v => isUserExist(v)
      }
    ]
    return (
      <div key={k} className='m-l:.5 m-b:.5'>
        <InputNumber {...field(`creators[${k}]`, 1, true)} />
        {i === 0 ? null : <Icon type="close" className='m-l:.5' onClick={() => removeCreator(i)} />}
        {errors[`creators[${k}]`] && <Alert message={errors[`creators[${k}]`]} type="error" showIcon />}
      </div>
    )
  })
  const uploadHandler = async (param) => {
    if (!param.file) {
      return false
    }
    const path = '/files'
    let formData = new FormData();
    formData.append('file', param.file);

    let url = ''
    await uploadData(path, formData).then(res => {
      url = res.data.previews[0].url
    })

    setValues(preState=> {return {
      ...preState,
      'design':ContentUtils.insertMedias(preState['design'], [{
        type: 'IMAGE',
        url: url
      }])
    }})
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
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Paragraph>*企划名</Paragraph>
        <Input {...field('title', '', true)} placeholder="不宜超过30个字符" />
        {errors['title'] && <Alert message={errors['title']} type="error" showIcon />}
      </div>
      <Row className='m-t:2'>
        <Col xs={24} md={8} className='m-b:2'>
          <Paragraph>*发起方</Paragraph>
          <InputNumber {...field('client_id', 1, true)} />
          {errors['client_id'] && <Alert message={errors['client_id']} type="error" showIcon />}
        </Col>
        <Col xs={24} md={16}>
          <Paragraph>*制作方</Paragraph>
          <div className='d:f flx-w:w' onBlur={() => validate('creators')}>
            <Button className='m-b:.5' onClick={() => addCreator()} >添加制作方</Button>
            {creatorsRender}
          </div>
          {errors['creators'] && <Alert message={errors['creators']} type="error" showIcon />}
        </Col>
      </Row>
      
      <div className='m-t:1'>
        <Paragraph>*设计初稿</Paragraph>
        <Card size='small' cover={
          <BraftEditor contentStyle={{ height: '400px' }}
            placeholder="初始设计简单描述，或者填写企划方要求。作为日后凭证依据。"
            {...field('design', BraftEditor.createEditorState(null), true)}
            controls={['bold', 'headings', 'separator', 'link', 'separator']}
            extendControls={extendControls}
          />
        }>
          {errors['design'] && <Alert message={errors['design']} type="error" showIcon />}
        </Card>
      </div>
      <div className='m-t:2'>
        <Paragraph>*验收阶段</Paragraph>
        {stagesRender}
        <Button onClick={() => addStage()} block>添加验收阶段</Button>
      </div>
      <div className='m-t:2'>
      <Paragraph>标签</Paragraph>
      <Select mode="tags" style={{ width: '100%' }} {...field('tags')}/>
      </div>
      <Row className='m-t:2' gutter={12}>
        <Col span={12}>
          <Button block type="primary" name='post' onClick={(e) => submit = e.target.name} htmlType="submit">提交</Button>
        </Col>
        <Col span={12}>
          <Button disabled block htmlType="submit">保存</Button>
        </Col>
      </Row>
    </form>
  )
}

export default function ProjectPost({ history }) {
  return (
    <Card className='p:2'>
      <Row type="flex" justify="space-around" align="middle">
        <Col xs={24} md={20} lg={16}>
          <Title>企划编辑</Title>
          <PostProjectForm history={history} />
        </Col>
      </Row>
    </Card>
  )
}

function isUserExist(v) {
  return new Promise(resolve => {
    const path = '/users'
    const params = {
      include: v
    }
    fetchData(path, params, false).then(res => {
      resolve(true)
    }).catch(err => {
      resolve(false)
    })
  });
}