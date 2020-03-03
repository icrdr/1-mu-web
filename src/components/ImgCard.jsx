import React from "react";
import { FileOutlined } from "@ant-design/icons";
export default function ImgCard({ file }) {
  return file.previews.length > 0 ? (
    <img width="100%" alt="img" src={file.previews[0].url} />
  ) : (
    <div
      className="t-a:c"
      style={{
        height: "100%",
        width: "100%",
        lineHeight: "120px",
        background: "#eee"
      }}
    >
      <h1 className="m:0" style={{ color: "#1890ff" }}>
        <FileOutlined />.{file.format}
      </h1>
    </div>
  );
}
