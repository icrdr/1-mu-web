import React,{useState,useEffect} from 'react'
import { withRouter } from 'react-router-dom'
import { Menu, Icon } from 'antd';

function Menux({location, history}) {
  const [menu, setMenu] = useState(['']);

  useEffect(() => {
    setMenu([location.pathname.split('/')[1]])
  }, [location])

  const changeMenu = ({ key }) => {
    setMenu([key])
    history.replace('/'+key)
  }

  return (
    <Menu theme="dark"
      selectedKeys={menu}
      mode="inline"
      onClick={changeMenu}
    >
      <Menu.Item key="users">
        <Icon type="pie-chart" />
        <span>用户列表</span>
      </Menu.Item>
      <Menu.Item key="projects">
        <Icon type="desktop" />
        <span>企划列表</span>
      </Menu.Item>
      {/* <Menu.Item key="files">
        <Icon type="file" />
        <span>文件列表</span>
      </Menu.Item> */}
    </Menu>
  )
}

export default withRouter(Menux)
