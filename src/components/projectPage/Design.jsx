import React, { useContext, useState } from "react";
import { withRouter } from "react-router-dom";
import { PictureFilled } from "@ant-design/icons";
import { Button, message, Upload, Card } from "antd";
import BraftEditor from "braft-editor";
import { ContentUtils } from "braft-utils";
import { uploadData, updateData } from "../../utility";
import { globalContext } from "../../App";

function Design({ match, project, onSuccess, history }) {
  const { meData } = useContext(globalContext);
  const [isEdit, setEdit] = useState(false);
  const [content, setContent] = useState(
    BraftEditor.createEditorState(project.design)
  );
  const [imgList, setImgList] = useState(project.files);

  function onSubmit() {
    if (content.isEmpty()) {
      message.warn("没有填写任何内容");
      return false;
    }
    const path = `/projects/${match.params.project_id}`;
    const idList = [];
    for (const img of imgList) {
      idList.push(img.id);
    }
    const data = {
      design: content.toHTML(),
      files: idList
    };

    updateData(path, data).then(res => {
      history.push(`/projects/${match.params.project_id}`);
      onSuccess();
    });
  }

  const uploadHandler = async param => {
    if (!param.file) {
      return false;
    }
    const path = "/files";
    let formData = new FormData();
    formData.append("file", param.file);

    uploadData(path, formData).then(res => {
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

  return (
    <>
      <h1>初始设计稿</h1>
      {isEdit ? (
        <>
          <Card
            size="small"
            cover={
              <BraftEditor
                contentStyle={{ height: "600px" }}
                value={content}
                onChange={v => setContent(v)}
                controls={[
                  "bold",
                  "headings",
                  "separator",
                  "link",
                  "separator"
                ]}
                extendControls={extendControls}
              />
            }
          ></Card>
          <Button size="large" block type="primary" onClick={onSubmit}>
            保存
          </Button>
        </>
      ) : (
        <>
          <div
            dangerouslySetInnerHTML={{
              __html: project.design
            }}
          />
          {project.client.id === meData.id || meData.role === "Admin" ? (
            <Button size="large" onClick={() => setEdit(!isEdit)} block>
              修改
            </Button>
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
}

export default withRouter(Design);
