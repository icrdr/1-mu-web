import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { PictureFilled } from "@ant-design/icons";
import { Card, Button, Row, Col, message, Upload, Modal, Switch } from "antd";
import { ContentUtils } from "braft-utils";
import BraftEditor from "braft-editor";
import { updateData, uploadData } from "../../utility";
const { confirm } = Modal;
function ProjectFeedback({ match, phase, onSuccess }) {
  const [isWating, setWating] = useState(false);
  const [isPause, setPause] = useState(false);
  const [content, setContent] = useState(
    BraftEditor.createEditorState(phase.client_feedback)
  );
  const [imgList, setImgList] = useState(phase.files);

  function onSubmit(isPass = false) {
    if (content.isEmpty()) {
      message.warn("没有填写任何内容");
      return false;
    }
    setWating(true);
    const idList = [];
    for (const img of imgList) {
      idList.push(img.id);
    }
    const path = `/projects/${match.params.project_id}/feedback`;
    const data = {
      feedback: content.toHTML(),
      files: idList,
      confirm: 1
    };

    if (isPause) {
      data.is_pause = 1;
    }

    if (isPass) {
      data.is_pass = 1;
    }

    updateData(path, data)
      .then(res => {
        onSuccess();
      })
      .finally(() => {
        setWating(false);
      });
  }

  const uploadHandler = async param => {
    if (!param.file) {
      return false;
    }
    const path = "/files";
    let formData = new FormData();
    formData.append("file", param.file);

    await uploadData(path, formData).then(res => {
      const url = res.data.previews[0].url;
      setImgList(prevState => [...prevState, res.data]);
      setContent(prevState =>
        ContentUtils.insertMedias(prevState, [{ type: "IMAGE", url: url }])
      );
    });
  };

  const extendControls = [
    {
      key: "antd-uploader",
      type: "component",
      component: (
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={uploadHandler}
        >
          {/* 这里的按钮最好加上type="button"，以避免在表单容器中触发表单提交，用Antd的Button组件则无需如此 */}
          <button
            type="button"
            className="control-item button upload-button"
            data-title="插入图片"
          >
            <PictureFilled />
          </button>
        </Upload>
      )
    }
  ];

  function showPassConfirm() {
    confirm({
      title: "确认",
      content: "您确定通过该阶段么？",
      okText: "确认通过",
      cancelText: "取消",
      onOk() {
        onSubmit(true);
      },
      onCancel() {}
    });
  }

  function showModifyConfirm() {
    confirm({
      title: "确认",
      content: "你确定提交的修改建议么？",
      okText: "确认建议",
      cancelText: "取消",
      onOk() {
        onSubmit(false);
      },
      onCancel() {}
    });
  }

  return (
    <Row type="flex" justify="space-around" align="middle">
      <Col xs={24} md={20} lg={16}>
        <div className="m-b:1">
          <span className="m-r:.5">是否公开</span>
          <Switch checked={isPause} onChange={checked => setPause(checked)} />
        </div>
        <Card
          size="small"
          cover={
            <BraftEditor
              contentStyle={{ height: "400px" }}
              value={content}
              onChange={v => setContent(v)}
              controls={["bold", "headings", "separator", "link", "separator"]}
              extendControls={extendControls}
            />
          }
        ></Card>
        <Row className="m-t:2" gutter={12}>
          <Col span={12}>
            <Button
              size="large"
              block
              disabled={isWating}
              onClick={e => {
                showPassConfirm();
              }}
            >
              通过
            </Button>
          </Col>
          <Col span={12}>
            <Button
              size="large"
              block
              type="primary"
              disabled={isWating}
              onClick={e => {
                showModifyConfirm();
              }}
            >
              返修
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default withRouter(ProjectFeedback);
