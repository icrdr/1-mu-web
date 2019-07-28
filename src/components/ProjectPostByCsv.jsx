import React from 'react'
import { postData, fetchData, updateData } from '../utility'

export default function ProjectPostByCsv() {
  function uploadFile(e) {
    const file = e.target.files[0];
    console.log(file)
    if (file) {
      var reader = new FileReader();

      reader.onload = function (e) {
        // console.log(e.target.result)
        getParsecsvdata(e.target.result); // calling function for parse csv data 
      };
      reader.readAsText(file);
    }
  }

  /*------- Method for parse csv data and display --------------*/
  async function getParsecsvdata(data) {
    let newLinebrk = data.split("\n");
    console.log(newLinebrk.length)
    for (let i = 0; i < newLinebrk.length; i++) {
      const row = newLinebrk[i].split("\r")[0].split(",").slice(0, 5)
      if (!row[1]) continue
      const path = '/projects'
      await fetchData(path, { title: row[1] }, false).then(res => {
        if (res.data.projects.length>0) {
          const path = '/projects/' + res.data.projects[0].id
          const data = {
            title: row[1],
            client_id: row[3]? row[3] : 1,
            creators: row[4] ? row[4].split(";") : [1],
            tags: row[2].split("/"),
          }
          return updateData(path, data)
        } else {
          const path = '/projects'
          const client_id = row[3] ? row[3] : 1
          const creators = row[4] ? row[4].split(";").push(client_id) : [1]
          const data = {
            title: row[1],
            design: `<p>${row[1]}</p>`,
            client_id: client_id,
            creators: creators,
            stages: [
            {
              stage_name: '线稿-铺色',
              days_need: 350
            },
            {
              stage_name: '细化-特效',
              days_need: 350
            }],
            tags: row[2].split("/"),
            confirm: 1
          }
          return postData(path, data)
        }
      }).catch(err => {
      })
      console.log(i)
    }
  }
  return (
    <div>
      <input type="file" id="dealCsv" onChange={uploadFile} />
    </div>
  )
}