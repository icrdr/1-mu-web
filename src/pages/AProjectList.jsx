import React, { useEffect, useState, useContext } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import {
  Transfer,
  Table,
  Card,
  Tag,
  Button,
  Popconfirm,
  Input,
  Select,
  Modal,
  TimePicker,
  Icon,
  Progress,
  message,
  DatePicker,
  Divider,
  Menu,
  Dropdown,
  notification
} from "antd";
import { fetchData, updateData, parseDate } from "../utility";
import ProjectPostByCsv from "../components/ProjectPostByCsv";
import StatusTag from "../components/projectPage/StatusTag";
import queryString from "query-string";
import { globalContext } from "../App";
import useInterval from "../hooks/useInterval";
import StageShow from "../components/projectPage/StageShow";

const { Option } = Select;
const { TextArea } = Input;
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
  const [taskId, setTaskId] = useState("");

  const [projectList, setProjectList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isloading, setLoading] = useState(false);

  const [update, setUpdate] = useState(false);
  const [showPostponeModel, setPostponeModel] = useState();
  const [ddlDay, setDdlDay] = useState(moment(new Date()));
  const [ddlTime, setDdlTime] = useState(moment("00:00:00", "HH:mm:ss"));

  const [showRemarkModel, setRemarkModel] = useState();
  const [showTableModel, setTableModel] = useState(false);
  const [remark, setRemark] = useState("");

  const [isBatch, setBatch] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [isZipping, setZipping] = useState(0);
  const [taskData, setTaskData] = useState();

  const [transferTargetKeys, setTransferTargetKeys] = useState([]);
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
    filterIcon: () => (
      <Icon
        type="edit"
        theme="filled"
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
      <Icon
        type="calendar"
        theme="filled"
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
      width: 120,
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
            <>
              <span style={{ color: project.delay ? "red" : "" }}>
                {parseDate(deadline_date)}
              </span>
              <Button
                type="link"
                size="small"
                onClick={() => setPostponeModel(project)}
              >
                修改
              </Button>
            </>
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
      filteredValue: tableFilter["progress"] || [],
      width: 150,
      render: (progress, project) => {
        const goBack = (
          <Popconfirm
            title="确定如此操作么？"
            onConfirm={() => operateProject(project.id, "back")}
            okText="是"
            cancelText="否"
          >
            <Button type="link" size="small">
              回溯
            </Button>
          </Popconfirm>
        );
        return (
          <>
            <StageShow project={project} />
            {progress !== 0 && !project.pause && goBack}
          </>
        );
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
      filteredValue: tableFilter["status"] || [],
      width: 100,
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
      filters: groupList.map((group, index) => {
        return { text: group.name, value: index };
      }),
      filteredValue: tableFilter["client_id"] || [],
      width: 160,
      render: (client_id, project) => (
        <Select
          style={{ width: "100%", maxWidth: "120px" }}
          placeholder="选择小组"
          onChange={v => handleChangeGroup(v, project)}
          value={project.client.name}
        >
          {groupList.map(item => (
            <Option key={item.id}>{item.name}</Option>
          ))}
        </Select>
      )
    },
    {
      title: "制作者",
      dataIndex: "creator_id",
      sorter: true,
      sortOrder: tableSorter["creator_id"],
      sortDirections: ["descend", "ascend"],
      width: 160,
      render: (creator_id, project) => {
        const creator = project.creator;
        const the_group = groupList.filter(group => {
          return group.admins[0].id === project.client.id;
        })[0];
        return (
          <Select
            style={{ width: "100%", maxWidth: "120px" }}
            placeholder="选择制作"
            onChange={v => handleChangeCreator(v, project)}
            value={creator.name}
          >
            {the_group &&
              the_group.users.map(item => (
                <Option key={item.id}>{item.name}</Option>
              ))}
          </Select>
        );
      }
    },
    {
      title: "操作",
      key: "operation",
      width: 120,
      render: (key, project) => (
        <Dropdown overlay={menu(project)}>
          <Button>
            操作 <Icon type="down" />
          </Button>
        </Dropdown>
      )
    },
    {
      title: "备注",
      dataIndex: "remark",
      render: (remark, project) => {
        return (
          <div>
            {remark}
            <Button
              type="link"
              size="small"
              onClick={() => {
                setRemark(remark);
                setRemarkModel(project);
              }}
            >
              {remark ? "修改" : "添加"}
            </Button>
          </div>
        );
      }
    }
  ];

  const menu = project => (
    <Menu>
      {project.pause ? (
        <Menu.Item onClick={() => resumeConfirm(project.id)}>继续</Menu.Item>
      ) : (
        <Menu.Item onClick={() => pauseConfirm(project.id)}>暂停</Menu.Item>
      )}
      <Menu.Item onClick={() => discardConfirm(project.id)}>删除</Menu.Item>
    </Menu>
  );

  function pauseConfirm(id) {
    confirm({
      title: "确认",
      content: "您确定暂停该企划？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        operateProject(id, "pause");
      },
      onCancel() {}
    });
  }

  function resumeConfirm(id) {
    confirm({
      title: "确认",
      content: "您确定继续该企划？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        operateProject(id, "resume");
      },
      onCancel() {}
    });
  }

  function discardConfirm(id) {
    confirm({
      title: "确认",
      content: "您确定删除该企划？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        operateProject(id, "discard");
      },
      onCancel() {}
    });
  }

  const handleChangeGroup = (v, project) => {
    const the_group = groupList.filter(group => group.id === parseInt(v))[0];
    if (project.client.id === the_group.admins[0].id) return false;

    const path = `/projects/${project.id}`;
    const data = {
      client_id: the_group.admins[0].id,
      creator_id: the_group.admins[0].id
    };

    updateData(path, data).then(() => {
      setUpdate(!update);
    });
  };

  const handleChangeCreator = (v, project) => {
    if (project.creator.id === parseInt(v)) return false;
    const path = `/projects/${project.id}`;
    const data = {
      creator_id: v
    };
    updateData(path, data).then(() => {
      setUpdate(!update);
    });
  };

  const operateProject = (id, action) => {
    const path = `/projects/${id}/${action}`;
    updateData(path).then(() => {
      setUpdate(!update);
    });
  };
  useEffect(() => {
    setLoading(true);
    const path = "/groups";

    fetchData(path).then(res => {
      setGroupList(res.data.groups);
      setUpdate(!update);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (groupList.length > 0) {
      setLoading(true);
      const path = "/projects";
      const params = {
        pre_page: pagination.pageSize
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

      if (values.client_id) {
        const client_ids = [];
        for (const group_index of values.client_id.split(",")) {
          const the_groups = groupList[group_index];
          if (the_groups) {
            for (const admin of the_groups.admins) {
              client_ids.push(admin.id);
            }
          }
        }
        if (client_ids.length > 0) params.client_id = client_ids.join(",");
      }

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, update]);

  const handleTableChange = (pagination, filters, sorter) => {
    const values = queryString.parse(location.search);

    const paramsObject = {
      ...values,
      page: pagination.current
    };

    if (Object.keys(sorter).length !== 0) {
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
      if (filters[filter].length !== 0) {
        if (paramsObject[filter] !== filters[filter].join(",")) {
          setSelectedRowKeys([]);
          paramsObject[filter] = filters[filter].join(",");
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
    if (dates.length === 2) {
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

  const handlePostpone = () => {
    const path = `/projects/${showPostponeModel.id}/change_ddl`;
    if (!ddlDay || !ddlTime) {
      message.warn("未输入时间");
      return false;
    }
    const ddl = ddlTime.clone();
    ddl
      .year(ddlDay.year())
      .month(ddlDay.month())
      .date(ddlDay.date());

    const data = {
      ddl: ddl.utc().format("YYYY-MM-DD HH:mm:ss")
    };

    updateData(path, data)
      .then(() => {
        setUpdate(!update);
      })
      .finally(() => {
        setPostponeModel();
      });
  };

  const handleRemark = () => {
    console.log(remark);
    const path = `/projects/${showRemarkModel.id}`;
    const data = {
      remark: remark
    };
    updateData(path, data).then(() => {
      setUpdate(!update);
      setRemarkModel();
    });
  };

  const onSelectChange = selectedRowKeys => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const handleDownload = () => {
    setZipping(1);
    const path = "/download/projects";
    const params = {
      project_id: selectedRowKeys.join(","),
      mode: "source"
    };
    fetchData(path, params).then(res => {
      setTaskId(res.data.task_id);
      checkTask(res.data.task_id);
    });
  };

  const handleDownload2 = () => {
    setZipping(2);
    const path = "/download/projects";
    const params = {
      project_id: selectedRowKeys.join(","),
      mode: "compress"
    };

    fetchData(path, params).then(res => {
      setTaskId(res.data.task_id);
      checkTask(res.data.task_id);
    });
  };

  const handleExportTable = () => {
    setTableModel(false);
    setZipping(3);
    const path = "/download/projects/csv";
    const params = {
      project_id: selectedRowKeys.join(","),
      keys: transferTargetKeys.join(",")
    };

    const values = queryString.parse(location.search);
    if (values.order) {
      params.order = values.order;
      params.order_by = values.order_by;
    } else {
      params.order = "desc";
      params.order_by = "status";
    }

    fetchData(path, params).then(res => {
      setTaskId(res.data.task_id);
      checkTask(res.data.task_id);
    });
  };

  const checkTask = id => {
    const path = "/tasks/" + id;
    fetchData(path).then(res => {
      setTaskData(res.data);
      switch (res.data.state) {
        case "SUCCESS":
          setZipping(0);
          setTaskId();
          setTaskData();
          window.location.href = res.data.result.result;
          break;
        case "FAILURE":
          setZipping(0);
          setTaskId();
          setTaskData();
          message.error("未知错误");
          break;
        default:
          break;
      }
    });
  };
  useInterval(
    () => {
      checkTask(taskId);
    },
    taskId ? 1000 : null
  );

  const progressRender = task => {
    switch (task.state) {
      case "PENDING":
        return <Progress percent={0} format={() => "等待中"} />;
      case "PROGRESS":
        return (
          <Progress
            percent={parseFloat(
              Number((task.result.current / task.result.total) * 100).toFixed(1)
            )}
          />
        );
      case "SUCCESS":
        return <Progress percent={100} format={() => "成功"} />;
      default:
        return "";
    }
  };
  const handleTransferChange = (nextTargetKeys, direction, moveKeys) => {
    if (direction === "right") {
      setTransferTargetKeys(prevState => prevState.concat(moveKeys));
    } else {
      setTransferTargetKeys(nextTargetKeys);
    }
  };
  const headerData = [
    {
      key: "id",
      title: "ID"
    },
    {
      key: "title",
      title: "企划名"
    },
    {
      key: "tags",
      title: "标签"
    },
    {
      key: "start_date",
      title: "开始时间"
    },
    {
      key: "finish_date",
      title: "结束时间"
    },
    {
      key: "deadline_date",
      title: "死线日期"
    },
    {
      key: "progress",
      title: "企划进度"
    },
    {
      key: "status",
      title: "阶段状态"
    },
    {
      key: "finish",
      title: "企划状态"
    },
    {
      key: "client",
      title: "审核者"
    },
    {
      key: "creator",
      title: "制作者"
    }
  ];

  const openNotification = ({ creates, errors }) => {
    const title = `完成上传`;
    const description = (
      <div>
        <div>创建词条{creates.length}个</div>
      </div>
    );
    const rows = errors.map((e, i) => [e.title]);
    let csvContent = rows.map(e => e.join(",")).join("\n");

    notification.open({
      message: title,
      description: (
        <>
          {description}
          {rows.length > 0 && (
            <>
              <div>发生错误{rows.length}个</div>
              <div>
                <Button
                  href={
                    "data:attachment/csv;charset=utf-8," +
                    "\uFEFF" +
                    encodeURIComponent(csvContent)
                  }
                  target="_blank"
                  download="出现错误的词条.csv"
                >
                  下载错误表格
                </Button>
              </div>
            </>
          )}
        </>
      ),
      icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
      duration: 0
    });
  };

  return (
    <>
      <Modal
        title="生成表格"
        visible={showTableModel}
        onOk={handleExportTable}
        onCancel={() => setTableModel(false)}
      >
        <Transfer
          dataSource={headerData}
          titles={["可选数据", "目标数据"]}
          targetKeys={transferTargetKeys}
          onChange={handleTransferChange}
          render={item => item.title}
          locale={{ itemUnit: "项", itemsUnit: "项" }}
        />
      </Modal>
      <Modal
        title="备注"
        visible={showRemarkModel !== undefined}
        onOk={handleRemark}
        onCancel={() => setRemarkModel()}
      >
        备注{" "}
        <TextArea
          placeholder="备注说明"
          autosize={{ minRows: 2, maxRows: 6 }}
          value={remark}
          onChange={e => {
            e.persist();
            setRemark(e.target.value);
          }}
        />
      </Modal>
      <Modal
        title="延期"
        visible={showPostponeModel !== undefined}
        onOk={handlePostpone}
        onCancel={() => setPostponeModel()}
      >
        <span className="m-r:.5">死线日期</span>
        <DatePicker
          className="m-r:.5"
          value={ddlDay}
          onChange={v => setDdlDay(v)}
          style={{ width: "128px" }}
        />
        <TimePicker value={ddlTime} onChange={v => setDdlTime(v)} />
      </Modal>
      <Card bodyStyle={{ padding: isSm ? "24px 8px" : "" }}>
        <div className="m-b:1">
          <Button
            className="m-r:.5"
            type={isBatch ? "" : "link"}
            onClick={() => setBatch(!isBatch)}
          >
            <Icon type="profile" />
            批量操作
          </Button>
          <Link to="/admin/projects/post">
            <Button className="m-r:.5" type="primary">
              <Icon type="plus" />
              添加企划
            </Button>
          </Link>
          <ProjectPostByCsv
            onSucceed={msg => {
              openNotification(msg);
              setUpdate(!update);
            }}
          />
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
              onClick={handleDownload}
              loading={isZipping === 1}
              disabled={
                selectedRowKeys.length === 0 || (isZipping !== 1 && isZipping)
              }
            >
              批量下载源文件
            </Button>
            <Button
              className="m-r:.5"
              type="primary"
              onClick={handleDownload2}
              loading={isZipping === 2}
              disabled={
                selectedRowKeys.length === 0 || (isZipping !== 2 && isZipping)
              }
            >
              批量下载预览文件
            </Button>
            <Button
              className="m-r:.5"
              type="primary"
              onClick={() => setTableModel(true)}
              loading={isZipping === 3}
              disabled={
                selectedRowKeys.length === 0 || (isZipping !== 3 && isZipping)
              }
            >
              导出为表格
            </Button>
          </div>
        )}
        {taskId && (
          <div className="m-b:1">
            压缩文件中...{taskData && progressRender(taskData)}
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
    </>
  );
}
