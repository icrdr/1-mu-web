import React, { useState } from 'react';
import { Route, Link } from 'react-router-dom'

import LoginQrcode from '../components/LoginQrcode'
import useLogin from '../hooks/useLogin'
import Loading from '../components/Loading'
import Avatarx from '../components/Avatarx'

import Menux from '../components/Menux'

import { Layout, Icon, Button } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

export const meContext = React.createContext();

function Dashboard({ component: Component, ...rest }) {

  const { meData, status } = useLogin()
  const [isCollapsed, setCollapse] = useState(false);
  const [isSmall, setSmall] = useState(false);

  const onCollapse = () => {
    setCollapse(!isCollapsed)
  };

  const onBreakpoint = broken => {
    setSmall(broken)
  };

  switch (status) {
    case 'pending':
      return <Loading />
    case 'no':
    case 'error':
      return <LoginQrcode />
    default:
      if(meData.role !=='Admin'){
        return <h1>你没有admin权限</h1>
      }
  }
  
  return (
    <Route {...rest} render={matchProps => (
      <meContext.Provider
        value={{ meData }}
      >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider trigger={null} collapsible
          collapsed={isCollapsed}
          onCollapse={onCollapse}
          onBreakpoint={onBreakpoint}
          collapsedWidth={0}
          breakpoint='md'
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            zIndex: 1
          }}>
          <Menux />
        </Sider>
        <Layout style={{ marginLeft: isCollapsed ? 0 : 200 }}>
          <Header className="p:0" style={{ background: '#fff' }} >
            <Icon
              className="m-l:2"
              type={isCollapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={onCollapse}
            />
            {meData && <Link to={'/users/' + meData.id}><div className="fl:r m-r:2">
              <Button type="link">{meData.name}</Button>
              <Avatarx url={meData.avatar_url} name={meData.name} />
            </div></Link>}
          </Header>
          <Content className={isSmall ? "m-t:2 pos:r" : "m-x:2 m-t:4 pos:r"}>
            <Component {...matchProps} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
        </Layout>
      </Layout>
      </meContext.Provider>
    )} />
  )
}
export default Dashboard