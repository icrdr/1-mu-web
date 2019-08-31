import React, { useState, useEffect, useContext } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'

import Avatarx from '../components/Avatarx'
import { globalContext } from '../App';
import { Layout, Button, Menu, Row, Col } from 'antd';

const { Header, Content, Footer } = Layout;

function Admin({ location, history, props, component: Component, ...rest }) {
  const { meData, isSm } = useContext(globalContext);
  const [menu, setMenu] = useState(['']);

  useEffect(() => {
    setMenu([location.pathname.split('/')[2]])
  }, [location])
  const changeMenu = ({ key }) => {
    setMenu([key])
    history.replace('/admin/' + key)
  }
  
  if (meData.role !== 'Admin') {
    return <h1>你没有admin权限</h1>
  }

  return (
    <Route {...rest} render={matchProps => (
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
              {meData &&
                <>
                  <Link to={'/admin/users/' + meData.id}>
                    <div className="d:i m-r:1">
                      <Button type="link">{meData.name}</Button>
                      <Avatarx url={meData.avatar_url} name={meData.name} />
                    </div>
                  </Link>
                </>}
            </Col>
          </Row>
        </Header>
        <Content className={isSm ? "m-x:0 m-t:0 pos:r" : "m-x:2 m-t:4 pos:r"}>
          <Component {...matchProps} {...props}/>
        </Content>
        <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
      </Layout>
    )} />
  )
}

export default withRouter(Admin)