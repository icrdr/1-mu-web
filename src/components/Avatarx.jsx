import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
export default function Avatarx({ url, name, size, ...rest }) {
  if (url) {
    return <Avatar size={size} src={url} {...rest} />;
  }

  if (name) {
    return (
      <Avatar
        size={size}
        style={{
          color: "#f56a00",
          fontSize: `${size * 0.5}px`,
          backgroundColor: "#fde3cf"
        }}
        {...rest}
      >
        {name[0].toUpperCase()}
      </Avatar>
    );
  }

  return <Avatar size={size} icon={<UserOutlined />} {...rest} />;
}
