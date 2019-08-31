import React, { useState, useEffect, useContext } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'

import Avatarx from '../components/Avatarx'
import { Layout, Button, Menu, Row, Col, Badge, Drawer, List } from 'antd';
import { fetchData, parseDate } from '../utility'
import { globalContext } from '../App';
const { Header, Content, Footer } = Layout;

function Web({ location, history, props, component: Component, ...rest }) {
  const { meData, isSm } = useContext(globalContext);
  const [menu, setMenu] = useState(['']);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeList, setNoticeList] = useState([]);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    setMenu([location.pathname.split('/')[1]])
  }, [location])

  useEffect(() => {
    if (meData) {
      setUnread(meData.unread_count)
    }
  }, [meData])

  const changeMenu = ({ key }) => {
    setMenu([key])
    history.replace('/' + key)
  }
  const onFetchNoice = () => {
    const path = `/users/${meData.id}/project_notices`
    const params = {
      pre_page:20,
    }
    fetchData(path, params).then(res => {
      setNoticeList(res.data.project_notices)
      setUnread(res.data.unread)
      setNoticeVisible(true)
    })
  }

  return (
    <Route {...rest} render={matchProps => (<>
      <Drawer
        title="消息"
        placement="right"
        width={isSm ? '100%' : 500}
        onClose={() => { setNoticeVisible(false) }}
        visible={noticeVisible}
        bodyStyle={{ padding: '0px 20px' }}
      >
        <List
          dataSource={noticeList}
          renderItem={notice => {
            switch (notice.notice_type) {
              case 'upload':
                return <List.Item key={notice.id} extra={<img width='64px' alt='图片' src={notice.cover_url} />}
                >
                  <List.Item.Meta
                    avatar={<Avatarx url={notice.from_user.avatar_url} name={notice.from_user.name} />}
                    title={`${notice.from_user.name} 提交了'${notice.parent_project.title}'的阶段成品`}
                    description={parseDate(notice.send_date)}
                  />
                  <Button type='link' onClick={() => {
                    history.push(`/projects/${notice.parent_project.id}/stages/${notice.parent_stage.id}/phases/${notice.parent_phase.id}`)
                    setNoticeVisible(false)
                  }}>查看详情</Button>
                </List.Item>
              case 'modify':
                return <List.Item key={notice.id}>
                  <List.Item.Meta
                    avatar={<Avatarx url={notice.from_user.avatar_url} name={notice.from_user.name} />}
                    title={`${notice.from_user.name} 对'${notice.parent_project.title}'最新提交提出了修改建议`}
                    description={parseDate(notice.send_date)}
                  />
                  <Button type='link' onClick={() => {
                    history.push(`/projects/${notice.parent_project.id}/stages/${notice.parent_stage.id}/phases/${notice.parent_phase.id}`)
                    setNoticeVisible(false)
                  }}>查看详情</Button>
                </List.Item>
              case 'pass':
                return <List.Item key={notice.id}>
                  <List.Item.Meta
                    avatar={<Avatarx url={notice.from_user.avatar_url} name={notice.from_user.name} />}
                    title={`${notice.from_user.name} 对'${notice.parent_project.title}'最新提交总体满意`}
                    description={parseDate(notice.send_date)}
                  />
                  <Button type='link' onClick={() => {
                    history.push(`/projects/${notice.parent_project.id}/stages/${notice.parent_stage.id}/phases/${notice.parent_phase.id}`)
                    setNoticeVisible(false)
                  }}>查看详情</Button>
                </List.Item>
              default:
                return <List.Item key={notice.id}></List.Item>
            }

          }}
        />
      </Drawer>
      <Layout style={{ minHeight: '100vh' }}>
        <Header className="p:0" style={{ background: '#fff' }} >
          <Row >
            <Col xs={12} md={18} className='t-a:l'>
              { !isSm && <div className='fl:l m-l:1' style={{ height: '64px' }}>一目 - 企划管理系统</div>}
              <Menu
                mode="horizontal"
                style={{ lineHeight: '64px' }}
                selectedKeys={menu}
                onClick={changeMenu}
              >
                <Menu.Item key="groups">小组列表</Menu.Item>
                <Menu.Item key="projects">企划列表</Menu.Item>
                <Menu.Item key="all">总列表</Menu.Item>
                <Menu.Item key="files">参考图库</Menu.Item>
                <Menu.Item key="samples">样图库</Menu.Item>
                <Menu.Item key="dones">成品图</Menu.Item>
              </Menu>
            </Col>
            <Col xs={12} md={6} className='t-a:r'>
              {meData &&
                <>
                  <div className="d:i">
                    <Badge count={unread}><Button type="link" onClick={onFetchNoice}>消息</Button></Badge>
                  </div>
                  <Link to={'/dashboard'}>
                    <div className="d:i m-r:1">
                      <Button type="link">{meData.name}</Button>
                      <Avatarx url={meData.avatar_url} name={meData.name} />
                    </div>
                  </Link>
                </>}
            </Col>
          </Row>
        </Header>
        <Content className={isSm ? "m-x:0 m-t:2 pos:r" : "m-x:2 m-t:4 pos:r"}>
          <Component {...matchProps} {...props}/>
        </Content>
        <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
      </Layout>
    </>)} />
  )
}
export default withRouter(Web)