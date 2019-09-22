import React,{useState} from 'react'
import { Card, Typography, Button, Icon, Alert, Upload } from 'antd';
import useForm from '../../hooks/useForm'
import BraftEditor from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import { uploadData, updateData } from '../../utility'
const { Paragraph } = Typography;

export default function ProjectDesign({ history, match, design, onSuccess }) {
  const [content, setContent] = useState(BraftEditor.createEditorState(design))
  function onSubmit(v) {
    const path = `/projects/${match.params.project_id}`
    const data = {
      ...v,
      design: v.design.toHTML(),
    }

    updateData(path, data).then(res => {
      history.push(`/projects/${match.params.project_id}/design`)
      onSuccess()
    })
  }

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

    setContent(ContentUtils.insertMedias(preState['design'], [{type: 'IMAGE', url: url}]))
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
  return (<>
    <h1>初始设计稿</h1>
      <Paragraph>*修改</Paragraph>
      <Card size='small' cover={
          <BraftEditor contentStyle={{ height: '600px' }}
            value={content}
            onChange={v=>setContent(v)}
            controls={['bold', 'headings', 'separator', 'link', 'separator']}
            extendControls={extendControls}
          />}
      >
      </Card>
      <Button size='large' block type="primary" onClick={onSubmit}>保存</Button>
    </>
  )
}