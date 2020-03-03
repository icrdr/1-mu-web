import React, { useContext } from "react";
import { Route, withRouter } from "react-router-dom";
import { globalContext } from "../App";
import {
  SnippetsOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { Menu } from "antd";
import Basic from "./Basic";
const { SubMenu } = Menu;

function Admin({ location, history, props, component: Component, ...rest }) {
  const { meData } = useContext(globalContext);

  if (meData.role !== "Admin" && meData.role !== "Editor") {
    return <h1>你没有admin权限</h1>;
  }

  return (
    <Route
      {...rest}
      render={matchProps => (
        <Basic
          menutheme="dark"
          menuItems={[
            <SubMenu
              key="project"
              title={
                <span>
                  <SnippetsOutlined />
                  企划
                </span>
              }
            >
              <Menu.Item key="/admin/projects">
                <UnorderedListOutlined />
                总列表
              </Menu.Item>
              <Menu.Item key="/admin/recycle">
                <DeleteOutlined />
                回收站
              </Menu.Item>
            </SubMenu>,
            <Menu.Item key="/admin/users">
              <UserOutlined />
              用户
            </Menu.Item>,
            <Menu.Item key="/admin/groups">
              <UsergroupAddOutlined />
              小组
            </Menu.Item>,
            <Menu.Item key="/admin/option">
              <SettingOutlined />
              设置
            </Menu.Item>
          ]}
        >
          <Component {...matchProps} {...props} />
        </Basic>
      )}
    />
  );
}

export default withRouter(Admin);
