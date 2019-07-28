import React from 'react'

export default function Main() {
  async function test(e) {
    for (let i = 0; i < 2; i++) {
      await fn1().then(res => {
        return fn2().then(res=>{

        }).catch(err => {
          console.log('f')
        })

      }).catch(err => {
        return fn3()
      })
      console.log("done")
    }
  }
  
  function fn1() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('1')
        resolve();
      }, 1000);
    }
    )
  }

  function fn2() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('2')
        reject();
      }, 1000);
    }
    )
  }

  function fn3() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('3')
        resolve();
      }, 1000);
    }
    )
  }

  return (
    <div>
      <button onClick={test}>test</button>
    </div>
  )
}
