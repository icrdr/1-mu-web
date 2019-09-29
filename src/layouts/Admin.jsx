import React, { useContext } from 'react';
import { Route, withRouter } from 'react-router-dom'
import { globalContext } from '../App';
import { Icon, Menu } from 'antd';
import Basic from './Basic'
const { SubMenu } = Menu

function Admin({ location, history, props, component: Component, ...rest }) {
  const { meData } = useContext(globalContext);

  if (meData.role !== 'Admin' && meData.role !== "Editor") {
    return <h1>你没有admin权限</h1>
  }

  return (
    <Route {...rest} render={matchProps => (
      <Basic menutheme='dark' menuItems={[
        <SubMenu key="project" title={<span><Icon type="snippets" />企划</span>}>
          <Menu.Item key="/admin/projects"><Icon type="unordered-list" />总列表</Menu.Item>
          <Menu.Item key="/admin/recycle"><Icon type="delete" />回收站</Menu.Item>
        </SubMenu>,
        <Menu.Item key="/admin/users"><Icon type="user" />用户</Menu.Item>,
        <Menu.Item key="/admin/groups"><Icon type="usergroup-add" />小组</Menu.Item>,
        <Menu.Item key="/admin/option"><Icon type="setting" />设置</Menu.Item>
      ]}><Component {...matchProps} {...props} /></Basic>
    )} />
  )
}

export default withRouter(Admin)