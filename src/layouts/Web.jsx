import React from "react";
import { Route, withRouter } from "react-router-dom";
import moment from "moment";
import "moment/locale/zh-cn";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  FileImageOutlined,
  EditOutlined,
  InboxOutlined,
  FundOutlined
} from "@ant-design/icons";
import { Menu } from "antd";
import Basic from "./Basic";
const { SubMenu } = Menu;
moment.locale("zh-cn");

function Web({ location, history, props, component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <Basic
          menutheme="light"
          menuItems={[
            <Menu.Item key="/dashboard">
              <DashboardOutlined />
              仪表盘
            </Menu.Item>,
            <Menu.Item key="/projects">
              <UnorderedListOutlined />
              企划列表
            </Menu.Item>,
            <SubMenu
              key="imgs"
              title={
                <span>
                  <FileImageOutlined />
                  资源图库
                </span>
              }
            >
              <Menu.Item key="/drafts">
                <EditOutlined />
                草图备选
              </Menu.Item>
              <Menu.Item key="/resources">
                <FileImageOutlined />
                参考图库
              </Menu.Item>
              <Menu.Item key="/samples">
                <InboxOutlined />
                样图图库
              </Menu.Item>
              <Menu.Item key="/dones">
                <FundOutlined />
                成品图库
              </Menu.Item>
            </SubMenu>
          ]}
        >
          <Component {...matchProps} {...props} />
        </Basic>
      )}
    />
  );
}
export default withRouter(Web);
