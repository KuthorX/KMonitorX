console.log("MonitorXInner loaded")

export function MonitorXInnerClass() {
  let isReport = true

  this.reportFunctionTiming = function(data) {
    if (!isReport) return
    data.reportType = "functionTiming"
    this.basicReport(data)
    // const d = {
    //   funtionName: funName,
    //   callTime: this.timestampStart,
    //   duration: this.timestampEnd - this.timestampStart
    // }
  }

  this.reportUserAction = function(data) {
    console.log(data)
    if (!isReport) return
    // { action, startTime, detail}
    data.reportType = "userAction"
    this.basicReport(data)
  }

  this.basicReport = function(data) {
    data.userInfo = window.jscd
    data.uuid = window.jscd.uuid
    fetch("http://localhost:3001/report", {
      body: JSON.stringify(data),
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(function(response) {
        return response.json()
      })
      .then(function(myJson) {
        console.log(JSON.stringify(myJson))
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  // 函数耗时
  this.getFunExecTime = (function() {
    const that = this
    function decoratorBefore(fn, beforeFn) {
      return function() {
        var ret = beforeFn.apply(this, arguments)

        if (ret !== false) {
          fn.apply(this, arguments)
        }
      }
    }

    function decoratorAfter(fn, afterFn) {
      return function() {
        fn.apply(this, arguments)
        afterFn.apply(this, arguments)
      }
    }

    var funTimes = {}

    return function(fun, funName) {
      funName = funName || fun

      if (funTimes[funName]) {
        return funTimes[funName]
      }

      funTimes[funName] = decoratorAfter(
        decoratorBefore(fun, function() {
          funTimes[funName].timestampStart = performance.now()
        }),
        function() {
          funTimes[funName].timestampEnd = performance.now()

          const data = {
            funtionName: funName,
            callTime: this.timestampStart,
            duration: this.timestampEnd - this.timestampStart
          }
          that.reportFunctionTiming(data)

          funTimes[funName].valueOf = function() {
            return data.duration
          }
        }
      )

      return funTimes[funName]
    }
  })()
}

MonitorXInnerClass.getMonitorX = function() {
  if (!MonitorXInnerClass.instance) {
    MonitorXInnerClass.instance = new MonitorXInnerClass()
  }
  return MonitorXInnerClass.instance
}
