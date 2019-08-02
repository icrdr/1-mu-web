import React, { useState, useEffect } from 'react'
import { Button } from 'antd';


export default function Main() {
  const [isLoading, setLoading] = useState(false)
  useEffect(() => {
    console.log('ddddd')
  })
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  function handleScroll() {
    if (document.documentElement.offsetHeight + document.documentElement.scrollTop < document.documentElement.scrollHeight-100) return
    if (!isLoading) handleEvent()
  }
  
  function resolveAfter2Seconds(x) { 
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, 2000);
    });
  }
  
  const handleEvent = async () => {
    setLoading(true)
    console.log('start')
    await resolveAfter2Seconds(10)
    console.log('end')
    setLoading(false)
  }
  return (
    <div style={{height:'2000px'}}>
      <Button onClick={() => { if (!isLoading) handleEvent() }}>ddd</Button>
    </div>
  )
}
