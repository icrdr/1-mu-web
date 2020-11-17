import React, { useEffect, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import {
  Card,
  Input,
  Modal,
  Tag,
  Pagination,
  Row,
  Col,
  Button,
  message
} from "antd";
import { fetchData, getPhase } from "../utility";
import ImgCard from "../components/ImgCard";
import Loading from "../components/Loading";
import queryString from "query-string";
import { useMediaQuery } from "react-responsive";

const { Search } = Input;
export default function SampleList({ location, history }) {
  const isSm = useMediaQuery({ query: "(max-width: 768px)" });
  const [update, setUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const [projectList, setProjectList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [lightBox, setLightBox] = useState();
  const [isZipping, setZipping] = useState(false);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  useEffect(() => {
    setLoading(true);
    const path = "/projects";
    let params = {
      order: "desc",
      pre_page: pageSize,
      page: 1,
      status: "finish",
      tags: "百度样图"
    };

    const values = queryString.parse(location.search);
    params = { ...params, ...values };
    setPage(parseInt(params['page']));
    
    fetchData(path, params)
      .then(res => {
        setProjectList(res.data.projects);
        setTotal(res.data.total);
      })
      .finally(res => {
        setLoading(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, location]);

  const handlePageChange = (page, pageSize) => {
    const values = queryString.parse(location.search);
    const params = queryString.stringify({ ...values, page: page });
    history.push(`${location.pathname}?${params}`);
  };

  const onSearch = v => {
    const values = queryString.parse(location.search);
    const params = queryString.stringify({ ...values, search: v, page: 1 });
    history.push(`${location.pathname}?${params}`);
  };

  const handleDownload = files => {
    setZipping(true);
    const file_id = [];
    for (const file of files) {
      file_id.push(file.id);
    }
    const path = "/download/files";
    const params = {
      file_id: file_id.join(",")
    };
    const hide = message.loading("压缩文件中...", 0);
    fetchData(path, params)
      .then(res => {
        hide();
        window.location.href = res.data.download_url;
      })
      .finally(() => {
        setZipping(false);
      });
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
          {getPhase(
            lightBox.stages[lightBox.stages.length - 1]
          ).upload_files.map((file, index) => {
            return <ImgCard key={index} file={file} />;
          })}
          <div className="p:2">
            {lightBox.tags.map((tag, index) => (
              <Tag key={index}>{tag.name}</Tag>
            ))}
          </div>
        </Modal>
      )}
      <Card>
        <div className="m-b:1">
          <Search
            placeholder="输入企划标题关键词"
            onSearch={onSearch}
            allowClear
            enterButton
          />
        </div>
        {isLoading ? (
          <Loading />
        ) : (
          <Row gutter={16}>
            {projectList.map((project, index) => {
              const item = getPhase(project.stages[project.stages.length - 1])
                .upload_files[0];
              return (
                <Col key={index} span={isSm ? 24 : 8} className="m-b:2">
                  <Card
                    cover={
                      <div onClick={() => setLightBox(project)}>
                        <ImgCard file={item} />
                      </div>
                    }
                  >
                    <Button
                      type="link"
                      size="small"
                      disabled={isZipping}
                      onClick={() =>
                        handleDownload(
                          getPhase(project.stages[project.stages.length - 1])
                            .upload_files
                        )
                      }
                    >
                      <DownloadOutlined />
                      {project.title}
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
        <Pagination
          className="m-t:1 fl:r"
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
        />
      </Card>
    </>
  );
}
