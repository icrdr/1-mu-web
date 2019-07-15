import React, { useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import MePage from './pages/MePage'
import MainPage from './pages/MainPage'
import FilePage from './pages/FilePage'
import ProjectListPage from './pages/ProjectListPage'
import ProjectPage from './pages/ProjectPage'
import UserListPage from './pages/UserListPage'
import ProjectAddPage from './pages/ProjectAddPage'
import UserPage from './pages/UserPage'
import Menux from './components/Menux'
import './App.css';
import { Layout } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [isCollapsed, setCollapse] = useState(false);

  const onCollapse = () => {
    setCollapse(!isCollapsed)
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={isCollapsed} onCollapse={onCollapse} style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          zIndex: 1
        }}>
          <Menux />
        </Sider>
        <Layout style={{ marginLeft: isCollapsed ? 80 : 200 }}>
          <Header className="p:0" style={{ background: '#fff' }} />
          <Content className="m-x:2 m-t:4 pos:r">
          
            <Route exact path="/" component={MainPage} />
            <Route path="/me" component={MePage} />
            <Route path="/files" component={FilePage} />
            <Route exact path="/projects" component={ProjectListPage} />
            <Route path="/projects/:id(\d+)" component={ProjectPage} />
            <Route path="/projects/add" component={ProjectAddPage} />
            <Route exact path="/users" component={UserListPage} />
            <Route path="/users/:id" component={UserPage} />
            
          </Content>
          <Footer style={{ textAlign: 'center' }}>1-mu ©2019 Created by emu</Footer>
        </Layout>
      </Layout>
      </Router>
  );
}

export default App
