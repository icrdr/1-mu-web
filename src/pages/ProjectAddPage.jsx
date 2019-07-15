import React, { useState } from 'react'
import { Card, Form, Input, InputNumber, Button, Icon, Row, Col } from 'antd';
const { TextArea } = Input;

function ProjectForm({ form }) {

  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = form;

  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const { keys, names } = values;
        console.log('Received values of form: ', values);
        console.log('Merged values:', keys.map(key => names[key]));
      }
    });
  }
  const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  }
  const [stageKey, setStageKey] = useState(1)

  const removeStage = key => {
    // get stageKeys object
    const stageKeys = getFieldValue('stageKeys');

    // need at least one stage
    if (stageKeys.length === 1) return
    // kick the select 'key' number from 'stageKeys' array
    const newKeys = stageKeys.filter(k => k !== key)

    // set stageKeys
    setFieldsValue({ stageKeys: newKeys });
  };


  const addStage = () => {
    // get stageKeys object
    const stageKeys = getFieldValue('stageKeys');

    setStageKey(stageKey + 1)
    const newKeys = stageKeys.concat(stageKey);

    // set stageKeys
    setFieldsValue({ stageKeys: newKeys });
  };

  // generate a antd feild with name 'stageKeys'
  getFieldDecorator('stageKeys', { initialValue: [0] });

  // get stageKeys object
  const stageKeys = getFieldValue('stageKeys');
  // render stages object from stageKeys
  const stagesRender = stageKeys.map((key, index) => (
    <Card className='m-t:4' key={key} size="small"
      title={getFieldValue(`stageNames_${key}`) ? (
        '阶段：' + getFieldValue(`stageNames_${key}`)
      ) : '验收阶段'}
      extra={index > 0 ? (
        <Icon
          type="close" style={{fontSize:'20px'}}
          onClick={() => removeStage(key)}
        />
      ) : null}
    >
      <Form.Item {...formLayout} label='阶段名称'>
        {getFieldDecorator(`stageNames_${key}`, {
          rules: [
            {
              required: true,
              whitespace: true,
              message: "请输入阶段名称",
            },
          ],
        })(
          <Input placeholder="阶段名称" />
        )}
      </Form.Item>
      <Form.Item {...formLayout} label='需要'>
        {getFieldDecorator(`stageDaysNeed_${key}`, {
          initialValue: 3,
          rules: [
            {
              required: true,
            },
          ],
        })(
          <InputNumber min={1} max={56} />
        )}
        <span className='p-x:2'>天</span>
      </Form.Item>

    </Card>
  ));

  return (
    <Form onSubmit={handleSubmit} className="login-form">
      <Form.Item label={'企划名'}>
        {getFieldDecorator('name', {
          rules: [
            { required: true, message: '必须输入' }
          ],
        })(
          <Input placeholder="企划名" />,
        )}
      </Form.Item>
      <Form.Item label={'初期设计'}>
        {getFieldDecorator('design', {
          rules: [
            { required: true, message: '必须输入' }
          ],
        })(
          <TextArea rows={4} placeholder="设计" />,
        )}
      </Form.Item>
      {stagesRender}
      <Form.Item className='m-t:2'>
        <Button type="dashed"  onClick={addStage} block>
          <Icon type="plus" /> 添加验收阶段
          </Button>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          生成
          </Button>
      </Form.Item>
    </Form>
  )
}

const PostProjectForm = Form.create({})(ProjectForm);

export default function ProjectAddPage() {
  return (
    <Card>
      <Row type="flex" justify="space-around" align="middle">
        <Col span={16}>
          <PostProjectForm />
        </Col>
      </Row>
    </Card>
  )
}