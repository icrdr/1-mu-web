import React, { useEffect, useState, useCallback } from "react";
import { Card, Input, Modal, Tag, Button, BackTop } from "antd";
import { fetchData, getPhase } from "../utility";
import ImgCard from "../components/ImgCard";
import queryString from "query-string";
import { useMediaQuery } from "react-responsive";
import StackGrid from "react-stack-grid";
import useEvent from "../hooks/useEvent";
const { Search } = Input;
export default function DoneList({ location, history }) {
  const isSm = useMediaQuery({ query: "(max-width: 768px)" });
  const [stackGrid, setStackGrid] = useState();
  const [update, setUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const [projectList, setProjectList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isEnd, setEnd] = useState(false);
  const [lightBox, setLightBox] = useState();

  useEffect(() => {
    setLoading(true);
    const path = "/projects";
    const params = {
      order: "asc",
      pre_page: 12,
      page: page,
      creator_id: 1,
      progress: 2,
      status: "progress,pause",
      tags: "腾讯医典词条"
    };

    const values = queryString.parse(location.search);

    if (values.search) {
      params.search = values.search;
    }

    fetchData(path, params).then(res => {
      setProjectList(prevState => {
        return prevState.concat(res.data.projects);
      });
      if (res.data.projects.length > 0) {
        setPage(prevState => {
          return prevState + 1;
        });
      } else {
        setEnd(true);
      }
      setTimeout(() => {
        if (stackGrid) stackGrid.updateLayout();
        setLoading(false);
      }, 200);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, location]);

  const handleScroll = useCallback(() => {
    if (
      document.documentElement.offsetHeight +
        document.documentElement.scrollTop <
      document.documentElement.scrollHeight - 100
    )
      return;
    if (!isLoading && !isEnd) {
      setUpdate(!update);
    }
    // eslint-disable-next-line
  }, [isLoading]);

  useEvent("scroll", handleScroll);

  const onSearch = v => {
    setProjectList([]);
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
        <StackGrid
          className="m-b:1"
          columnWidth={isSm ? "100%" : "33.33%"}
          monitorImagesLoaded={true}
          gridRef={grid => setStackGrid(grid)}
          duration={180}
          gutterWidth={12}
          gutterHeight={12}
        >
          {projectList.map((project, index) => {
            const item = getPhase(project.stages[0]).upload_files[0];
            return (
              <Card
                key={index}
                onClick={() => setLightBox(project)}
                cover={<ImgCard file={item} />}
              >
                {project.title}
              </Card>
            );
          })}
        </StackGrid>
        {!isEnd ? (
          <Button
            type="primary"
            loading={isLoading}
            disabled={isEnd}
            onClick={() => setUpdate(!update)}
            block
          >
            {isLoading ? "加载中" : "点击加载"}
          </Button>
        ) : (
          <div className="t-a:c">没有更多内容啦...</div>
        )}
      </Card>
    </>
  );
}
