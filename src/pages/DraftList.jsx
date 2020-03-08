import React, { useEffect, useState } from "react";
import { Card, Input, Modal, Tag, Pagination, Row, Col, BackTop } from "antd";
import { fetchData, getPhase } from "../utility";
import ImgCard from "../components/ImgCard";
import queryString from "query-string";
import { useMediaQuery } from "react-responsive";
const { Search } = Input;
export default function DoneList({ location, history }) {
  const isSm = useMediaQuery({ query: "(max-width: 768px)" });
  const [update, setUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const [projectList, setProjectList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [lightBox, setLightBox] = useState();
  const pageSize = 12;
  useEffect(() => {
    setLoading(true);
    const path = "/projects";
    let params = {
      order: "asc",
      pre_page: 12,
      page: page,
      creator_id: 1,
      progress: 2,
      status: "progress,pause",
      tags: "腾讯医典词条"
    };

    const values = queryString.parse(location.search);
    params = { ...params, ...values };

    fetchData(path, params).then(res => {
      setProjectList(res.data.projects);
      setTotal(res.data.total);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, location]);

  const handlePageChange = (page, pageSize) => {
    const values = queryString.parse(location.search);
    const params = queryString.stringify({ ...values, page: page });
    history.push(`${location.pathname}?${params}`);
    setPage(page);
  };

  const onSearch = v => {
    setPage(1);
    const values = queryString.parse(location.search);
    const params = queryString.stringify({ ...values, search: v, page: 1 });
    history.push(`${location.pathname}?${params}`);
  };

  return (
    <>
      {lightBox != null && (
        <Modal
          title={lightBox.title}
          centered
          visible={lightBox != null}
          onCancel={() => setLightBox()}
          okButtonProps={{ className: "d:n" }}
          cancelButtonProps={{ className: "d:n" }}
          width={isSm ? "100%" : "60%"}
          bodyStyle={{
            padding: 0
          }}
        >
          {getPhase(lightBox.stages[0]).upload_files.map((file, index) => {
            return <ImgCard key={index} file={file} />;
          })}
          <div className="p:2">
            <div className="m-b:1">
              {lightBox.tags.map((tag, index) => (
                <Tag key={index}>{tag.name}</Tag>
              ))}
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: getPhase(lightBox.stages[0]).creator_upload
              }}
            />
          </div>
        </Modal>
      )}
      <BackTop />
      <Card>
        <div className="m-b:1">
          <Search
            placeholder="输入企划标题关键词"
            onSearch={onSearch}
            allowClear
            enterButton
          />
        </div>
        <Row gutter={16}>
          {projectList.map((project, index) => {
            const item = getPhase(project.stages[0]).upload_files[0];
            return (
              <Col key={index} span={isSm ? 24 : 8} className="m-b:2">
                <Card
                  key={index}
                  onClick={() => setLightBox(project)}
                  cover={<ImgCard file={item} />}
                >
                  {project.title}
                </Card>
              </Col>
            );
          })}
        </Row>
        <Pagination
          className="m-t:1 fl:r"
          page={page}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
        />
      </Card>
    </>
  );
}
