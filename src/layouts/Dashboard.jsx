import React, { useState, useEffect } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'

import LoginQrcode from '../components/LoginQrcode'
import useLogin from '../hooks/useLogin'
import Loading from '../components/Loading'
import Avatarx from '../components/Avatarx'
import Maintenance from '../components/Maintenance'
import { useMediaQuery } from 'react-responsive'
import { Layout, Button, Menu, Row, Col } from 'antd';

const { Header, Content, Footer } = Layout;

export const meContext = React.createContext();

function Dashboard({ location, history, component: Component, ...rest }) {

  const { meData, status } = useLogin()
  const [menu, setMenu] = useState(['']);
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })

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
      return <LoginQrcode />
    case 'error':
      return <Maintenance />
    default:
      if (meData.role !== 'Admin') {
        return <h1>你没有admin权限</h1>
      }
  }

  return (
    <Route {...rest} render={matchProps => (
      <meContext.Provider value={{ meData }}>
        <Layout>
          <Header className="p:0">
            <Row >
              <Col xs={16} md={20} className='t-a:l'>
                <Menu
                  theme="dark"
                  mode="horizontal"
                  style={{ lineHeight: '64px' }}
                  selectedKeys={menu}
                  onClick={changeMenu}
                >
                  <Menu.Item key="users">用户列表</Menu.Item>
                  <Menu.Item key="projects">企划列表</Menu.Item>
                  <Menu.Item key="groups">小组列表</Menu.Item>
                </Menu>
              </Col>
              <Col xs={8} md={4} className='t-a:r'>
                {meData && <div className='m-r:2'><Link to={'/users/' + meData.id}>
                  <Button type="link">{meData.name}</Button>
                  <Avatarx url={meData.avatar_url} name={meData.name} />
                </Link></div>}
              </Col>
            </Row>
          </Header>
          <Content className={isSm ? "m-x:0 m-t:0 pos:r" : "m-x:2 m-t:4 pos:r"}>
            <Component {...matchProps} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
        </Layout>
      </meContext.Provider>
    )} />
  )
}

export default withRouter(Dashboard)