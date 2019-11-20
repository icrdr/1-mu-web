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
    const creates = [];

    for (let i = 0; i < newLinebrk.length; i++) {
      const row = newLinebrk[i]
        .split("\r")[0]
        .split(",")
        .slice(0, 5);
      if (!row[0]) continue;
      const path = "/projects";
      const data = {
        title: row[0],
        design: `<p>${row[0]}</p>`,
        creator_id: 1,
        client_id: 1,
        stages: [
          { stage_name: "草图", days_planned: 7 },
          { stage_name: "成图", days_planned: 7 }
        ],
        tags: row[1].split(";")
      };
      await postData(path, data)
        .then(res => {
          creates.push({ title: row[0], res });
        })
        .catch(err => {
          errors.push({ title: row[0], err });
        });
      console.debug(i);
    }
    onSucceed({ creates, errors });
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
