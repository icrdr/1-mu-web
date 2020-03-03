import React, { useContext } from "react";
import { Card, Form, Input, Button } from "antd";
import { globalContext } from "../App";

import { updateData } from "../utility";

export default function Main({ history }) {
  const { meData } = useContext(globalContext);

  const onFinish = values => {
    const path = `/users/${meData.id}`;
    updateData(path, values).then(() => {
      history.go(0);
    });
  };

  const onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Card>
        <Form
          name="basic"
          initialValues={{
            remember: true
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="新昵称"
            name="name"
            rules={[
              {
                required: true,
                message: "不能为空"
              }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
