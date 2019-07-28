import React, { useState } from 'react';
import { Route, Link } from 'react-router-dom'

import LoginQrcode from '../components/LoginQrcode'
import useLogin from '../hooks/useLogin'
import Loading from '../components/Loading'
import Avatarx from '../components/Avatarx'

import { Layout, Button } from 'antd';

const { Header, Content, Footer } = Layout;

export const meContext = React.createContext();

function Dashboard({ component: Component, ...rest }) {

  const { meData, status } = useLogin()
  const [isSmall] = useState(false);

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
            <div className='m-l:2 fl:l'>
              一目 - 企划管理系统
            </div>
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
      </meContext.Provider>
    )} />
  )
}
export default Dashboard