import React, { useState, useEffect, useContext } from 'react';
import { withRouter, Link } from 'react-router-dom'
import moment from 'moment'
import 'moment/locale/zh-cn'
import Avatarx from '../components/Avatarx'
import { Layout, Button, Menu, Row, Col, Badge, List, Dropdown, Icon, Tabs, Card, Divider, message, Affix } from 'antd';
import { fetchData, updateData, toLocalDate } from '../utility'
import { globalContext } from '../App';
const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;
moment.locale('zh-cn')

function Basic({ location, history, menutheme, menuItems, children }) {
  const { meData, isSm } = useContext(globalContext);
  const [menu, setMenu] = useState(['']);
  const [isLoading, setLoading] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeList, setNoticeList] = useState([]);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    setMenu([location.pathname])
  }, [location])

  useEffect(() => {
    if (meData) {
      setUnread(meData.unread_count)
    }
  }, [meData])

  const changeMenu = ({ key }) => {
    setMenu([key])
    history.replace(key)
  }

  useEffect(() => {
    if (noticeVisible) {
      setLoading(true)
      const path = `/users/${meData.id}/project_notices`
      const params = {
        pre_page: 5,
      }
      fetchData(path, params).then(res => {
        setNoticeList(res.data.project_notices)
        setUnread(res.data.unread)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [noticeVisible, meData.id])

  const notice = (<>
    <Card style={{ width: '400px' }} bodyStyle={{ padding: '0px' }}>
      <Tabs defaultActiveKey="1" tabBarStyle={{ marginBottom: '0px', padding: '0px 24px' }}>
        <TabPane tab="企划" key="1">
          <List
            loading={isLoading}
            dataSource={noticeList}
            renderItem={notice => {
              let title
              switch (notice.log.log_type) {
                case 'upload':
                  title = `${notice.log.project.title} 有新的提交`
                  break
                case 'modify':
                  title = `${notice.log.operator.name} 提出修改建议`
                  break
                case 'pass':
                  title = `${notice.log.project.title} 提交审核通过`
                  break
                default:
                  break
              }
              return (
                <List.Item key={notice.id} onClick={() => {
                  const path = `/project_notices/` + notice.id
                  updateData(path, null, false)
                  setUnread(prevState => prevState - 1)
                  setNoticeList(prevState => {
                    return prevState.filter(n => notice.id !== n.id)
                  })
                  
                  history.push(`/projects/${notice.log.project.id}?phase_id=${notice.log.phase.id}`)
                  setNoticeVisible(false)
                }} className={`hover ${notice.read ? 'disable' : ''}`} style={{ padding: '12px 24px' }}>
                  <List.Item.Meta
                    avatar={<Avatarx url={notice.log.operator.avatar_url} name={notice.log.operator.name} />}
                    title={title}
                    description={moment(toLocalDate(notice.log.log_date)).fromNow()}
                  />
                </List.Item>
              )
            }} />
        </TabPane>
      </Tabs>
      <Divider className='m:0' />
      <div style={{ lineHeight: '46px' }}>
        <Button type='link' style={{ width: '50%', borderRight: '1px solid #e8e8e8' }} onClick={() => {
          const path = `/project_notices`
          const params = {
            user_id: meData.id,
          }
          updateData(path, params)
          setNoticeList([])
          setUnread(0)
        }}>清空 通知</Button>
        <Button type='link' onClick={() => message.info('还没做好')} style={{ width: '50%' }}>查看更多</Button>
      </div>
    </Card>
  </>)

  const menu2 = (
    <Menu>
      <Menu.Item>
        <Link to='/dashboard'><Icon type="dashboard" className='m-r:.5' /><span>仪表盘</span></Link>
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout style={{ minHeight: '100vh', color:menutheme==='light'?'':'#ccc' }}>
      <Affix offsetTop={0} >
        <Header className="p-x:3 shadow-s" style={menutheme==='light'?{ background: '#fff' }:{}} >
          <Row >
            <Col xs={12} md={18} className='t-a:l'>
              {<Menu
                theme={menutheme}
                mode="horizontal"
                style={{ lineHeight: '64px', height: '64px', borderBottom: '0px' }}
                selectedKeys={menu}
                onClick={changeMenu}
              >
                {menuItems}
              </Menu>}
            </Col>
            <Col xs={12} md={6} className='t-a:r'>
              {meData &&
                <>
                  <Dropdown overlay={notice} visible={noticeVisible} onVisibleChange={flag => setNoticeVisible(flag)}>
                    <div className='btn-x'>
                      <Badge count={unread}>
                        <Icon style={{ fontSize: '16px', height: '22px', width: '22px', padding: '3px' }} type="bell" />
                      </Badge>
                    </div>
                  </Dropdown>
                  <Dropdown overlay={menu2}>
                    <div className='btn-x'>
                      <div>
                        <Avatarx className='m-r:.6' size={24} url={meData.avatar_url} name={meData.name} />
                        <span>{meData.name}</span>
                      </div>
                    </div>
                  </Dropdown>
                </>}
            </Col>
          </Row>
        </Header>
      </Affix>
      <Content className={isSm ? "m-x:0 m-t:2 pos:r" : "m-x:2 m-t:2 pos:r"}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
    </Layout>
  )
}
export default withRouter(Basic)