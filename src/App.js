import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Link } from "react-router-dom"
import Chart from "chart.js"
import { MonitorXInnerClass } from "./MonitorInner"
import { Table, List, Collapse } from "antd"
import "antd/dist/antd.css"
import "./App.css"

function MainPage() {
  const [imgs, setImgs] = useState([])

  useEffect(() => {
    for (let i = 0; i < 10; i++) {
      const r1 = (Math.random() + 1) * 200
      const r2 = (Math.random() + 1) * 200
      const url = `http://placekitten.com/g/${parseInt(r1)}/${parseInt(r2)}`
      imgs.push(<img src={url} key={r1 + "" + r2} alt={""} />)
      setImgs([...imgs])
    }
  }, [])

  function onAddClick() {
    const r1 = (Math.random() + 1) * 200
    const r2 = (Math.random() + 1) * 200
    const url = `http://placekitten.com/g/${parseInt(r1)}/${parseInt(r2)}`
    imgs.push(<img src={url} key={r1 + "" + r2} alt={""} />)
    setImgs([...imgs])
  }

  return (
    <div className="App">
      <div
        onClick={function(s) {
          const start = Date.now()
          while (Date.now() - start < 1000) {}
        }}
      >
        aa
      </div>
      <button onClick={onAddClick}>Add</button>
      {imgs}
      <img src="http://localhost:3001/a" alt="" />
    </div>
  )
}

function DataPage() {
  useEffect(() => {
    fetch("http://localhost:3001/findByReportType?reportType=firstPaint")
      .then(function(response) {
        return response.json()
      })
      .then(function(myJson) {
        console.log(JSON.stringify(myJson))
        const dataMap = {}
        myJson.map(value => {
          if (!value.firstPaint) {
            return
          }
          const paintStartTime = value.firstPaint[0].paintStartTime
          const href = value.firstPaint[0].href
          const createTime = value.createTime
          if (!dataMap[href]) {
            dataMap[href] = []
          }
          dataMap[href].push({
            x: new Date(createTime),
            y: parseInt(paintStartTime)
          })
        })
        const dataHrefs = Object.keys(dataMap)
        const datasets = []
        dataHrefs.map(href => {
          const data = dataMap[href]
          datasets.push({
            label: href,
            backgroundColor: `rgba(${parseInt(Math.random() * 255)}, 
            ${parseInt(Math.random() * 255)}, 
            ${parseInt(Math.random() * 255)}, 0.5)`,
            // borderColor: "#66ccff",
            borderWidth: 1,
            data: data
          })
        })
        var ctx = document.getElementById("firstPaintChart").getContext("2d")
        var data = {
          datasets: datasets
        }
        const options = {
          title: {
            display: true,
            text: "firstPaint"
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  source: "data"
                },
                type: "time",
                distribution: "series",
                time: {
                  unit: "second"
                },
                stacked: true
              }
            ],
            yAxes: [
              {
                stacked: false
              }
            ]
          },
          aspectRatio: 4
        }
        new Chart(ctx, {
          type: "bar",
          data: data,
          options: options
        })
      }, [])
      .catch(function(error) {
        console.log(error)
      })
    fetch("http://localhost:3001/findByReportType?reportType=pageLoad")
      .then(function(response) {
        return response.json()
      })
      .then(function(myJson) {
        console.log(JSON.stringify(myJson))
        const dataMap = {}
        myJson.map(value => {
          if (!value.pageLoad) {
            return
          }
          const duration = value.pageLoad[0].duration
          const href = value.pageLoad[0].href
          const createTime = value.createTime
          if (!dataMap[href]) {
            dataMap[href] = []
          }
          dataMap[href].push({
            x: new Date(createTime),
            y: parseInt(duration)
          })
        })
        const dataHrefs = Object.keys(dataMap)
        const datasets = []
        dataHrefs.map(href => {
          const data = dataMap[href]
          datasets.push({
            label: href,
            backgroundColor: `rgba(${parseInt(Math.random() * 255)}, 
            ${parseInt(Math.random() * 255)}, 
            ${parseInt(Math.random() * 255)}, 0.5)`,
            // borderColor: "#66ccff",
            borderWidth: 1,
            data: data
          })
        })
        var ctx = document.getElementById("pageLoadChart").getContext("2d")
        var data = {
          datasets: datasets
        }
        const options = {
          title: {
            display: true,
            text: "pageLoad"
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  source: "data"
                },
                type: "time",
                distribution: "series",
                time: {
                  unit: "second"
                },
                stacked: true
              }
            ],
            yAxes: [
              {
                stacked: false
              }
            ]
          },
          aspectRatio: 4
        }
        new Chart(ctx, {
          type: "bar",
          data: data,
          options: options
        })
      }, [])
      .catch(function(error) {
        console.log(error)
      })

    fetch("http://localhost:3001/findByReportType?reportType=resourceTiming")
      .then(function(response) {
        return response.json()
      })
      .then(function(myJson) {
        console.log(JSON.stringify(myJson))
        const dataMap = {}
        const allDuration = []
        myJson.map(value => {
          if (!value.resourceTiming) {
            return
          }
          value.resourceTiming.map(rT => {
            const duration = rT.duration
            allDuration.push(duration)
            const href = rT.href
            const createTime = value.createTime
            if (!dataMap[href]) {
              dataMap[href] = []
            }
            dataMap[href].push({
              x: new Date(createTime),
              y: parseInt(duration)
            })
          })
        })
        let min = allDuration[0]
        let max = allDuration[0]
        allDuration.map(v => {
          if (min > v) {
            min = v
          }
          if (max < v) {
            max = v
          }
        })
        const dataHrefs = Object.keys(dataMap)
        const datasets = []
        dataHrefs.map(href => {
          const data = dataMap[href]
          data.map((point, index) => {
            data[index].r = (9 * point.y - 10 * min + max) / (max - min)
          })
          datasets.push({
            label: href,
            backgroundColor: `rgba(${parseInt(Math.random() * 255)}, 
            ${parseInt(Math.random() * 255)}, 
            ${parseInt(Math.random() * 255)}, 0.5)`,
            // borderColor: "#66ccff",
            borderWidth: 1,
            data: data
          })
        })
        var ctx = document
          .getElementById("resourceTimingChart")
          .getContext("2d")
        var data = {
          datasets: datasets
        }
        const options = {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: "resourceTiming"
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  source: "data"
                },
                type: "time",
                distribution: "series",
                time: {
                  unit: "second"
                },
                stacked: true
              }
            ],
            yAxes: [
              {
                stacked: false
              }
            ]
          },
          aspectRatio: 3
        }
        new Chart(ctx, {
          type: "bar",
          data: data,
          options: options
        })
      }, [])
      .catch(function(error) {
        console.error(error)
      })
  })

  return (
    <div>
      <div
        style={{
          width: "99%",
          height: "100px"
        }}
      >
        <canvas id="firstPaintChart" />
        <canvas id="pageLoadChart" />
        <canvas id="resourceTimingChart" />
      </div>
    </div>
  )
}

function UserPage() {
  const MonitorX = MonitorXInnerClass.getMonitorX()

  function onEatClick() {
    const userAction = {
      action: "eat",
      startTime: new Date(),
      detail: "click eat button"
    }
    MonitorX.reportUserAction(userAction)
  }

  function onDrinkClick() {
    const userAction = {
      action: "drink",
      startTime: new Date(),
      detail: "click drink button"
    }
    MonitorX.reportUserAction(userAction)
  }

  function onDanceClick() {
    const userAction = {
      action: "dance",
      startTime: new Date(),
      detail: "click dance button"
    }
    MonitorX.reportUserAction(userAction)
    // 故意出错
    const a = {}.data.d
  }

  return (
    <div>
      <div>
        <button onClick={onEatClick}>Eat</button>
      </div>
      <div>
        <button onClick={onDrinkClick}>Drink</button>
      </div>
      <div>
        <button onClick={onDanceClick}>Dance</button>
      </div>
    </div>
  )
}

function ErrorPage() {
  const Panel = Collapse.Panel

  const columns = [
    {
      title: "startTime",
      dataIndex: "startTime",
      key: "startTime",
      sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
      defaultSortOrder: "ascend"
    },
    {
      title: "type",
      dataIndex: "type",
      key: "type",
      render: (text, record, index) => {
        if (text === "action") {
          return <div style={{ color: "#66ccff" }}>{text}</div>
        } else if (text === "error") {
          return <div style={{ color: "#ff0000" }}>{text}</div>
        }
      }
    },
    {
      title: "msg",
      dataIndex: "msg",
      key: "msg",
      render: (text, record, index) => {
        return <pre>{text}</pre>
      }
    }
  ]

  const [tables, setTables] = useState(<></>)

  useEffect(() => {
    async function get() {
      const codeError = await (await fetch(
        "http://localhost:3001/findByReportType?reportType=codeError"
      )).json()
      const userAction = await (await fetch(
        "http://localhost:3001/findByReportType?reportType=userAction"
      )).json()
      // 存储每个 uuid 下的所有用户操作和代码错误
      // 最终展示数据的时候，以一个 uuid 为一个大列表
      // 列表项按照时间顺序依次展示信息
      const finalMap = {}
      codeError.map(ceD => {
        const uuid = ceD.uuid
        if (ceD.codeError) {
          if (!finalMap[uuid]) {
            finalMap[uuid] = {
              items: [],
              userInfo: ceD.userInfo,
              action: 0,
              error: 0
            }
          }
          ceD.codeError.map(error => {
            finalMap[uuid].items.push({ type: "error", data: error })
          })
          finalMap[uuid].error = ceD.codeError.length
        }
      })
      userAction.map(uaD => {
        const uuid = uaD.uuid
        if (uaD.userAction) {
          if (!finalMap[uuid]) {
            finalMap[uuid] = {
              items: [],
              userInfo: uaD.userInfo,
              action: 0,
              error: 0
            }
          }
          uaD.userAction.map(action => {
            finalMap[uuid].items.push({ type: "action", data: action })
          })
          finalMap[uuid].action = uaD.userAction.length
        }
      })
      const fiK = Object.keys(finalMap)
      const newTables = []
      fiK.map(uuid => {
        const fiD = finalMap[uuid]
        const src = []
        fiD.items.map((d, index) => {
          if (d.type === "error") {
            src.push({
              key: index,
              type: "error",
              msg: `url: ${d.data.url}\nline: ${d.data.line}\ncol: ${
                d.data.col
              }\nmsg: ${d.data.msg}`,
              startTime: d.data.startTime
            })
          } else if (d.type === "action") {
            src.push({
              key: index,
              type: "action",
              msg: `action: ${d.data.action}\ndetail: ${d.data.detail}`,
              startTime: d.data.startTime
            })
          }
        })
        const listData = []
        const kk = Object.keys(fiD.userInfo)
        kk.map(k => {
          listData.push({
            title: k
          })
        })
        const header = (
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center"
            }}
          >
            <div style={{ width: "280px" }}>{uuid}</div>
            <span style={{ color: "#66ccff", marginLeft: "20px" }}>
              Action {finalMap[uuid].action}
            </span>{" "}
            <span style={{ color: "#ff0000", marginLeft: "20px" }}>
              Error {finalMap[uuid].error}
            </span>
          </div>
        )
        newTables.push(
          <Panel header={header} key={uuid}>
            <div style={{ width: "100%" }}>
              <h3>User Info</h3>
              <List
                grid={{ gutter: 0, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 12 }}
                itemLayout="horizontal"
                dataSource={listData}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={fiD.userInfo[item.title]}
                    />
                  </List.Item>
                )}
              />
              <h3>Detail</h3>
              <Table dataSource={src} columns={columns} />
            </div>
          </Panel>
        )
      })
      setTables(newTables)
    }
    get()
  }, [])

  return (
    <div>
      <Collapse defaultActiveKey={[]}>{tables}</Collapse>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div>
        <Route path="/" exact component={MainPage} />
        <Route path="/data/" component={DataPage} />
        <Route path="/user/" component={UserPage} />
        <Route path="/error/" component={ErrorPage} />
      </div>
    </Router>
  )
}

export default App
