import React,{useState, useEffect} from 'react'
import {Card, Switch, Button} from 'antd'
import {fetchData, updateData} from '../utility'
import Loading from '../components/Loading'
export default function Aoption() {
  const [isLoading, setLoading] = useState(true)
  const [allowSignIn, setAllowSignIn] = useState(false)
  useEffect(() => {
    const path='/options'
    fetchData(path).then(res=>{
      setAllowSignIn(res.data.allow_sign_in==='1'?true:false)
    }).finally(()=>{
      setLoading(false)
    })
    
  }, [])

  const handleChangeSetting=()=>{
    setLoading(true)
    const path='/options'
    const data = {
      'allow_sign_in':allowSignIn?'1':'0'
    }
    updateData(path, data).finally(()=>{
      setLoading(false)
    })
  }

  return (
    <Card>
    {isLoading?<Loading/>:<>
      <div className='m-b:1'>
      <span className='m-r:1'>是否开启注册</span>
      <Switch checked={allowSignIn} onChange={checked=>setAllowSignIn(checked)}></Switch>
      </div>
      <Button type='primary' onClick={handleChangeSetting}>更新</Button>
      </>}
    </Card>
  )
}
