console.log("MonitorX loaded")

function MonitorXClass() {
  let isReport = true

  this.reportCodeError = function(data) {
    console.log(data)
    if (!isReport) return
    data.reportType = "codeError"
    this.basicReport(data)
  }

  this.reportResourceTiming = function(data) {
    if (!isReport) return
    // { name, initiatorType, duration, startTime }
    data.reportType = "resourceTiming"
    this.basicReport(data)
  }

  this.reportPageLoading = function(data) {
    if (!isReport) return
    // { name, duration }
    data.reportType = "pageLoad"
    this.basicReport(data)
  }

  this.reportFirstPaint = function(data) {
    if (!isReport) return
    data.reportType = "firstPaint"
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

  // 用户信息
  function initUserInfo() {
    {
      var unknown = "-"

      // screen
      var screenSize = ""
      if (screen.width) {
        width = screen.width ? screen.width : ""
        height = screen.height ? screen.height : ""
        screenSize += "" + width + " x " + height
      }

      // browser
      var nVer = navigator.appVersion
      var nAgt = navigator.userAgent
      var browser = navigator.appName
      var version = "" + parseFloat(navigator.appVersion)
      var majorVersion = parseInt(navigator.appVersion, 10)
      var nameOffset, verOffset, ix

      // Opera
      if ((verOffset = nAgt.indexOf("Opera")) != -1) {
        browser = "Opera"
        version = nAgt.substring(verOffset + 6)
        if ((verOffset = nAgt.indexOf("Version")) != -1) {
          version = nAgt.substring(verOffset + 8)
        }
      }
      // Opera Next
      if ((verOffset = nAgt.indexOf("OPR")) != -1) {
        browser = "Opera"
        version = nAgt.substring(verOffset + 4)
      }
      // Edge
      else if ((verOffset = nAgt.indexOf("Edge")) != -1) {
        browser = "Microsoft Edge"
        version = nAgt.substring(verOffset + 5)
      }
      // MSIE
      else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
        browser = "Microsoft Internet Explorer"
        version = nAgt.substring(verOffset + 5)
      }
      // Chrome
      else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
        browser = "Chrome"
        version = nAgt.substring(verOffset + 7)
      }
      // Safari
      else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
        browser = "Safari"
        version = nAgt.substring(verOffset + 7)
        if ((verOffset = nAgt.indexOf("Version")) != -1) {
          version = nAgt.substring(verOffset + 8)
        }
      }
      // Firefox
      else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
        browser = "Firefox"
        version = nAgt.substring(verOffset + 8)
      }
      // MSIE 11+
      else if (nAgt.indexOf("Trident/") != -1) {
        browser = "Microsoft Internet Explorer"
        version = nAgt.substring(nAgt.indexOf("rv:") + 3)
      }
      // Other browsers
      else if (
        (nameOffset = nAgt.lastIndexOf(" ") + 1) <
        (verOffset = nAgt.lastIndexOf("/"))
      ) {
        browser = nAgt.substring(nameOffset, verOffset)
        version = nAgt.substring(verOffset + 1)
        if (browser.toLowerCase() == browser.toUpperCase()) {
          browser = navigator.appName
        }
      }
      // trim the version string
      if ((ix = version.indexOf(";")) != -1) version = version.substring(0, ix)
      if ((ix = version.indexOf(" ")) != -1) version = version.substring(0, ix)
      if ((ix = version.indexOf(")")) != -1) version = version.substring(0, ix)

      majorVersion = parseInt("" + version, 10)
      if (isNaN(majorVersion)) {
        version = "" + parseFloat(navigator.appVersion)
        majorVersion = parseInt(navigator.appVersion, 10)
      }

      // mobile version
      var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer)

      // cookie
      var cookieEnabled = navigator.cookieEnabled ? true : false

      if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
        document.cookie = "testcookie"
        cookieEnabled =
          document.cookie.indexOf("testcookie") != -1 ? true : false
      }

      // system
      var os = unknown
      var clientStrings = [
        { s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/ },
        { s: "Windows 8.1", r: /(Windows 8.1|Windows NT 6.3)/ },
        { s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/ },
        { s: "Windows 7", r: /(Windows 7|Windows NT 6.1)/ },
        { s: "Windows Vista", r: /Windows NT 6.0/ },
        { s: "Windows Server 2003", r: /Windows NT 5.2/ },
        { s: "Windows XP", r: /(Windows NT 5.1|Windows XP)/ },
        { s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/ },
        { s: "Windows ME", r: /(Win 9x 4.90|Windows ME)/ },
        { s: "Windows 98", r: /(Windows 98|Win98)/ },
        { s: "Windows 95", r: /(Windows 95|Win95|Windows_95)/ },
        {
          s: "Windows NT 4.0",
          r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
        },
        { s: "Windows CE", r: /Windows CE/ },
        { s: "Windows 3.11", r: /Win16/ },
        { s: "Android", r: /Android/ },
        { s: "Open BSD", r: /OpenBSD/ },
        { s: "Sun OS", r: /SunOS/ },
        { s: "Linux", r: /(Linux|X11)/ },
        { s: "iOS", r: /(iPhone|iPad|iPod)/ },
        { s: "Mac OS X", r: /Mac OS X/ },
        { s: "Mac OS", r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
        { s: "QNX", r: /QNX/ },
        { s: "UNIX", r: /UNIX/ },
        { s: "BeOS", r: /BeOS/ },
        { s: "OS/2", r: /OS\/2/ },
        {
          s: "Search Bot",
          r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
        }
      ]
      for (var id in clientStrings) {
        var cs = clientStrings[id]
        if (cs.r.test(nAgt)) {
          os = cs.s
          break
        }
      }

      var osVersion = unknown

      if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1]
        os = "Windows"
      }

      switch (os) {
        case "Mac OS X":
          osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1]
          break

        case "Android":
          osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1]
          break

        case "iOS":
          osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer)
          osVersion =
            osVersion[1] + "." + osVersion[2] + "." + (osVersion[3] | 0)
          break
      }

      // flash (you'll need to include swfobject)
      /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
      var flashVersion = "no check"
      if (typeof swfobject != "undefined") {
        var fv = swfobject.getFlashPlayerVersion()
        if (fv.major > 0) {
          flashVersion = fv.major + "." + fv.minor + " r" + fv.release
        } else {
          flashVersion = unknown
        }
      }
    }

    window.jscd = {
      screen: screenSize,
      browser: browser,
      browserVersion: version,
      browserMajorVersion: majorVersion,
      mobile: mobile,
      os: os,
      osVersion: osVersion,
      cookies: cookieEnabled,
      flashVersion: flashVersion,
      uuid: ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
      )
    }

    console.log(window.jscd)
  }
  initUserInfo()
}

MonitorXClass.getMonitorX = function() {
  if (!MonitorXClass.instance) {
    MonitorXClass.instance = new MonitorXClass()
  }
  return MonitorXClass.instance
}

const MonitorX = MonitorXClass.getMonitorX()

// 长任务监控
// const observer = new PerformanceObserver(function(list) {
//   const perfEntries = list.getEntries()
//   for (let i = 0; i < perfEntries.length; i++) {
//     console.log(perfEntries[i])
//   }
// })
// observer.observe({ entryTypes: ["longtask"] })

const paintAndResourceObserver = new PerformanceObserver(function(list) {
  const perfEntries = list.getEntries()
  for (let i = 0; i < perfEntries.length; i++) {
    const perfEntry = perfEntries[i]
    console.log(perfEntry)
    if (perfEntry.name === "first-paint") {
      // 首屏渲染
      const paintStartTime = perfEntry.startTime
      console.log(`paintDuration: ${paintStartTime}`)
      MonitorX.reportFirstPaint({
        paintStartTime: paintStartTime,
        href: window.location.href
      })
    } else if (perfEntry.entryType === "resource") {
      // 资源加载
      // Noted: 因为放在onload里只会读取一次，这样无法拿到以后的资源加载信息
      const name = perfEntry.name
      if (name === "http://localhost:3001/report") {
        return
      }
      const initiatorType = perfEntry.initiatorType
      const duration = perfEntry.duration
      const startTime = perfEntry.startTime
      const data = { name, initiatorType, duration, startTime }
      MonitorX.reportResourceTiming(data)
    }
  }
})
paintAndResourceObserver.observe({ entryTypes: ["resource", "paint"] })

function resourceTiming() {
  // 页面加载
  // Noted: 如果不在 setTimeout 里取 duration = 0，不理解为什么
  setTimeout(function() {
    const [pageNavigationEntry] = window.performance.getEntriesByType(
      "navigation"
    )
    const name = pageNavigationEntry.name
    const duration = pageNavigationEntry.duration
    const pageLoadingData = { name, duration }
    console.log(pageLoadingData)
    MonitorX.reportPageLoading(pageLoadingData)
  }, 0)
}

// 代码错误
window.onerror = function(msg, url, line, col, error) {
  // 没有URL不上报
  if (msg != "Script error." && !url) {
    return true
  }
  setTimeout(function() {
    var data = {}
    // 不一定所有浏览器都支持col参数
    col = col || (window.event && window.event.errorCharacter) || 0

    data.url = url
    data.line = line
    data.col = col
    if (!!error && !!error.stack) {
      // 如果浏览器有堆栈信息, 直接使用
      data.msg = error.stack.toString()
    } else if (!!arguments.callee) {
      // 尝试通过callee拿堆栈信息
      var ext = []
      var f = arguments.callee.caller,
        c = 3
      // 这里只拿三层堆栈信息
      while (f && --c > 0) {
        ext.push(f.toString())
        if (f === f.caller) {
          break // 如果有循环引用
        }
        f = f.caller
      }
      ext = ext.join(",")
      data.msg = error.stack.toString()
    }
    data.startTime = new Date()
    MonitorX.reportCodeError(data)
  }, 0)

  return true
}
