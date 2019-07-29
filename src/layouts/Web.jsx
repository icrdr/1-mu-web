import React, { useState, useEffect } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'

import LoginQrcode from '../components/LoginQrcode'
import useLogin from '../hooks/useLogin'
import Loading from '../components/Loading'
import Avatarx from '../components/Avatarx'

import { Layout, Button,Menu } from 'antd';

const { Header, Content, Footer } = Layout;

export const meContext = React.createContext();

function Web({ location, history, component: Component, ...rest }) {

  const { meData, status } = useLogin()
  const [isSmall] = useState(false);
  const [menu, setMenu] = useState(['']);

  useEffect(() => {
     setMenu([location.pathname.split('/')[1]])
  }, [location])

  const changeMenu = ({ key }) => {
    setMenu([key])
    history.replace('/'+key)
  }

  switch (status) {
    case 'pending':
      return <Loading />
    case 'no':
    case 'error':
      return <LoginQrcode />
    default:
  }

  return (
    <Route {...rest} render={matchProps => (
      <meContext.Provider
        value={{ meData }}
      >
        <Layout style={{ minHeight: '100vh' }}>

          <Header className="p:0" style={{ background: '#fff' }} >
            <div className='m-l:2 m-r:2 fl:l'>
              一目 - 企划管理系统
            </div>
            <Menu
              mode="horizontal"
              style={{ lineHeight: '64px' }}
              selectedKeys={menu}
              onClick={changeMenu}
            >
              <Menu.Item key="groups">小组列表</Menu.Item>
              <Menu.Item key="projects">企划列表</Menu.Item>
              <Menu.Item key="all">总表</Menu.Item>
            </Menu>
            {meData && <Link to={'/users/' + meData.id}><div className="pos:a top:0 right:2">
              <Button type="link">{meData.name}</Button>
              <Avatarx url={meData.avatar_url} name={meData.name} />
            </div></Link>}
          </Header>
          <Content className={isSmall ? "m-t:2 pos:r" : "m-x:2 m-t:4 pos:r"}>
            <Component {...matchProps} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
        </Layout>
      </meContext.Provider>
    )} />
  )
}
export default withRouter(Web)