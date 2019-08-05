import React, { useState, useEffect } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'

import LoginQrcode from '../components/LoginQrcode'
import useLogin from '../hooks/useLogin'
import Loading from '../components/Loading'
import Avatarx from '../components/Avatarx'


import { Layout, Button, Menu, Icon } from 'antd';

const { Header, Content, Footer } = Layout;

export const meContext = React.createContext();

function Dashboard({ location, history, component: Component, ...rest }) {

  const { meData, status } = useLogin()
  const [menu, setMenu] = useState(['']);

  useEffect(() => {
    setMenu([location.pathname.split('/')[2]])
  }, [location])
  const changeMenu = ({ key }) => {
    setMenu([key])
    history.replace('/admin/' + key)
  }

  switch (status) {
    case 'pending':
      return <Loading />
    case 'no':
    case 'error':
      return <LoginQrcode />
    default:
      if (meData.role !== 'Admin') {
        return <h1>你没有admin权限</h1>
      }
  }

  return (
    <Route {...rest} render={matchProps => (
      <meContext.Provider
        value={{ meData }}
      >

        <Layout>
          <Header className="p:0" style={{ background: '#fff' }} >
            <Menu
              theme="dark"
              mode="horizontal"
              style={{ lineHeight: '64px' }}
              selectedKeys={menu}
              onClick={changeMenu}
            >
              <Menu.Item key="users">
                <Icon type="pie-chart" />
                <span>用户列表</span>
              </Menu.Item>
              <Menu.Item key="projects">
                <Icon type="desktop" />
                <span>企划列表</span>
              </Menu.Item>
              <Menu.Item key="groups">
                <Icon type="file" />
                <span>小组列表</span>
              </Menu.Item>
            </Menu>
            {meData && <Link to={'/users/' + meData.id}><div className="pos:a top:0 right:2">
              <Button type="link">{meData.name}</Button>
              <Avatarx url={meData.avatar_url} name={meData.name} />
            </div></Link>}
          </Header>
          <Content className="m-x:2 m-t:4 pos:r">
            <Component {...matchProps} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
        </Layout>
      </meContext.Provider>
    )} />
  )
}

export default withRouter(Dashboard)