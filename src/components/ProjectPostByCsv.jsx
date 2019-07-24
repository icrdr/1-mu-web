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
      const row = newLinebrk[i].split("\r")[0].split(",").slice(0, 3)
      if (!row[1]) continue
      const path = '/projects'
      await fetchData(path, { title: row[1] }).then(res => {
        const path = '/projects/' + res.data.projects[0].id
        const data = {
          title: row[1],
          design: `<p>${row[1]}</p>`,
          creators: [1],
          client_id: 1,
          tags: row[2].split("/"),
        }
        updateData(path, data)
      }).catch(err => {
        console.log(err.response.status)
        if (err.response.status === 400) {
          const path = '/projects'
          const data = {
            title: row[1],
            design: `<p>${row[1]}</p>`,
            creators: [1],
            client_id: 1,
            stages: [{
              stage_name: '制作',
              days_need: 350
            }],
            tags: row[2].split("/"),
            confirm: 1
          }
          postData(path, data)
        }
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
