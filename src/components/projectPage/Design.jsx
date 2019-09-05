import React, { useContext } from 'react'
import { Route, Link, withRouter } from 'react-router-dom'
import { Button } from 'antd'
import ProjectDesign from './ProjectDesign'
import { globalContext } from '../../App';

function Design({ match, project, onSuccess }) {
  const { meData } = useContext(globalContext);
  let isAdmin = project.client.id === meData.id

  return (<>
    <Route exact path={match.path} render={() => <>
      <h1>初始设计稿</h1>
      <div dangerouslySetInnerHTML={{
        __html: project.design
      }} />
      {
        isAdmin &&
        <Link to={`${match.url}/edit`}>
          <Button size='large' block>修改</Button>
        </Link>
      }
    </>
    } />
    <Route path={`${match.path}/edit`} render={
      props => <ProjectDesign {...props} onSuccess={onSuccess} design={project.design} />
    } />
  </>
  )
}

export default withRouter(Design)
