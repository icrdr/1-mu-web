import React, { useState } from 'react'
import useWxLogin from '../hooks/useWxLogin'
import FilesList from '../components/FilesList'
import { Upload, message, Icon, Card, Row, Col } from 'antd';
import { hasToken } from '../utility'
import LoginQrcode from '../components/LoginQrcode'
const { Dragger } = Upload;
const SERVER_URL = window.SERVER_URL

export default function Main(props) {

  const wxLoginState = useWxLogin(props)
  const [update, setUpdate] = useState(0);
  switch (wxLoginState) {
    case 'pending':
      return <div>loading...</div>;
    case 'error':
      window.history.replaceState(null, null, window.location.pathname);
      return <div>error!</div>;
    default:
      window.history.replaceState(null, null, window.location.pathname);
      break;
  }

  const args = {
    name: 'file',
    action: `${SERVER_URL}/api/files`,
    withCredentials: true,
    multiple: true,
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

  if (!hasToken()) {
    return <LoginQrcode />
  }

  return (
    <Row type="flex" justify="space-around" align="middle">
      <Col xs={24} md={20}>
        <Card>
          <Dragger  {...args}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other
              band files
              </p>
          </Dragger>
          <FilesList update={update} />
        </Card>
      </Col>
    </Row>
  )
}
