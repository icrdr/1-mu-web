import React, { useContext } from 'react';
import { Route, withRouter } from 'react-router-dom'
import { globalContext } from '../App';
import { Icon, Menu } from 'antd';
import Basic from './Basic'

function Admin({ location, history, props, component: Component, ...rest }) {
  const { meData } = useContext(globalContext);

  if (meData.role !== 'Admin') {
    return <h1>你没有admin权限</h1>
  }

  return (
    <Route {...rest} render={matchProps => (
      <Basic menutheme='dark' menuItems={[
        <Menu.Item key="/admin/projects"><Icon type="unordered-list" />企划列表</Menu.Item>,
        <Menu.Item key="/admin/users"><Icon type="user" />用户列表</Menu.Item>,
        <Menu.Item key="/admin/groups"><Icon type="usergroup-add" />小组列表</Menu.Item>,
        <Menu.Item key="/admin/option"><Icon type="setting" />设置</Menu.Item>
      ]}><Component {...matchProps} {...props} /></Basic>
    )} />
  )
}

export default withRouter(Admin)