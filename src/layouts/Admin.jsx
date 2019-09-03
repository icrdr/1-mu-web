import React, { useState, useEffect, useContext } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'

import Avatarx from '../components/Avatarx'
import { globalContext } from '../App';
import { Layout, Dropdown, Icon, Menu, Row, Col, Affix } from 'antd';

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

  const menu2 = (
    <Menu>
      <Menu.Item>
        <Link to='/dashboard'><Icon type="dashboard" className='m-r:.5' /><span>仪表盘</span></Link>
      </Menu.Item>
    </Menu>
  )

  if (meData.role !== 'Admin') {
    return <h1>你没有admin权限</h1>
  }

  return (
    <Route {...rest} render={matchProps => (
      <Layout style={{ minHeight: '100vh' }}>
        <Affix offsetTop={0} >
          <Header className="p-x:3 shadow-s">
            <Row >
              <Col xs={16} md={20} className='t-a:l'>
                <Menu
                  theme="dark"
                  mode="horizontal"
                  style={{ lineHeight: '64px' }}
                  selectedKeys={menu}
                  onClick={changeMenu}
                >
                  <Menu.Item key="users"><Icon type="user" />用户列表</Menu.Item>
                  <Menu.Item key="projects"><Icon type="unordered-list" />企划列表</Menu.Item>
                  <Menu.Item key="groups"><Icon type="usergroup-add" />小组列表</Menu.Item>
                </Menu>
              </Col>
              <Col xs={8} md={4} className='t-a:r'>
                {meData &&
                  <>
                    <Dropdown overlay={menu2}>
                      <div className='btn-x'>
                        <div>
                          <Avatarx className='m-r:.6' size={24} url={meData.avatar_url} name={meData.name} />
                          <span style={{ color: '#ccc' }}>{meData.name}</span>
                        </div>
                      </div>
                    </Dropdown>
                  </>}
              </Col>
            </Row>
          </Header>
        </Affix>
        <Content className={isSm ? "m-x:0 m-t:2 pos:r" : "m-x:2 m-t:2 pos:r"}>
          <Component {...matchProps} {...props} />
        </Content>
        <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
      </Layout>
    )} />
  )
}

export default withRouter(Admin)