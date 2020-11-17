import React from "react";
import { Route, withRouter } from "react-router-dom";
import moment from "moment";
import "moment/locale/zh-cn";
import { Menu, Icon } from "antd";
import Basic from "./Basic";
const { SubMenu } = Menu;
moment.locale("zh-cn");

function Web({ location, history, props, component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(matchProps) => (
        <Basic
          menutheme="light"
          menuItems={[
            <Menu.Item key="/dashboard">
              <Icon type="dashboard" />
              仪表盘
            </Menu.Item>,
            <Menu.Item key="/projects">
              <Icon type="unordered-list" />
              企划列表
            </Menu.Item>,
            <SubMenu
              key="imgs"
              title={
                <span>
                  <Icon type="file-image" />
                  资源图库
                </span>
              }
            >
              <Menu.Item key="/drafts">
                <Icon type="edit" />
                草图备选
              </Menu.Item>
              <Menu.Item key="/resources">
                <Icon type="file-image" />
                参考图库
              </Menu.Item>
              <Menu.Item key="/samples">
                <Icon type="inbox" />
                样图图库
              </Menu.Item>
              <Menu.Item key="/bdsamples">
                <Icon type="inbox" />
                百度样图图库
              </Menu.Item>
              <Menu.Item key="/dones">
                <Icon type="fund" />
                成品图库
              </Menu.Item>
            </SubMenu>,
          ]}
        >
          <Component {...matchProps} {...props} />
        </Basic>
      )}
    />
  );
}
export default withRouter(Web);
