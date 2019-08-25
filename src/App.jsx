import React from 'react';
import { Route, Switch } from 'react-router-dom'

// pages
import Main from './pages/Main'
import Me from './pages/Me'
import ProjectList from './pages/ProjectList'
import Project from './pages/Project'
import AProjectList from './pages/AProjectList'
import AUserList from './pages/AUserList'
import AProjectPost from './pages/AProjectPost'
import AUser from './pages/AUser'
import AGroupList from './pages/AGroupList'
import AGroup from './pages/AGroup'
import GroupList from './pages/GroupList'
import Group from './pages/Group'
import User from './pages/User'
import FileList from './pages/FileList'
import AllList from './pages/AllList'
import NotFound from './pages/NotFound'
import SampleList from './pages/SampleList'
import AGroupAdd from './pages/AGroupAdd'
import DoneList from './pages/DoneList'
// layouts
import Web from './layouts/Web'
import Dashboard from './layouts/Dashboard'
import useWxLogin from './hooks/useWxLogin'
import { withRouter } from "react-router";
import LoginQrcode from './components/LoginQrcode'
import useLogin from './hooks/useLogin'
import Loading from './components/Loading'
import Maintenance from './components/Maintenance'
import { useMediaQuery } from 'react-responsive'
//css
import './App.css';
export const globalContext = React.createContext();
function App({ location }) {
  
  const wxLoginState = useWxLogin(location)
  const { meData, status } = useLogin()
  const isSm = useMediaQuery({ query: '(max-width: 768px)' })
  switch (wxLoginState) {
    case 'pending':
      return <div>loading...</div>;
    case 'error':
      return <div>error!</div>;
    default:
      break;
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
    <globalContext.Provider value={{ meData, isSm }}>
    <Switch>
      <Web exact path="/" component={Main} />
      <Web path="/me" component={Me} />
      <Web exact path="/samples" component={SampleList} />
      <Web exact path="/dones" component={DoneList} />
      <Web exact path="/projects" component={ProjectList} />
      <Web exact path="/all" component={AllList} />
      <Web exact path="/files" component={FileList} />
      <Web path="/projects/:project_id(\d+)" component={Project} />
      <Web path="/users/:user_id(\d+)" component={User} />
      <Web exact path="/groups" component={GroupList} />
      <Web path="/groups/:group_id(\d+)" component={Group} />
      <Dashboard exact path="/admin/projects" component={AProjectList} />
      <Dashboard path="/admin/projects/:project_id(\d+)" component={Project} props={{isAdmin:true}}/>
      <Dashboard path="/admin/projects/post" component={AProjectPost} />
      <Dashboard exact path="/admin/users" component={AUserList} />
      <Dashboard path="/admin/users/:user_id(\d+)" component={AUser} />
      <Dashboard exact path="/admin/groups" component={AGroupList} />
      <Dashboard path="/admin/groups/:group_id(\d+)" component={AGroup} />
      <Dashboard path="/admin/groups/add" component={AGroupAdd} />
      <Route component={NotFound} />
    </Switch>
    </globalContext.Provider>
  )
}
export default withRouter(App)