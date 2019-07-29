import React from 'react';
import { Route, Switch } from 'react-router-dom'

// pages
import Main from './pages/Main'
import Me from './pages/Me'
import ProjectList from './pages/ProjectList'
import Project from './pages/Project'
import AProjectList from './pages/AProjectList'
import AProject from './pages/AProject'
import AUserList from './pages/AUserList'
import AProjectPost from './pages/AProjectPost'
import AUser from './pages/AUser'
import AGroupList from './pages/AGroupList'
import AGroup from './pages/AGroup'
import GroupList from './pages/GroupList'
import Group from './pages/Group'
import User from './pages/User'
import NotFound from './pages/NotFound'
// layouts
import Web from './layouts/Web'
import Dashboard from './layouts/Dashboard'
import useWxLogin from './hooks/useWxLogin'
import { withRouter } from "react-router";
//css
import './App.css';

function App({ location }) {
  const wxLoginState = useWxLogin(location)
  switch (wxLoginState) {
    case 'pending':
      return <div>loading...</div>;
    case 'error':
      return <div>error!</div>;
    default:
      break;
  }

  return (
    <Switch>
      <Web exact path="/" component={Main} />
      <Web path="/me" component={Me} />
      <Web exact path="/projects" component={ProjectList} />
      <Web path="/projects/:project_id(\d+)" component={Project}/>
      <Web path="/users/:user_id(\d+)" component={User} />
      <Web exact path="/groups" component={GroupList} />
      <Web path="/groups/:group_id(\d+)" component={Group} />
      <Dashboard exact path="/admin/projects" component={AProjectList} />
      <Dashboard path="/admin/projects/:project_id(\d+)" component={AProject}/>
      <Dashboard path="/admin/projects/post" component={AProjectPost} />
      <Dashboard exact path="/admin/users" component={AUserList} />
      <Dashboard path="/admin/users/:user_id(\d+)" component={AUser} />
      <Dashboard exact path="/admin/groups" component={AGroupList} />
      <Dashboard path="/admin/groups/:group_id(\d+)" component={AGroup} />
      <Route component={NotFound} />
    </Switch>
  )
}
export default withRouter(App)