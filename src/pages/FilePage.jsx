import React, { useState } from 'react'
import useWxLogin from '../hooks/useWxLogin'
import FilesList from '../components/FilesList'
import { Upload, message, Button, Icon, Card, Row, Col } from 'antd';

const DOMAIN_URL = window.DOMAIN_URL

export default function MainPage(props) {

  const wxLoginState = useWxLogin(props)
  const [update, setUpdate] = useState(0);
  switch (wxLoginState) {
    case 'pending':
      return <div>loading...</div>;
    case 'error':
      return <div>error!</div>;
    default:
      break;
  }
  const args = {
    name: 'file',
    action: `${DOMAIN_URL}/api/file`,
    withCredentials: true,
    showUploadList: false,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        setUpdate(update + 1)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  return (
    <Row type="flex" justify="space-around" align="middle">
      <Col>
        <Card style={{ width: 900 }}>

          <Upload {...args}>
            <Button>
              <Icon type="upload" /> Click to Upload
            </Button>
          </Upload>
          <FilesList update={update} />
        </Card>
      </Col>
    </Row>

  )
}
