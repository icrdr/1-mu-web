import React from 'react';
import { Route, Switch } from 'react-router-dom'

// pages
import Main from './pages/Main'
import Me from './pages/Me'
import ProjectList from './pages/ProjectList'
import Project from './pages/Project'
import UserList from './pages/UserList'
import ProjectPost from './pages/ProjectPost'
import User from './pages/User'
import NotFound from './pages/NotFound'
// layouts
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
      <Route exact path="/" component={Main} />
      <Route path="/me" component={Me} />
      <Dashboard exact path="/projects" component={ProjectList} />
      <Dashboard path="/projects/:project_id(\d+)" component={Project}/>
      <Dashboard path="/projects/post" component={ProjectPost} />
      <Dashboard exact path="/users" component={UserList} />
      <Dashboard path="/users/:user_id(\d+)" component={User} />
      <Route component={NotFound} />
    </Switch>
  )
}
export default withRouter(App)