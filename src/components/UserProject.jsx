import React, { useEffect, useState, useContext } from "react";
import moment from "moment";
import { Link, withRouter } from "react-router-dom";
import { EditFilled, CalendarFilled } from "@ant-design/icons";
import { Table, Tag, Button, Input, DatePicker, Divider, Card } from "antd";
import { fetchData, parseDate } from "../utility";
import StatusTag from "./projectPage/StatusTag";
import queryString from "query-string";
import { globalContext } from "../App";
import StageShow from "./projectPage/StageShow";
const { RangePicker } = DatePicker;

function UserProject({ location, history, userID, staticContext, ...rest }) {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 10
  });
  const [tableSorter, setTableSorter] = useState({});
  const [tableFilter, setTableFilter] = useState({});
  const [tableSearch, setTableSearch] = useState({});
  const [tableDate, setTableDate] = useState({});
  const allTableFilter = { status: [], creator_id: [], progress: [] };
  const allTableSearch = { title: "", tags: "" };
  const allTableDate = { start_date: [], finish_date: [], deadline_date: [] };
  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);

  const { isSm } = useContext(globalContext);

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: () => (
      <div>
        <div className="p:.8">
          <Input
            placeholder="输入关键词"
            value={tableSearch[dataIndex]}
            onChange={e => {
              e.persist();
              setTableSearch(prevState => {
                prevState[dataIndex] = e.target.value ? e.target.value : "";
                return { ...prevState };
              });
            }}
            onPressEnter={() => handleSearch(dataIndex, tableSearch[dataIndex])}
            style={{ width: 188, display: "block" }}
          />
        </div>
        <Divider className="m-y:0" />
        <div className="p-y:.6 p-x:.1">
          <Button
            type="link"
            onClick={() => handleSearch(dataIndex, tableSearch[dataIndex])}
            size="small"
          >
            OK
          </Button>
          <Button
            className="fl:r"
            type="link"
            onClick={() => handleSearch(dataIndex, "")}
            size="small"
          >
            Reset
          </Button>
        </div>
      </div>
    ),
    filteredValue: tableSearch[dataIndex] || null,
    filterIcon: () => (
      <EditFilled
        style={{ color: tableSearch[dataIndex] ? "#1890ff" : undefined }}
      />
    )
  });

  const getColumnDateProps = dataIndex => ({
    filterDropdown: () => (
      <div>
        <div className="p:.8">
          <RangePicker
            onChange={dates => {
              setTableDate(prevState => {
                prevState[dataIndex] = dates;
                return { ...prevState };
              });
            }}
            value={tableDate[dataIndex]}
            style={{ width: 218, display: "block" }}
          />
        </div>
        <Divider className="m-y:0" />
        <div className="p-y:.6 p-x:.1">
          <Button
            type="link"
            onClick={() => handleDateRange(dataIndex, tableDate[dataIndex])}
            size="small"
          >
            OK
          </Button>
          <Button
            className="fl:r"
            type="link"
            onClick={() => handleDateRange(dataIndex, [])}
            size="small"
          >
            Reset
          </Button>
        </div>
      </div>
    ),
    filterIcon: () => (
      <CalendarFilled
        style={{ color: tableDate[dataIndex] ? "#1890ff" : undefined }}
      />
    )
  });

  const columns = [
    {
      title: "企划名",
      dataIndex: "title",
      width: 150,
      sorter: true,
      sortOrder: tableSorter["title"],
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("title"),
      fixed: "left",
      render: (name, project) => {
        return (
          <Link to={`/projects/${project.id}`} className="dont-break-out">
            {name}
          </Link>
        );
      }
    },
    {
      title: "标签",
      dataIndex: "tags",
      ...getColumnSearchProps("tags"),
      render: tags => {
        return tags.map((tag, index) => <Tag key={index}>{tag.name}</Tag>);
      }
    },
    {
      title: "开始时间",
      dataIndex: "start_date",
      sorter: true,
      sortOrder: tableSorter["start_date"],
      sortDirections: ["descend", "ascend"],
      ...getColumnDateProps("start_date"),
      width: 150,
      render: start_date => {
        if (start_date) {
          return parseDate(start_date);
        } else {
          return "未开始";
        }
      }
    },
    {
      title: "结束时间",
      dataIndex: "finish_date",
      sorter: true,
      sortOrder: tableSorter["finish_date"],
      sortDirections: ["descend", "ascend"],
      ...getColumnDateProps("finish_date"),
      width: 150,
      render: finish_date => {
        if (finish_date) {
          return parseDate(finish_date);
        } else {
          return "未结束";
        }
      }
    },
    {
      title: "死线日期",
      dataIndex: "deadline_date",
      sorter: true,
      sortOrder: tableSorter["deadline_date"],
      sortDirections: ["descend", "ascend"],
      ...getColumnDateProps("deadline_date"),
      width: 150,
      render: (deadline_date, project) => {
        if (deadline_date) {
          return (
            <span style={{ color: project.delay ? "red" : "" }}>
              {parseDate(deadline_date)}
            </span>
          );
        } else {
          return "未进行";
        }
      }
    },
    {
      title: "企划进度",
      dataIndex: "progress",
      sorter: true,
      sortOrder: tableSorter["progress"],
      sortDirections: ["descend", "ascend"],
      filters: [
        { text: "未开始", value: 0 },
        { text: "草图", value: 1 },
        { text: "成图", value: 2 },
        { text: "已完成", value: -1 }
      ],
      filteredValue: tableFilter["progress"] || null,
      width: 150,
      render: (progress, project) => {
        return <StageShow project={project} />;
      }
    },
    {
      title: "阶段状态",
      dataIndex: "status",
      sorter: true,
      sortOrder: tableSorter["status"],
      sortDirections: ["descend", "ascend"],
      filters: [
        { text: "未开始", value: "await" },
        { text: "进行中", value: "progress" },
        { text: "修改中", value: "modify" },
        { text: "待确认", value: "pending" },
        { text: "已完成", value: "finish" },
        { text: "逾期（状态）", value: "delay" },
        { text: "暂停（状态）", value: "pause" }
      ],
      filteredValue: tableFilter["status"] || null,
      width: 150,
      render: (status, project) => <StatusTag project={project} />
    },
    {
      title: "审核者",
      dataIndex: "client_id",
      sorter: true,
      sortOrder: tableSorter["client_id"],
      sortDirections: ["descend", "ascend"],
      width: 150,
      render: (client_id, project) => {
        return (
          <Link to={"/users/" + project.client.id}>{project.client.name}</Link>
        );
      }
    },
    {
      title: "制作者",
      dataIndex: "creator_id",
      sorter: true,
      sortOrder: tableSorter["creator_id"],
      sortDirections: ["descend", "ascend"],
      width: 150,
      render: (creator_id, project) => {
        return (
          <Link to={"/users/" + project.creator.id}>
            {project.creator.name}
          </Link>
        );
      }
    }
  ];
  useEffect(() => {
    setLoading(true);
    const path = "/projects";
    const params = {
      pre_page: pagination.pageSize,
      participant_id: userID
    };

    const values = queryString.parse(location.search);
    if (values.page) {
      setPagination(prevState => {
        return { ...prevState, current: parseInt(values.page) };
      });
      params.page = values.page;
    } else {
      params.page = pagination.current;
    }

    const new_tableSorter = {};
    if (values.order) {
      new_tableSorter[values.order_by] =
        values.order === "desc" ? "descend" : "ascend";
      params.order = values.order;
      params.order_by = values.order_by;
    } else {
      params.order = "desc";
      params.order_by = "status";
    }
    setTableSorter(new_tableSorter);

    const new_tableFilter = {};
    for (const filter in allTableFilter) {
      if (filter in values) {
        new_tableFilter[filter] = values[filter].split(",");
        params[filter] = values[filter];
      }
    }
    setTableFilter(new_tableFilter);

    const new_tableSearch = {};
    for (const filter in allTableSearch) {
      if (filter in values) {
        new_tableSearch[filter] = values[filter];
        params[filter] = values[filter];
      }
    }
    setTableSearch(new_tableSearch);

    const new_tableDate = {};
    for (const filter in allTableDate) {
      if (filter in values) {
        new_tableDate[filter] = values[filter].split(",").map(date_str => {
          return moment.utc(date_str, "YYYY-MM-DD HH:mm:ss").local();
        });
        params[filter] = values[filter];
      }
    }
    setTableDate(new_tableDate);

    fetchData(path, params)
      .then(res => {
        setProjectList(res.data.projects);
        setPagination(prevState => {
          return { ...prevState, total: res.data.total };
        });
      })
      .catch(() => {
        setProjectList([]);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleTableChange = (pagination, filters, sorter) => {
    const values = queryString.parse(location.search);

    const paramsObject = {
      ...values,
      page: pagination.current
    };

    if (sorter.order !== undefined) {
      paramsObject.order = sorter.order === "descend" ? "desc" : "asc";
      paramsObject.order_by = sorter.field;
    } else {
      delete paramsObject.order;
      delete paramsObject.order_by;
    }

    for (const filter in filters) {
      if (filters[filter] !== null) {
        if (Array.isArray(filters[filter])) {
          paramsObject[filter] = filters[filter].join(",");
        } else {
          paramsObject[filter] = filters[filter];
        }
      } else {
        delete paramsObject[filter];
      }
    }

    const params = queryString.stringify(paramsObject);
    history.push(`${location.pathname}?${params}`);
  };

  const handleDateRange = (dataIndex, dates) => {
    const values = queryString.parse(location.search);
    const paramsObject = {
      ...values,
      page: 1
    };
    if (dates && dates.length === 2) {
      const dates_str = dates
        .map(date => {
          return moment(date.format("YYYY-MM-DD"))
            .utc()
            .format("YYYY-MM-DD HH:mm:ss");
        })
        .join(",");
      paramsObject[dataIndex] = dates_str;
    } else {
      delete paramsObject[dataIndex];
    }
    const params = queryString.stringify(paramsObject);
    history.push(`${location.pathname}?${params}`);
  };

  const handleSearch = (dataIndex, keyWord) => {
    const values = queryString.parse(location.search);
    const paramsObject = {
      ...values,
      page: 1
    };
    if (keyWord) {
      paramsObject[dataIndex] = keyWord;
    } else {
      delete paramsObject[dataIndex];
    }
    const params = queryString.stringify(paramsObject);
    history.push(`${location.pathname}?${params}`);
  };

  return (
    <Card {...rest} bodyStyle={{ padding: isSm ? "24px 8px" : "" }}>
      <Table
        columns={columns}
        rowKey={project => project.id}
        dataSource={projectList}
        loading={isloading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1300 }}
      />
    </Card>
  );
}

export default withRouter(UserProject);
