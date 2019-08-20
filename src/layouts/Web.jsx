import React, { useState, useEffect } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'

import LoginQrcode from '../components/LoginQrcode'
import useLogin from '../hooks/useLogin'
import Loading from '../components/Loading'
import Maintenance from '../components/Maintenance'
import Avatarx from '../components/Avatarx'
import { useMediaQuery } from 'react-responsive'
import { Layout, Button, Menu, Row, Col } from 'antd';

const { Header, Content, Footer } = Layout;

export const meContext = React.createContext();

function Web({ location, history, component: Component, ...rest }) {

  const { meData, status } = useLogin()
  const [menu, setMenu] = useState(['']);
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })
  useEffect(() => {
    setMenu([location.pathname.split('/')[1]])
  }, [location])

  const changeMenu = ({ key }) => {
    setMenu([key])
    history.replace('/' + key)
  }

  switch (status) {
    case 'pending':
      return <Loading />
    case 'no':
      return <LoginQrcode />
    case 'error':
      return <Maintenance />

    default:
  }

  return (
    <Route {...rest} render={matchProps => (
      <meContext.Provider value={{ meData }}>
        <Layout style={{ minHeight: '100vh' }}>

          <Header className="p:0" style={{ background: '#fff' }} >
            <Row >
              <Col xs={8} md={20} className='t-a:l'>
                <div className='fl:l m-l:1' style={{ height: '64px' }}>一目 - 企划管理系统</div>
                <Menu
                  mode="horizontal"
                  style={{ lineHeight: '64px' }}
                  selectedKeys={menu}
                  onClick={changeMenu}
                >
                  <Menu.Item key="groups">小组列表</Menu.Item>
                  <Menu.Item key="projects">企划列表</Menu.Item>
                  <Menu.Item key="all">总列表</Menu.Item>
                  <Menu.Item key="files">参考资源</Menu.Item>
                  <Menu.Item key="samples">标准图</Menu.Item>
                  {/* <Menu.Item key="dones">成品图</Menu.Item> */}
                </Menu>
              </Col>
              <Col xs={16} md={4} className='t-a:r'>
                {meData && <Link to={'/users/' + meData.id}><div className="pos:a top:0 right:2">
                  <Button type="link">{meData.name}</Button>
                  <Avatarx url={meData.avatar_url} name={meData.name} />
                </div></Link>}
              </Col>
            </Row>
          </Header>
          <Content className={isSm ? "m-x:0 m-t:2 pos:r" : "m-x:2 m-t:4 pos:r"}>
            <Component {...matchProps} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
        </Layout>
      </ meContext.Provider>
    )} />
  )
}
export default withRouter(Web)