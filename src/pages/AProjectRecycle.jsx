import React, { useEffect, useState, useContext } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { EditFilled, CalendarFilled, ProfileOutlined } from "@ant-design/icons";
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Modal,
  DatePicker,
  Divider
} from "antd";
import { fetchData, updateData, parseDate } from "../utility";
import StatusTag from "../components/projectPage/StatusTag";
import queryString from "query-string";
import { globalContext } from "../App";
import StageShow from "../components/projectPage/StageShow";

const { confirm } = Modal;
const { RangePicker } = DatePicker;

export default function ProjectList({ location, history }) {
  const { isSm } = useContext(globalContext);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 10
  });
  const [tableSorter, setTableSorter] = useState({});
  const [tableFilter, setTableFilter] = useState({});
  const [tableSearch, setTableSearch] = useState({});
  const [tableDate, setTableDate] = useState({});

  const [projectList, setProjectList] = useState([]);
  const [isloading, setLoading] = useState(false);

  const [update, setUpdate] = useState(false);
  const [isBatch, setBatch] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const allTableFilter = { status: [], client_id: [], progress: [] };
  const allTableSearch = { title: "", tags: "" };
  const allTableDate = { start_date: [], finish_date: [], deadline_date: [] };

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
      title: "ID",
      dataIndex: "id",
      width: 50,
      sorter: true,
      sortOrder: tableSorter["id"],
      sortDirections: ["descend", "ascend"],
      fixed: "left"
    },
    {
      title: "企划名",
      dataIndex: "title",
      width: isSm ? 130 : 180,
      sorter: true,
      sortOrder: tableSorter["title"],
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("title"),
      fixed: "left",
      render: (name, project) => {
        return (
          <Link to={`/admin/projects/${project.id}`} className="dont-break-out">
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
      width: 200,
      render: start_date => {
        if (start_date) {
          return parseDate(start_date);
        } else {
          return "未开始";
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
      width: 200,
      render: (progress, project) => <StageShow project={project} />
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
      width: 200,
      render: (status, project) => {
        return <StatusTag project={project}></StatusTag>;
      }
    },
    {
      title: "审核者",
      dataIndex: "client_id",
      sorter: true,
      sortOrder: tableSorter["client_id"],
      sortDirections: ["descend", "ascend"],
      width: 200,
      render: (client_id, project) => <div>{project.client.name}</div>
    },
    {
      title: "制作者",
      dataIndex: "creator_id",
      sorter: true,
      sortOrder: tableSorter["creator_id"],
      sortDirections: ["descend", "ascend"],
      width: 200,
      render: (creator_id, project) => <div>{project.creator.name}</div>
    },
    {
      title: "恢复企划",
      key: "operation",
      width: 120,
      render: (key, project) => (
        <Button
          type="link"
          size="small"
          onClick={() => recoverConfirm(project.id)}
        >
          恢复
        </Button>
      )
    }
  ];

  function recoverConfirm(id) {
    confirm({
      title: "确认",
      content: "您确定恢复该企划？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        operateProject(id, "recover");
      },
      onCancel() {}
    });
  }

  const operateProject = (id, action) => {
    const path = `/projects/${id}/${action}`;
    updateData(path).then(() => {
      setUpdate(!update);
    });
  };

  useEffect(() => {
    setLoading(true);
    const path = "/projects";
    const params = {
      pre_page: pagination.pageSize,
      discard: 1
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
  }, [location, update]);

  const onSelectChange = selectedRowKeys => {
    setSelectedRowKeys(selectedRowKeys);
  };
  function selectRecoverConfirm() {
    confirm({
      title: "确认",
      content: "您确定恢复这些企划？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        handleSelectedProjectAction("recover");
      },
      onCancel() {}
    });
  }
  const handleSelectedProjectAction = action => {
    const path = `/projects/${action}`;
    const params = {
      project_id: selectedRowKeys.join(",")
    };

    updateData(path, params).then(res => {
      setUpdate(!update);
    });
  };
  const handleTableChange = (pagination, filters, sorter) => {
    const values = queryString.parse(location.search);

    const paramsObject = {
      ...values,
      page: pagination.current
    };

    if (sorter.order !== undefined) {
      const order = sorter.order === "descend" ? "desc" : "asc";
      if (paramsObject.order !== order) {
        setSelectedRowKeys([]);
        paramsObject.order = order;
      }
      if (paramsObject.order_by !== sorter.field) {
        setSelectedRowKeys([]);
        paramsObject.order_by = sorter.field;
      }
    } else {
      delete paramsObject.order;
      delete paramsObject.order_by;
    }

    for (const filter in filters) {
      if (filters[filter] !== null) {
        if (Array.isArray(filters[filter])) {
          if (paramsObject[filter] !== filters[filter].join(",")) {
            setSelectedRowKeys([]);
          }
          paramsObject[filter] = filters[filter].join(",");
        } else {
          if (paramsObject[filter] !== filters[filter]) {
            setSelectedRowKeys([]);
          }
          paramsObject[filter] = filters[filter];
        }
      } else {
        delete paramsObject[filter];
      }
    }
    // console.log(paramsObject)
    const params = queryString.stringify(paramsObject);
    history.push(`${location.pathname}?${params}`);
  };

  const handleSearch = (dataIndex, keyWord) => {
    setSelectedRowKeys([]);
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

  const handleDateRange = (dataIndex, dates) => {
    setSelectedRowKeys([]);
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

  return (
    <Card bodyStyle={{ padding: isSm ? "24px 8px" : "" }}>
      <div className="m-b:1">
        <Button
          className="m-r:.5"
          type={isBatch ? "" : "link"}
          onClick={() => setBatch(!isBatch)}
        >
          <ProfileOutlined />
          批量操作
        </Button>
      </div>
      {isBatch && (
        <div className="m-b:1">
          <span className="m-r:.5">已选择{selectedRowKeys.length}个项目</span>
          <Button
            className="m-r:.5"
            onClick={() => setSelectedRowKeys([])}
            disabled={selectedRowKeys.length === 0}
          >
            取消所有
          </Button>
          <Button
            className="m-r:.5"
            type="primary"
            onClick={() => selectRecoverConfirm()}
            loading={false}
            disabled={selectedRowKeys.length === 0}
          >
            恢复
          </Button>
        </div>
      )}
      <Table
        rowSelection={
          isBatch
            ? {
                columnWidth: isSm ? 48 : 60,
                selectedRowKeys,
                onChange: onSelectChange
              }
            : undefined
        }
        columns={columns}
        rowKey={project => project.id}
        dataSource={projectList}
        loading={isloading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1700 }}
      />
    </Card>
  );
}
