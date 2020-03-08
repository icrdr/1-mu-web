import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Modal,
  Tag,
  Pagination,
  Row,
  Col,
  BackTop,
  Statistic
} from "antd";
import { fetchData, getPhase } from "../utility";
import ImgCard from "../components/ImgCard";
import queryString from "query-string";
import { useMediaQuery } from "react-responsive";
const { CheckableTag } = Tag;
const { Search } = Input;
export default function DoneList({ location, history }) {
  const isSm = useMediaQuery({ query: "(max-width: 768px)" });
  const [update, setUpdate] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [lightBox, setLightBox] = useState();
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const tagsFromServer = [
    "腾讯医典词条",
    "腾讯军医词条",
    "腾讯综述",
    "腾讯手术",
    "百度词条"
  ];

  useEffect(() => {
    setLoading(true);
    const path = "/projects";
    let params = {
      order: "desc",
      order_by: "finish_date",
      pre_page: pageSize,
      page: 1,
      status: "finish",
      tags: "腾讯医典词条,腾讯军医词条,腾讯综述,腾讯手术,百度词条"
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

  const handleChange = (tag, checked) => {
    const newSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag);
    const values = queryString.parse(location.search);

    const paramsObject = {
      ...values,
      page: 1
    };

    if (newSelectedTags.length !== 0) {
      paramsObject["tags"] = newSelectedTags.join(",");
    } else {
      delete paramsObject["tags"];
    }
    const params = queryString.stringify(paramsObject);
    history.push(`${location.pathname}?${params}`);
    setSelectedTags(newSelectedTags);
    setPage(1);
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
      <BackTop />
      <Card>
        <div className="m-b:1">
          {tagsFromServer.map(tag => (
            <CheckableTag
              key={tag}
              checked={selectedTags.indexOf(tag) > -1}
              onChange={checked => handleChange(tag, checked)}
            >
              {tag}
            </CheckableTag>
          ))}
        </div>
        <div className="m-b:1">
          <Search
            placeholder="输入企划标题关键词"
            onSearch={onSearch}
            allowClear
            enterButton
          />
        </div>
        <Statistic className="m-b:1" title="已完成总数" value={total} />
        <Row gutter={16}>
          {projectList.map((project, index) => {
            const item = getPhase(project.stages[project.stages.length - 1])
              .upload_files[0];
            return (
              <Col key={index} span={isSm ? 24 : 8} className="m-b:2">
                <Card
                  onClick={() => setLightBox(project)}
                  cover={<ImgCard file={item} />}
                >
                  <div className="fl:l">{project.title}</div>
                  <div className="fl:r">{project.creator.name}</div>
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
