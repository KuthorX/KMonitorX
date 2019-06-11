const express = require("express")
var cors = require("cors")
const app = express()
const port = 3001

const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(cors())

let collection
let polyCollection
let collectionInit = false
let updating = false

const MongoClient = require("mongodb").MongoClient
const uri = "mongodb+srv://[yourMongoDb]/test?retryWrites=true&w=majority"
const client = new MongoClient(uri, { useNewUrlParser: true })
client.connect(err => {
  if (err) {
    console.log(err)
    process.exit(1)
  }
  collection = client.db("reporter").collection("test")
  polyCollection = client.db("reporter").collection("test_poly")
  collectionInit = true
  console.log("Connected Db")
})

app.get("/", (req, res) => res.send("Hello World!"))

app.get("/findUser", async (req, res) => {
  if (!collectionInit) {
    res.send({ msg: "db init, later query" })
    return
  }

  const uuid = req.query.uuid
  if (!uuid) {
    res.send({ code: -1, msg: "lack uuid" })
    return
  }
  const result = await polyCollection.find({ uuid: uuid })
  const hasNext = await result.hasNext()
  if (hasNext) {
    res.send(await result.next())
  }
  res.send({})
})

app.get("/findByDate", async (req, res) => {
  if (!collectionInit) {
    res.send({ msg: "db init, later query" })
    return
  }

  const start = req.query.start
  const end = req.query.end
  if (!start || !end) {
    res.send({ code: -1, msg: "lack params" })
    return
  }
  const result = await polyCollection.find({
    createTime: { $gte: new Date(start), $lte: new Date(end) }
  })
  const resultR = []
  while (await result.hasNext()) {
    resultR.push(await result.next())
  }
  res.send(resultR)
})

app.get("/findByReportType", async (req, res) => {
  if (!collectionInit) {
    res.send({ msg: "db init, later query" })
    return
  }

  const reportType = req.query.reportType
  const findCondition = {}
  const returnCondition = {
    userInfo: true,
    createTime: true,
    uuid: true,
    _id: false
  }
  returnCondition[reportType] = true

  const result = await polyCollection
    .find(findCondition)
    .project(returnCondition)
  const resultR = []
  while (await result.hasNext()) {
    resultR.push(await result.next())
  }
  res.send(resultR)
})

// 调试用！
app.get("/clear", async (req, res) => {
  if (!collectionInit) {
    res.send({ msg: "db init, later query" })
    return
  }

  await collection.drop()
  await client
    .db("reporter")
    .collection("test_poly")
    .drop()
  res.send({ msg: "droped" })
})

app.post("/report", async (req, res) => {
  if (!collectionInit) {
    res.send({ msg: "db init, later query" })
    return
  }

  const data = req.body
  const uuid = data.uuid
  const reportType = data.reportType
  const updateData = {
    uuid: uuid,
    createTime: new Date(),
    userInfo: data.userInfo,
    reportType: reportType,
    poly: false
  }

  if (reportType === "firstPaint") {
    updateData[reportType] = {
      paintStartTime: data.paintStartTime,
      href: data.href
    }
  } else if (reportType === "pageLoad") {
    updateData[reportType] = {
      duration: data.duration,
      href: data.name
    }
  } else if (reportType === "resourceTiming") {
    updateData[reportType] = {
      duration: data.duration,
      initiatorType: data.initiatorType,
      href: data.name,
      startTime: data.startTime
    }
  } else if (reportType === "codeError") {
    updateData[reportType] = {
      url: data.url,
      line: data.line,
      col: data.col,
      msg: data.msg,
      startTime: data.startTime
    }
  } else if (reportType === "userAction") {
    updateData[reportType] = {
      action: data.action,
      startTime: data.startTime,
      detail: data.detail
    }
  } else if (reportType === "functionTiming") {
    updateData[reportType] = {
      funtionName: data.funtionName,
      callTime: data.callTime,
      duratoin: data.duration
    }
  }

  if (uuid) {
    try {
      await collection.insertOne(updateData)
      res.send({ code: 0, msg: "Saved" })
    } catch (e) {
      res.send({ code: -2, msg: "fail" })
    }
  } else {
    res.send({ code: -1, msg: "lack uuid" })
  }
})

// Noted: 每次上报数据都修改终表，会导致部分数据没有录入，尤其是 resourceTiming eles
// 故需要 聚合函数 来每隔一段时间生成最终数据
// 当然，也可以前端负责聚合数据，但是这在数据很多的时候，后端查询、前端展示都有可能会超时
async function polyData() {
  console.log("start poly, time: " + new Date())
  const findR = await collection.find({
    poly: false
  })
  // 存储本次 update 的所有数据和 _id
  const updateData = {}
  const updateId = []

  while (await findR.hasNext()) {
    const data = await findR.next()
    const _id = data._id
    const uuid = data.uuid
    const createTime = data.createTime
    const userInfo = data.userInfo
    const reportType = data.reportType
    const reportData = data[reportType]

    let currentData = updateData[uuid]
    // 如果还没存储某个uuid的数据，先查找现在的聚合数据库有没有相关数据
    if (!currentData) {
      currentData = {}
      const findR2 = await polyCollection.find({ uuid: uuid })
      const has2 = await findR2.hasNext()
      if (has2) {
        const beforeData = await findR2.next()
        currentData.createTime = beforeData.createTime
        currentData.userInfo = beforeData.userInfo
        currentData.firstPaint = beforeData.firstPaint
        currentData.pageLoad = beforeData.pageLoad
        currentData.resourceTiming = beforeData.resourceTiming
        currentData.codeError = beforeData.codeError
        currentData.functionTiming = beforeData.functionTiming
        currentData.userAction = beforeData.userAction
      }
    }

    currentData.userInfo = userInfo
    if (!currentData.createTime) {
      currentData.createTime = createTime
    } else {
      const originDate = new Date(currentData.createTime)
      const checkDate = new Date(createTime)
      if (originDate > checkDate) {
        currentData.createTime = createTime
      }
    }
    if (!currentData[reportType]) {
      currentData[reportType] = []
    }
    currentData[reportType].push(reportData)
    updateData[uuid] = currentData
    updateId.push(_id)
  }

  // 更新聚合数据库
  try {
    const uuids = Object.keys(updateData)
    uuids.map(async uuid => {
      const d = updateData[uuid]
      await polyCollection.updateOne(
        { uuid: uuid },
        {
          $set: {
            uuid: uuid,
            userInfo: d.userInfo,
            createTime: d.createTime,
            firstPaint: d.firstPaint,
            pageLoad: d.pageLoad,
            resourceTiming: d.resourceTiming,
            codeError: d.codeError,
            functionTiming: d.functionTiming,
            userAction: d.userAction
          }
        },
        { upsert: true }
      )
    })
    updateId.map(async _id => {
      await collection.updateOne(
        { _id: _id },
        {
          $set: {
            poly: true
          }
        }
      )
    })
  } catch (e) {
    console.log("poly fail, ex: " + e)
  }
  updating = false
  console.log("end poly, time: " + new Date())
}

setInterval(function() {
  if (!collectionInit || updating) {
    return
  }
  updating = true
  polyData()
}, 15000)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
app.use(express.static("public"))
