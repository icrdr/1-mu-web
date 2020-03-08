import React, { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Radio } from "antd";
import { fetchData } from "../utility";
import { globalContext } from "../App";
import Ganttx from "../components/Ganttx";
import UserProject from "../components/UserProject";
import UserData from "../components/UserData";
import UserAttr from "../components/UserAttr";

export default function Main() {
  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [meFilter, setMefilter] = useState("creator");
  const { meData, isSm } = useContext(globalContext);

  useEffect(() => {
    setLoading(true);
    setProjectList([]);
    const path = "/projects";
    const params = {
      order: "desc",
      pre_page: 20,
      status: "progress,modify,pending",
      order_by: "status"
    };
    switch (meFilter) {
      case "client":
        params.client_id = meData.id;
        break;
      case "creator":
        params.creator_id = meData.id;
        break;
      default:
    }
    fetchData(path, params)
      .then(res => {
        setProjectList(res.data.projects);
      })
      .catch(() => {
        setProjectList([]);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meFilter]);

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            title="进行中"
            extra={
              <Radio.Group
                value={meFilter}
                onChange={e => setMefilter(e.target.value)}
              >
                <Radio value="client">我作为审核者</Radio>
                <Radio value="creator">我作为制作者</Radio>
              </Radio.Group>
            }
            className="m-b:1"
            bordered={false}
            bodyStyle={{ padding: isSm ? "24px 8px" : "" }}
          >
            <Ganttx loading={isloading} projects={projectList} />
          </Card>
          <UserProject
            className="m-b:1"
            title="参与的企划"
            bordered={false}
            userID={meData.id}
          />
        </Col>
        <Col xs={24} lg={8}>
          <Card title="公告" className="m-b:1">
            施工中...
          </Card>
          <UserAttr
            title="指数"
            className="m-b:1"
            bordered={false}
            userID={meData.id}
          />
          <UserData
            className="m-b:1"
            title="数据"
            bordered={false}
            userID={meData.id}
          />
        </Col>
      </Row>
    </>
  );
}
