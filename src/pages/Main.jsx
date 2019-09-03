import React, { useEffect, useState,useContext } from 'react'
import { Result, Icon, Button } from 'antd';
import { globalContext } from '../App';
import { fetchData } from '../utility'

export default function Main({history}) {
  const [total, setTotal] = useState()
  const { meData } = useContext(globalContext);
  useEffect(() => {
    const path = '/projects'
    const params = {
      order: 'desc',
      pre_page: 20,
      status: 'progress,modify,delay,pending',
      order_by: 'status',
      creator_id: meData.id
    }

    fetchData(path, params).then(res => {
      setTotal(res.data.total)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Result
    icon={<Icon type="bell" theme="twoTone" />}
    title={total?`目前您有${total}个企划正在进行`:"嘿嘿嘿，您可以歇一歇了，没活儿"}
    extra={<Button type="primary" onClick={()=>{history.push('/dashboard')}}>查看进度</Button>}
  />
  )
}
