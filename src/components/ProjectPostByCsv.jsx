import React from "react";
import { Upload, Button, message } from "antd";
import { postData, fetchData, updateData } from "../utility";

export default function ProjectPostByCsv({ onSucceed }) {
  function readFile(file) {
    if (file) {
      var reader = new FileReader();

      reader.onload = function(e) {
        // console.log(e.target.result)
        getParsecsvdata(e.target.result); // calling function for parse csv data
      };
      reader.readAsText(file);
    }
  }

  /*------- Method for parse csv data and display --------------*/
  async function getParsecsvdata(data) {
    let newLinebrk = data.split("\n");
    console.log(newLinebrk.length);
    const errors = [];
    const updates = [];
    const creates = [];

    for (let i = 0; i < newLinebrk.length; i++) {
      const row = newLinebrk[i]
        .split("\r")[0]
        .split(",")
        .slice(0, 5);
      if (!row[0]) continue;
      const path = "/projects";
      await fetchData(path, { title: row[0], tags: "腾讯医典词条"}, false)
        .then(res => {
          if (res.data.projects.length > 0) {
            console.log(row[0])
            errors.push({title:row[0]})
          }
        }).catch(err => {
          errors.push({title:row[0],err})
        });
      console.debug(i);
    }
    onSucceed({creates, updates, errors});
  }
  return (
    <Upload
      beforeUpload={file => {
        // check file type and size
        console.debug(file);
        if (file.type !== "application/vnd.ms-excel") {
          message.error("只支持.csv(utf-8)");
          return false;
        }
        readFile(file);
        return false;
      }}
      showUploadList={false}
    >
      <Button>csv生成企划</Button>
    </Upload>
  );
}
