import { ElMessage, ElMessageBox } from 'element-plus'
import { getLodop } from '@/assets/js/LodopFuncs.js'
import store from '@/store'
import router from '@/router'
import { cloneDeep, omit } from 'lodash-es'
import generate from 'nanoid'
import { add, subtract, multiply, divide, bignumber, ceil, floor, round } from 'mathjs'

let timer = null
let lastCall = 0

export default {
  /**
   * 通过key找到在列表中对应的显示
   * @param {Object} obj
   *  @param obj.dataList 数据列表
   *  @param obj.value    数据的值对应的字段名称   例如 'value'
   *  @param obj.label    数据的说明对应的字段名称 例如 'label'
   *  @param obj.data     当前传入的数据值
   * @return name        返回当前传入值在数组中对应的名字
   */
  getDataName: (obj) => {
    let name = obj.data
    if (Array.isArray(obj.dataList) && obj.dataList.length > 0) {
      for (let i = 0; i < obj.dataList.length; i++) {
        if (obj.dataList[i][obj.value] === obj.data) {
          name = obj.dataList[i][obj.label]
        }
      }
    }
    return name
  },
  getLocalPrinterList: () => {
    let LODOP = getLodop()
    if(LODOP){
      let iPrinterList = LODOP.GET_PRINTER_COUNT()
      let options = []
      for (let i = 0; i < iPrinterList; i++) {
        let printerName = LODOP.GET_PRINTER_NAME(i)
        options.push({
          label: printerName,
          id: i,
        })
      }
      return options
    }
  },
  // 获取组件类型和名称
  getComponentsData: (pcRouter) => {
    if (!pcRouter) return {}
    const pcArr = pcRouter.split('&')
    const obj = {}
    pcArr.forEach((item) => {
      const tempArr = item.split('=')
      obj[tempArr[0]] = tempArr[1]
    })
    return obj
  },
  // flowType-跳转页面，权重大于判断assigneeList fromComponent动态传值，处理Navbar等特殊情况
  setFlowData(obj) {
    window.$wujie?.bus.$emit('flowSonSetChange', 'setFlowData', obj)
  },
  // flowType-跳转页面，权重大于判断assigneeList
  setFlowPath(proxy) {
    window.$wujie?.bus.$emit('flowSonSetChange', 'onClose', proxy)
  },
  // 一般用于数量
  qtyFormatter: (num, column, cellValue, index) => {
    if (
      num &&
      num.emptyRowType &&
      (num.emptyRowType === '1' || num.emptyRowType === '2')
    ) {
      return ''
    }
    let systemConfig = store.state.permission.systemConfig
    let contract_qty_show_precision = systemConfig.contract_qty_show_precision
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num && !isNaN(num)) {
      return format_number(
        parseFloat(num),
        contract_qty_show_precision,
        2
        // isDrug ? systemConfig.drug_qty_show_retention_strategy : systemConfig.qty_show_retention_strategy
      )
    }
    if (newNum && !!newNum.isColspan) {
      return ''
    } else {
      return format_number(
        parseFloat(0),
        contract_qty_show_precision,
        2
        // isDrug ? systemConfig.drug_qty_show_retention_strategy : systemConfig.qty_show_retention_strategy
      )
    }
  },
  qtyFixedFormatter: (num, column, cellValue, index) => {
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num && !isNaN(num)) {
      return format_number(parseFloat(num), 2, 2)
    }
    if (newNum && !!newNum.isColspan) {
      return ''
    } else {
      return format_number(parseFloat(0), 2, 2)
    }
  },
  priceFormatter: (num, column, cellValue, index) => {
    let systemConfig = store.state.permission.systemConfig
    let contract_price_precision = systemConfig.contract_price_precision
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num && !isNaN(num)) {
      return format_number(parseFloat(num), contract_price_precision, 2)
    }
    if (newNum && !!newNum.isColspan) {
      return ''
    } else {
      return format_number(parseFloat(0), contract_price_precision, 2)
    }
  },
  // 数字转三位分节符（一般用于金额）
  TripartiteMethod: (num, column, cellValue, index) => {
    if (
      num &&
      num.emptyRowType &&
      (num.emptyRowType === '1' || num.emptyRowType === '2')
    ) {
      return ''
    }
    let systemConfig = store.state.permission.systemConfig
    //判断是合同金额amount还是价格price
    // let isAmount = !!(column && column.property && ( column.property.includes('amount') || column.property.includes('Amount')))
    // let contract_price_precision = isAmount ? systemConfig.contract_amount_precision : systemConfig.contract_price_precision
    let contract_price_precision = 2
    let value = 0
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num) {
      num = format_number(
        parseFloat(num),
          contract_price_precision,
        2,
        systemConfig.amount_supplement_0
      ).toString()
      let type = true
      let t1 = '',
        t2 = '',
        arr = []
      //去除逗号字符
      num = num.replace(/,/g, '')

      //判断是否有小数点
      if (num.indexOf('.') < 0) {
        t1 = num.split('')
      } else {
        type = false
        arr = num.split('.')
        t1 = arr[0].toString().split('')
        t2 = arr[1].toString()
      }

      //添加逗号字符

      let result = [],
        counter = 0
      for (let i = t1.length - 1; i >= 0; i--) {
        counter++
        result.unshift(t1[i])
        if (counter % 3 == 0 && i != 0 && t1[i - 1] !== '-') {
          result.unshift(',')
        }
      }
      //判断显示类型是否有小数
      if (type === true) {
        value = result.join('')
      } else {
        value = result.join('') + '.' + t2
      }
    } else {
      if (newNum && !!newNum.isColspan) {
        value = ''
      } else {
        value = format_number(
          parseFloat(value),
          contract_price_precision,
          2,
          systemConfig.amount_supplement_0
        )
      }
    }
    return value
  },

  getAssetRate(num) {
    let systemConfig = store.state.permission.systemConfig
    if (num) {
      return format_number(
        parseFloat(num),
        systemConfig.assets_price_precision + 2,
        systemConfig.assets_price_retention_strategy
      )
    }
    return num
  },

  getAssetAmount(num) {
    let systemConfig = store.state.permission.systemConfig
    if (num) {
      return format_number(
        parseFloat(num),
        systemConfig.assets_price_precision,
        systemConfig.assets_price_retention_strategy
      )
    }
    return num
  },

  // 三位分节符转换为数字
  TripartiteReturnNumber: (num) => {
    if (typeof num === 'string') {
      if (num.indexOf(',') !== -1) {
        num = num.replace(/,/g, '')
      }
    }
    return parseFloat(num)
  },
  /**
   * 对请求失败的HTTP状态码做处理
   * @param {Number} code     HTTP状态码
   * @param {String} message  错误提示
   * @return message 返回处理过的提示信息
   */
  requestError: (code, message) => {
    const statusCode = (code + '').replace(/[^0-9]+/g, '') - 0

    switch (statusCode) {
      case 400:
        return 'Bad Request (错误的请求)'
      case 401:
        return 'Unauthorized (请求要求身份验证)'
      case 403:
        return 'Forbidden (服务器拒绝请求)'
      case 404:
        return 'NOT Found (服务器找不到请求的资源)'
      case 405:
        return 'Bad Request (禁用请求中指定的方法)'
      case 406:
        return 'Not Acceptable (无法使用请求的内容特性响应请求的网页)'
      case 407:
        return 'Proxy Authentication Required (需要代理授权)'
      case 408:
        return 'Request Timed-Out (服务器等候请求时发生超时)'
      case 409:
        return 'Conflict (服务器在完成请求时发生冲突。服务器必须在响应中包含有关冲突的信息)'
      case 410:
        return 'Gone (请求的资源已被永久删除)'
      case 411:
        return 'Length Required (服务器不接受不含有效内容长度标头字段的请求)'
      case 412:
        return 'Precondition Failed (未满足前提条件)'
      case 413:
        return 'Request Entity Too Large (请求实体过大)'
      case 414:
        return 'Request, URI Too Large (请求的 URI 过长)'
      case 415:
        return 'Unsupported Media Type (不支持的媒体类型)'
      case 429:
        return '您的操作过于频繁,请稍后重试'
      case 500:
        return 'Internal Server Error (服务器内部错误)'
      case 501:
        return 'Not Implemented (尚未实施)'
      case 502:
        return 'Bad Gateway (错误网关)'
      case 503:
        return 'Server Unavailable (服务不可用)'
      case 504:
        return 'Gateway Timed-Out (网关超时)'
      case 505:
        return 'HTTP Version not supported (HTTP 版本不受支持)'
      default:
        return message
    }
  },
  /**
   * 传入时间戳，转换指定的时间格式
   * @param {Number} val      时间戳
   * @param {String} dateType 要得到的时间格式 例如 YYYY-MM-DD hh:mm:ss
   * @return dataStr 例如 YYYY-MM-DD hh:mm:ss
   */
  switchTime: (val = +new Date(), dateType = 'YYYY-MM-DD hh:mm:ss') => {
    // 将字符串转换成数字
    const timeStamp = +new Date(val)

    // 如果转换成数字出错
    if (!timeStamp) {
      return val
    }
    let str
    // 得到时间字符串
    const dateStr = new Date(timeStamp)
    str = dateType.replace('YYYY', dateStr.getFullYear())
    str = str.replace(
      'MM',
      (dateStr.getMonth() + 1 < 10 ? '0' : '') + (dateStr.getMonth() + 1)
    )
    str = str.replace(
      'DD',
      (dateStr.getDate() < 10 ? '0' : '') + dateStr.getDate()
    )
    str = str.replace(
      'hh',
      (dateStr.getHours() < 10 ? '0' : '') + dateStr.getHours()
    )
    str = str.replace(
      'mm',
      (dateStr.getMinutes() < 10 ? '0' : '') + dateStr.getMinutes()
    )
    str = str.replace(
      'ss',
      (dateStr.getSeconds() < 10 ? '0' : '') + dateStr.getSeconds()
    )

    return str
  },
  /**
   * 时间显示
   */
  timeView: function (val) {
    const now = +new Date() // 当时时间
    const timeStamp = +new Date(val) // 需要处理的时间
    const result = now - timeStamp // 相差的时间戳
    const min = 60 * 1000 // 分钟的毫秒数
    const hour = 60 * 60 * 1000 // 小时的毫秒数
    const day = 60 * 60 * 1000 * 24 // 日的毫秒数
    if (result / min < 1) {
      return '刚刚发布'
    } else if (result / min < 60) {
      return ~~(result / min) + '分钟前'
    } else if (result / hour > 1 && result / hour < 24) {
      return ~~(result / hour) + '小时前'
    } else if (result / day > 1 && result / day < 7) {
      return ~~(result / day) + '天前'
    } else if (
      this.switchTime(now, 'YYYY') === this.switchTime(timeStamp, 'YYYY')
    ) {
      return this.switchTime(timeStamp, 'MM月DD日')
    } else {
      return this.switchTime(timeStamp, 'YYYY年MM月DD日')
    }
  },
  /**
   * a模拟window.open，不会被浏览器拦截
   * @param {String} url        a标签打开的地址
   * @param {String} id         a标签的ID
   * @param {String} targetType a标签点击打开的方式（当前页面打开还是新窗口打开）
   */
  openWindow: (url, targetType = '_blank', id = 'open', download = false) => {
    // 如果存在则删除
    if (document.getElementById(id)) {
      document.body.removeChild(document.getElementById(id))
    }
    const a = document.createElement('a')
    a.setAttribute('href', url)
    if (download) {
      a.setAttribute('download', url)
    }
    a.setAttribute('target', targetType)
    a.setAttribute('id', id)
    document.body.appendChild(a)
    a.click()
  },
  /**
   * 复制
   * @param {String} value 要复制的值
   */
  copyData(value) {
    const inputDom = document.createElement('input')
    inputDom.value = value
    document.body.appendChild(inputDom)
    inputDom.select() // 选择对象
    document.execCommand('Copy') // 执行浏览器复制命令
    document.body.removeChild(inputDom) // 删除DOM
    ElMessage({
      type: 'success',
      duration: 3500,
      message: '复制成功',
      showClose: true,
    })
  },
  /**
   * 将树结构转换为一级列表
   * @param {Array} treeData
   *@return {Array} arr
   */
  treeToList(treeData, arr = []) {
    for (let i = 0; i < treeData.length; i++) {
      const item = treeData[i]
      arr.push(item)
      if (item.children && item.children.length !== 0) {
        this.treeToList(item.children, arr)
      }
    }
    return arr
  },
  /**
   * 将一级的数据结构处理成树状数据结构
   * @param {Object} obj {key, pKey, data}
   *  @param obj.key  字段名称 比如id
   *  @param obj.pKey 父字段名称 比如 pid
   *  @param obj.rootPValue 根节点的父字段的值
   *  @param obj.data 需要处理的数据
   *  @param obj.jsonData 是否深复制数据（默认是true）
   * @return {Array} arr
   */
  getTreeArr: (obj) => {
    if (!Array.isArray(obj.data)) {
      return []
    }
    obj.jsonData = obj.jsonData === false ? obj.jsonData : true
    const arr = obj.jsonData ? JSON.parse(JSON.stringify(obj.data)) : obj.data
    const arr1 = []
    // 将数据处理成数状结构
    arr.forEach((item) => {
      let index = 0
      item.children = []
      arr.forEach((item1) => {
        // 得到树结构关系
        if (item[obj.key] === item1[obj.pKey]) {
          item.children.push(item1)
        }
        // 判断根节点
        if (item1[obj.key] !== item[obj.pKey]) {
          index++
        }
      })
      // 没传入根节点，根据当前数据结构得到根节点
      if (!('rootPValue' in obj) && index === arr.length) {
        arr1.push(item)
      }
    })
    // 传入根节点，根据传入的根节点组成树结构
    if ('rootPValue' in obj) {
      arr.forEach((item) => {
        if (item[obj.pKey] === obj.rootPValue) {
          arr1.push(item)
        }
      })
    }
    return arr1
  },
  /**
   * 数组去重
   * @param {Array} data 要去重的数组
   * @param {String} key 作为去重依据的字段 (处理对象数组时需要传入)
   * @return arr 返回处理后的数据
   */
  handleRepeatArr(data, key) {
    if (!Array.isArray(data)) {
      return
    }
    /** 1.递归去重，缺点，会将数据默认排序 */
    // // 先对数据做排序处理
    // data = data.sort((item, item1) => {
    //   if (key) {
    //     return item[key] - item1[key]
    //   }
    //   return item - item1
    // })
    // // 递归去重
    // function getData (index) {
    //   if (index >= 1) {
    //     // 判断当前数据和下一条数据是否相等
    //     let result = key ? data[index][key] === data[index - 1][key] : data[index] === data[index - 1]
    //     if (result) {
    //       data.splice(index, 1)
    //     }
    //     getData(index - 1)
    //   }
    // }
    // getData(data.length - 1)
    // return data

    /** 2.根据对象的属性不同去重 */
    const arr = []
    const obj = {}
    data.forEach((item, index) => {
      const attr = key ? item[key] : item
      if (!obj[attr]) {
        obj[attr] = index + 1
        arr.push(item)
      }
    })
    return arr

    /** 3.利用indexOf以及forEach (适合处理数组，不适合处理对象数组) */
    // let arr = []
    // data.forEach((item, index) => {
    //   // 如果当前元素在之后没有出现过(后面出现的数据会保留)
    //   // let result = data.indexOf(item, index + 1)
    //   // 如果当前元素在之前没有出现过(前面出现的数据会保留)
    //   let result = index === 0 ? -1 : data.lastIndexOf(item, index - 1)
    //   if (result === -1) {
    //     arr.push(item)
    //   }
    // })
    // return arr

    /** 4.new Set (适合处理数组，不适合处理对象数组) */
    // return [...new Set(data)]

    /** 5. 双层循环去重 （占用内存高） */
    // for (let i = 0, len = data.length; i < len; i++) {
    //   for (let j = i + 1; j < len; j++) {
    //     let result = key ? data[i][key] === data[j][key] : data[i] === data[j]
    //     if (result) {
    //       data.splice(j, 1)
    //       len--
    //       j--
    //     }
    //   }
    // }
    // return data
  },
  /**
   * 查询框字符串，将问号后面字符得到并转换为对象
   * @return {Object}
   */
  getLocationSearch() {
    const str = window.location.search
    const arr = str.substr(1).split('&')
    const obj = {}
    for (const item of arr) {
      const data = item.split('=')
      obj[data[0]] = data[1]
    }
    return obj
  },
  bytesToSize(bytes) {
    if (bytes === 0) return '0 B'
    var k = 1024 // or 1024
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    var i = ~~(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
  },

  getMergeData(data, mergeFiled) {
    const rowUnionData = {}
    const mergeData = {}
    data.forEach((item, index) => {
      let str = item.productId
      if (mergeFiled && mergeFiled.length) {
        mergeFiled.forEach((el) => {
          str = str + '' + item[el]
        })
      }
      if (item.emptyRowType !== '1') {
        if (rowUnionData[str]) {
          rowUnionData[str].indexs.push(index)
        } else {
          rowUnionData[str] = {
            indexs: [index],
          }
        }
      }
    })
    //将reagentId出现多次的行，组装成合并行的参数
    for (let productId in rowUnionData) {
      if (rowUnionData[productId].indexs.length <= 1) {
        // 不需要合并
        continue
      }
      // 组装合并数据
      const mergeConfig = {
        startIndex: rowUnionData[productId].indexs[0],
        rowspan: rowUnionData[productId].indexs.length,
        colspan: 1,
      }
      mergeData[productId] = mergeConfig
    }
    return mergeData
  },

  parseExcel(resp, fileName, str = '.xlsx') {
    //调用成功，在html中创建一个a元素
    let aTag = document.createElement('a')
    //创建一个blob对象
    let blob = new Blob([resp.data], {
      //Excel文件版本
      type: 'multipart/form-data;charset=utf-8', //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    }) // 这个content是下载的文件内容，自己修改
    let temp = resp.headers
      ? resp.headers['content-disposition'].split(';')[1].split('filename=')[1]
      : ''
    // console.log(decodeURIComponent(temp))
    //对文件名乱码转义--【Node.js】使用iconv-lite解决中文乱码
    // let iconv = import('iconv-lite')
    // iconv.skipDecodeWarning = true //忽略警告
    // let _fileName = iconv.decode(temp, 'utf-8')
    let _fileName = temp ? decodeURIComponent(temp) : ''
    if (_fileName) {
      let arr = _fileName.split('.')
      str = `.${arr[1]}`
    }
    let newFileName = fileName
    if(fileName){
      if(!fileName.includes('.')){
        newFileName = fileName + str
      }
    }
    aTag.download = fileName ? newFileName : _fileName
    aTag.href = window.URL.createObjectURL(blob) //创建一个URL对象
    document.body.appendChild(aTag)
    aTag.click()
    document.body.removeChild(aTag)
    window.URL.revokeObjectURL(blob) //释放URL对象
  },

  isEmptyString(value) {
    if (
      value == null ||
      typeof value === 'undefined' ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return true
    } else {
      return false
    }
  },

  isNotEmptyString(value) {
    if (
      value == null ||
      typeof value === 'undefined' ||
      value.trim() === '' ||
      value.length > 200
    ) {
      return false
    } else {
      return true
    }
  },
  maxString200(value) {
    if (value && value.length > 200) {
      return false
    } else {
      return true
    }
  },
  stringRequiredMax200(value) {
    if (!value || (value && value.length > 200)) {
      return false
    } else {
      return true
    }
  },
  isGreaterThan200(value) {
    if (value.length > 200) {
      return false
    } else {
      return true
    }
  },

  //封装验证函数
  checkForm(formRefs) {
    const resultArr = formRefs.map(async (formRef) => {
      if (formRef) {
        let result = await new Promise(function (resolve, reject) {
          formRef.validate((valid, obj) => {
            console.log(valid)
            console.log(obj)
            console.log('表单是否生成-1项')
            if (valid) {
              resolve()
            } else {
              reject()
            }
          })
        })
        return result
      }
    })
    if (resultArr.length === formRefs.length) {
      return Promise.all(resultArr)
    }
  },

  // 设置日期范围选择器-当月第1天-最后1天(YYYY-MM-DD)
  setCurrentMonthDateRange() {
    let arr = [];
    const date = new Date();
    date.setDate(1); // 将日期设置为1，即当月的第一天
    arr[0] = date.toISOString().split("T")[0]; // 转换为 YYYY-MM-DD 格式
    const endDate = new Date();
    // endDate.setMonth(endDate.getMonth() + 1, 0); // 设置下个月的第一天的前一天，即当前月的最后一天
    arr[1] = endDate.toISOString().split("T")[0];
    return arr
  },

  // 时间选择器快捷查询键
  pickerOptionsFn() {
    return [
      {
        text: '最近一周',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          return [start, end]
        },
      },
      {
        text: '最近一个月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          return [start, end]
        },
      },
      {
        text: '最近三个月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          return [start, end]
        },
      },
      {
        text: '最近半年',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
          return [start, end]
        },
      },
      {
        text: '最近一年',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
          return [start, end]
        },
      },
    ]
  },
  // 日期选择器快捷查询键
  pickerDateOptionsFn() {
    return {
      shortcuts: [
        {
          text: '最近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          },
        },
        {
          text: '最近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          },
        },
        {
          text: '最近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          },
        },
      ],
      disabledDate(time) {
        return time.getTime() > new Date() - 3600 * 1000 * 24
      },
    }
  },
  //日期选择器快捷查询键,不包含当前一天
  pickerDateOptionsNoCurDateFn() {
    return {
      shortcuts: [
        {
          text: '最近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 8)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
        {
          text: '最近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 31)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
        {
          text: '最近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 91)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
      ],
      disabledDate(time) {
        return time.getTime() > new Date() - 3600 * 1000 * 24
      },
    }
  },

  //数组分组,arr需要分组的数组,str按那个字段分组,type分组字段类型
  setGrouping(arr, str, type) {
    let mp = {}
    let ret = []
    arr.forEach((item) => {
      if (typeof mp[item[str]] === type) {
        ret[mp[item[str]]].push(item)
      } else {
        mp[item[str]] = ret.length
        ret.push([item])
      }
    })
    return ret
  },
  setTrim(str) {
    //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, '')
  },
  setTrimObj(obj, key) {
    //删除左右两端的空格
    if (key === 'queryMap' && Object.keys(obj).length) {
      for (let item in obj) {
        let val = obj[item].value
        if (Object.prototype.toString.call(val) == '[object String]') {
          obj[item].value = val.replace(/(^\s*)|(\s*$)/g, '')
        }
      }
    }
    return obj
  },
  isString(str) {
    //判断字符串类型
    return Object.prototype.toString.call(str) == '[object String]'
  },
  deepClone(x) {
    // 深拷贝
    let root = cloneDeep(x)
    return root
  },
  throttle(fn, data, delay) {
    const now = new Date().getTime()
    if (now - lastCall < delay) {
      clearTimeout(timer)
    }
    lastCall = now
    timer = setTimeout(() => {
      lastCall = now
      fn(data)
    }, delay)
  },
  delEmptyAttribute(query, arr = []) {
    //删除空属性 arr不需要清空的对象
    for (const key in query) {
      if (!query[key] && query[key] !== 0) {
        if (arr.length) {
          if (!arr.includes(key)) {
            delete query[key]
          }
        } else {
          delete query[key]
        }
      }
    }
    return query
  },
  dateDiff(sDate1, sDate2) {
    let aDate, oDate1, oDate2, iDays
    oDate1 = new Date(sDate1)
    oDate2 = sDate2 ? new Date(sDate2) : new Date()
    aDate = Date.parse(oDate2) - Date.parse(oDate1)
    iDays = parseFloat((aDate / (1000 * 60 * 60 * 24)).toFixed(2))
    return iDays
  },
  dateDiffLicen(sDate1, sDate2) {
    //两个日期相差的天数，日期格式2020-01-01
    let aDate, oDate1, oDate2, iDays
    aDate = sDate1.split('-')
    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) //转换为12-18-2002格式
    if (!sDate2) {
      oDate2 = new Date()
    } else {
      aDate = sDate2.split('-')
      oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
    }
    iDays = parseInt(
      (Date.parse(oDate1) - Date.parse(oDate2)) / 1000 / 60 / 60 / 24
    )
    return iDays
  },
  //解决精度+
  accAdd(a, b) {
    return accAddFn(a, b)
  },
  //解决精度-
  Subtr(arg1, arg2) {
    return SubtrFn(arg1, arg2)
  },
  //解决精度 *
  accMul(arg1, arg2) {
    return accMulFn(arg1, arg2)
  },
  //解决精度 /
  accDiv(arg1, arg2) {
    return accDivFn(arg1, arg2)
  },
  getSort(arr, str, level = 'asc') {
    //表格列排序
    return sortList(arr, str, level)
  },
  //设置表格列 str排序字段，level升将序控制
  /*
   *componentType: input input输入框
   *componentType: number 数字输入框
   * componentType: price 价格
   * componentType: date 日期输入框
   * componentType: dateTime 日期时间输入框
   * componentType: select-model 字典输入框
   * componentType: select-data-custom 通用选择弹框（selectDataType: 'user' 选择人员）
   * componentType: datetimerange 日期区间选择
   * componentType: slip-select api查询下拉选择
   * code: 字典
   * asValue: value映射
   * 普通查询用插槽: slot:true
   */
  setSearchList(
    searchList,
    obj,
    isDateSplit = true,
    str = 'searchLevel',
    level = 'asc'
  ) {
    let queryMap = {}
    let keysArr = Object.keys(obj)
    let arr = []
    let list = searchList.filter((item) => {
      let newValue = item.asValue ? item.asValue : item.value
      if (keysArr.length && keysArr.includes(item.value)) {
        item.show = obj[item.value].searchLevel > 0 && !item.permission
        item.searchLevel = obj[item.value].searchLevel
        item.label = obj[item.value].label
        let searchDefaultValue = obj[item.value].searchDefaultValue
        if (
          isJSON(obj[item.value].searchDefaultValue) &&
          searchDefaultValue.indexOf('{') > -1
        ) {
          searchDefaultValue = JSON.parse(obj[item.value].searchDefaultValue)
        }
        item.searchDefaultValue = searchDefaultValue
        if (
          obj[item.value].queryType === 'IN' ||
          obj[item.value].queryType === 'NOT_IN' ||
          obj[item.value].queryType === 'BETWEEN'
        ) {
          if (
            item.componentType === 'select-model' ||
            item.componentType === 'slip-select'
          ) {
            item.multiple = true
          }
        }
        if (!isDateSplit) {
          if (keysArr.length && keysArr.includes(item.value)) {
            if (
              obj[item.value].fieldType === 'LocalDateTime' &&
              obj[item.value].queryType === 'BETWEEN'
            ) {
              item.componentType = 'datetimerange'
              item.fieldType === 'LocalDateTime'
              item.isPreferenceShow = true
              item.isPreferenceControl = true
              item.isDateSplit = isDateSplit
            } else if (
              obj[item.value].fieldType === 'LocalDate' &&
              obj[item.value].queryType === 'BETWEEN'
            ) {
              item.componentType = 'daterange'
              item.fieldType === 'LocalDate'
              item.queryType === 'BETWEEN'
              item.isPreferenceShow = true
              item.isPreferenceControl = true
              item.isDateSplit = isDateSplit
            }
          }
        }
        let type = Object.prototype.toString.call(searchDefaultValue)
        let tempValue =
          type === '[object Object]'
            ? searchDefaultValue.key && searchDefaultValue.key.length
              ? searchDefaultValue.key.toString()
              : ''
            : searchDefaultValue || ''
        if (obj[item.value] && obj[item.value]['searchLevel'] < 1) {
          tempValue = ''
        }
        if (item.asValue && obj[item.asValue] && obj[item.asValue].queryType) {
          queryMap[newValue] = {
            queryType: obj[item.asValue].queryType,
            value: tempValue,
          }
        } else {
          queryMap[newValue] = {
            queryType: obj[item.value].queryType,
            value: tempValue,
          }
        }
        if (isDateSplit) {
          if (
            obj[item.value].fieldType === 'LocalDateTime' &&
            obj[item.value].queryType === 'BETWEEN'
          ) {
            let dateArr = splitArrFn(item.searchDefaultValue)
            if (dateArr && dateArr.length) {
              item.searchDefaultValueGreater = dateArr[0] || ''
              item.searchDefaultValueLesser = dateArr[1] || ''
            } else {
              item.searchDefaultValueGreater = ''
              item.searchDefaultValueLesser = ''
            }
            item.isDateSplit = isDateSplit
            item.show = false
            item.isPreferenceShow = true
            item.isPreferenceControl = true
            let first = item.value + 'Greater'
            let last = item.value + 'Lesser'
            queryMap[first] = {
              queryType: obj[item.value].queryType,
              value: dateArr && dateArr.length ? dateArr[0] || '' : '',
            }
            queryMap[last] = {
              queryType: obj[item.value].queryType,
              value: dateArr && dateArr.length ? dateArr[1] || '' : '',
            }
            if (obj[item.value] && obj[item.value]['searchLevel'] < 1) {
              queryMap[first] = {
                queryType: obj[item.value].queryType,
                value: '',
              }
              queryMap[last] = {
                queryType: obj[item.value].queryType,
                value: '',
              }
            }
            queryMap[item.value] = {
              queryType: obj[item.value].queryType,
              value: '',
            }
            let options = {
              [first]: {
                label: '开始' + obj[item.value].label,
                value: first,
                componentType: 'dateTime',
                hidden: true,
                show: obj[item.value].searchLevel > 0 && !item.permission,
                searchLevel: obj[item.value].searchLevel,
                defaultTime: new Date(2000, 1, 1, 0, 0, 0),
                isPreferenceShow: false,
                isPreferenceControl: true,
              },
              [last]: {
                label: '结束' + obj[item.value].label,
                value: last,
                componentType: 'dateTime',
                hidden: true,
                show: obj[item.value].searchLevel > 0 && !item.permission,
                searchLevel: obj[item.value].searchLevel,
                defaultTime: new Date(2000, 1, 1, 23, 59, 59),
                isPreferenceShow: false,
                isPreferenceControl: true,
              },
            }
            arr.push(options[first], options[last])
          } else if (
            obj[item.value].fieldType === 'LocalDate' &&
            obj[item.value].queryType === 'BETWEEN'
          ) {
            let dateArr = splitArrFn(item.searchDefaultValue)
            if (dateArr && dateArr.length) {
              item.searchDefaultValueGreater = dateArr[0] || ''
              item.searchDefaultValueLesser = dateArr[1] || ''
            } else {
              item.searchDefaultValueGreater = ''
              item.searchDefaultValueLesser = ''
            }
            item.isDateSplit = isDateSplit
            item.show = false
            item.isPreferenceShow = true
            item.isPreferenceControl = true
            let first = item.value + 'Greater'
            let last = item.value + 'Lesser'
            queryMap[first] = {
              queryType: obj[item.value].queryType,
              value: dateArr && dateArr.length ? dateArr[0] || '' : '',
            }
            queryMap[last] = {
              queryType: obj[item.value].queryType,
              value: dateArr && dateArr.length ? dateArr[1] || '' : '',
            }
            if (obj[item.value] && obj[item.value]['searchLevel'] < 1) {
              queryMap[first] = {
                queryType: obj[item.value].queryType,
                value: '',
              }
              queryMap[last] = {
                queryType: obj[item.value].queryType,
                value: '',
              }
            }
            queryMap[item.value] = {
              queryType: obj[item.value].queryType,
              value: '',
            }
            let options = {
              [first]: {
                label: obj[item.value].label + '开始',
                value: first,
                componentType: 'date',
                hidden: true,
                isPreferenceShow: false,
                isPreferenceControl: true,
                show: obj[item.value].searchLevel > 0 && !item.permission,
                searchLevel: obj[item.value].searchLevel,
              },
              [last]: {
                label: obj[item.value].label + '结束',
                value: last,
                componentType: 'date',
                hidden: true,
                isPreferenceShow: false,
                isPreferenceControl: true,
                show: obj[item.value].searchLevel > 0 && !item.permission,
                searchLevel: obj[item.value].searchLevel,
              },
            }
            arr.push(options[first], options[last])
          }
        }

        return item
      }
    })

    let allList = list
    if (arr && arr.length && isDateSplit) {
      allList = list.concat(arr)
    }
    return {
      searchList: sortList(allList, str, level),
      queryMap: queryMap,
    }
  },
  //设置表格列 str排序字段，level升将序控制, isGroup是否返回分组option
  setFieldList(
    fieldList,
    obj,
    isGroup = false,
    str = 'showLevel',
    level = 'asc'
  ) {
    let groupSelectInfoOptions = []
    let keysArr = Object.keys(obj)
    let list = []
    if (fieldList && fieldList.filter.length) {
      list = fieldList.filter((item) => {
        let newValue = item.asValue ? item.asValue : item.value
        if (keysArr.length && keysArr.includes(item.value)) {
          item.hidden = !(
            obj[item.value].isBack === '0' &&
            obj[item.value].showLevel > 0 &&
            !item.permission
          )
          item.label = obj[item.value].label
          item.showLevel = obj[item.value].showLevel
          item.sortable = obj[item.value].sortControllerType > 0
          item.sortControllerType = obj[item.value].sortControllerType
          item.sortLevel = obj[item.value].sortLevel
          item.groupLevel = obj[item.value].groupLevel
          item.minWidth = obj[item.value].formWidth
          if (item.width) {
            item.width = ''
          }
          if (
            obj[item.value].fieldType === 'LocalDateTime' ||
            obj[item.value].fieldType === 'LocalDate' ||
            obj[item.value].fieldType === 'LocalTime'
          ) {
            item.fieldType = obj[item.value].fieldType
          }
          if (
            isGroup &&
            obj[item.value].isBack === '0' &&
            obj[item.value].showLevel > 0 &&
            obj[item.value].groupLevel > 0
          ) {
            groupSelectInfoOptions.push({
              label: obj[item.value].label,
              value: item.value + '-' + newValue,
              groupLevel: item.groupLevel,
            })
          }
          return item
        }
      })
    }
    if (isGroup) {
      return {
        fieldList: sortList(list, str, level),
        groupOption: sortList(groupSelectInfoOptions, 'groupLevel'),
      }
    } else {
      return sortList(list, str, level)
    }
  },
  //sort后端排序逻辑
  sortChange(column, sortArr, separate = '-') {
    if (column.order === 'descending') {
      let columnProp = column.prop
      let str = `${columnProp}${separate}desc`
      if (sortArr.length) {
        let index = sortArr.findIndex((item) => item.includes(columnProp))
        if (index !== -1) {
          if (!sortArr[index].includes('desc')) {
            sortArr[index] = str
          }
        } else {
          sortArr.push(str)
        }
      } else {
        sortArr.push(str)
      }
    } else if (column.order === 'ascending') {
      let columnProp = column.prop
      let str = `${columnProp}${separate}asc`
      if (sortArr.length) {
        let index = sortArr.findIndex((item) => item.includes(columnProp))
        if (index !== -1) {
          if (!sortArr[index].includes('asc')) {
            sortArr[index] = str
          }
        } else {
          sortArr.push(str)
        }
      } else {
        sortArr.push(str)
      }
    } else {
      let columnProp = column.prop
      if (sortArr.length) {
        let index = sortArr.findIndex((item) => item.includes(columnProp))
        if (index !== -1) {
          sortArr.splice(index, 1)
        }
      }
    }
    return sortArr
  },
  splitArr(str, splitStr = ',') {
    return splitArrFn(str, splitStr)
  },
  getHumpToHyphen(str, splitStr = '_') {
    ////将驼峰转下划线小写
    return humpToHyphen(str, splitStr)
  },
  generateProductKey(products) {
    //设置key,唯一标识
    products = products.constructor === Array ? products : [products]
    return products.map((item) => {
      const key =
        item.depotStockId +
        '&' +
        item.productId +
        '&' +
        item.batchNumber +
        '&' +
        item.validityDate +
        '&' +
        item.productionDate +
        '&' +
        item.price +
        '&' +
        item.qrCode +
        '&' +
        item.uniqueCode +
        '&' +
        item.factorySubCode +
        '&' +
        item.factoryMainCode
      item.key = key
      return item
    })
  },
  async confirmRes(
    str = '扫到其他产品, 将切换数据，是否要保存当前操作数据?',
    confirmText,
    cancelText
  ) {
    //个体操作弹窗切换提示
    let confirmRes = ''
    await ElMessageBox.confirm(str, '提示', {
      confirmButtonText: confirmText ? confirmText : '确定',
      cancelButtonText: cancelText ? cancelText : '取消',
      type: 'warning',
    })
      .then(() => {
        confirmRes = 'confirm'
      })
      .catch(() => {
        confirmRes = ''
      })
    return confirmRes
  },
  getPrintTemp(data) {
    //获取打印模板数据
    let obj = cloneDeep(data)
    let params = {
      title: obj.name,
      width: obj.width,
      height: obj.height,
      pageWidth: obj.pageWidth,
      pageHeight: obj.pageHeight,
      horizontally: obj.horizontally,
      tempItems: JSON.parse(obj.templateContent),
    }
    return params
  },
  getUid() {
    return new Date().getTime() + (1 + Math.random())
  },
  initLayout(proxy, data) {
    const { loading } = data
    loading.value = true
    const iframe = document.querySelector('#iframe')
    // 处理兼容行问题
    if (iframe.attachEvent) {
      iframe.attachEvent('onload', function () {
        // iframe加载完毕以后执行操作
        loading.value = false
      })
    } else {
      iframe.onload = function () {
        // iframe加载完毕以后执行操作
        loading.value = false
      }
    }
  },
  // 合并表格方法
  spanMethod(list, keys, row, col) {
    // 注意: keys字段列表要按表格排列的顺序排列,如果后续字段不再需要进行行合并,可以省略后面的字段,如果中间某字段要跳过合并,要用空字符串顶位
    if (col >= keys.length || !keys[col]) {
      // 根据传入的字段列表,判断不需要合并的列
      return [1, 1]
    } else {
      //使用try-catch,如果方法错误返回错误信息
      try {
        let _keys = keys.slice(0, col + 1) //截取需要用到判断的字段名
        // 判断是否从本行开始合并
        let merge = _keys.some((item) => {
          if (row == 0) {
            return true
          }
          if (item) {
            // 置空操作是为防止当数据返回为 '',undefined,null时也需要进行合并
            if (!list[row][item] && list[row][item] !== 0) {
              list[row][item] = ''
            }
            if (!list[row - 1][item] && list[row - 1][item] !== 0) {
              list[row - 1][item] = ''
            }
          }
          // 如果当前行所需要判断合并的字段中有一个跟前一条数据不一样,本条数据即为合并的起点,第一条数据直接为合并起点
          return list[row][item] != list[row - 1][item]
        })
        // 如果本条数据是合并起点,获取需要合并的数据条数
        if (merge) {
          let _list = list.slice(row) //截取从本条数据开始的列表
          // 获取合并行数
          let _lineNum = _list.findIndex((item, ind) => {
            //同merge判断,找到合并的终点
            return (
              ind &&
              _keys.some((ele) => {
                if (ele) {
                  // 置空操作是为防止当数据返回为 '',undefined,null时也需要进行合并
                  if (!item[ele] && item[ele] !== 0) {
                    item[ele] = ''
                  }
                  if (!_list[0][ele] && _list[0][ele] !== 0) {
                    _list[0][ele] = ''
                  }
                }
                return item[ele] != _list[0][ele]
              })
            )
          })
          // 合并行数为-1时,输出_list的长度,否则输出_lineNum
          return [_lineNum === -1 ? _list.length : _lineNum, 1]
        } else {
          // 否则,返回[0,0],即本条数据被合并
          return [0, 0]
        }
      } catch (err) {
        // 打印报错
        console.error('spanMethodFunc error:', err)
      }
    }
  },
  // 设置不同分辨率table表格每列宽度
  setFieldListColWidth(fieldList, bigWidth, smallWidth) {
    let pixelWidth = window.screen.width * window.devicePixelRatio || 1920
    let keyWidthObj = {}
    if (pixelWidth < 1400) {
      keyWidthObj = smallWidth
    } else {
      keyWidthObj = bigWidth
    }
    fieldList.forEach((item) => {
      if (keyWidthObj[item.value]) {
        item.minWidth = keyWidthObj[item.value]
        item.width = ''
      }
    })
  },
  getSubsysAndUrl(){
    let routeStore = JSON.parse(localStorage.getItem('routeStore'))
    return {
      systemCode: routeStore.curRoute?.parentMicroName || -2,
      systemName: routeStore.curRoute?.parentMicroNameValue ? encodeURIComponent(routeStore.curRoute?.parentMicroNameValue) : '',
      routeCode: routeStore.curRoute?.path ? encodeURIComponent(routeStore.curRoute?.path) : '',
    }
  },
  getControl(code) {
    let tempBool = false
    let allControl = store.state.permission.allControl
    let seting = sessionStorage.getItem('setting')
    if (seting) {
      seting = JSON.parse(seting)
    }
    allControl.some((item) => {
      if (
        item.dataType === code &&
        item.controlType === '2' &&
        item.orgVOList &&
        item.orgVOList.length
      ) {
        let ids = item.orgVOList.map((item) => item.organizationId)
        if (ids.includes(seting?.hospitalId)) {
          tempBool = true
        }
      }
    })
    return tempBool
  },
  isCurrentOrg(row) {
    let tempBool = false
    let setting = sessionStorage.getItem('setting') || {}
    if (setting) {
      setting = JSON.parse(setting)
    }
    if(row.createGroupId === setting.groupId && row.createOrgId === setting.orgId) {
      tempBool = true
    }
    return tempBool
  },
  isCurrentOrgBatch(data) {
    let tempBool = true
    if(!data || !data.length) {
      tempBool = false
      return tempBool
    }
    data.some(item => {
      if(!this.isCurrentOrg(item)) {
        tempBool = false
      }
    })
    return tempBool
  },
  setForm(
    obj,
    code,
    isEdit = false,
    isCreateOrg = '',
    dataSourceType,
    list = ['fieldList'],
    rulesList = ['rules'],
    formData = 'data'
  ) {
    let _isEdit = isEdit || !!obj[formData]?.id
    let _isCreateOrg = isCreateOrg || obj[formData]?.isCreateOrg || '0'
    let _dataSourceType = dataSourceType || obj[formData]?.dataSourceType || ''
    //obj fromInfo数据，code 业务管控标识，isEdit 新增或修改，isCreateOrg 是否当前组织创建，dataSourceType 当前业务数据的管控模式，list fieldList集合
    let allControl = store.state.permission.allControl
    let seting = sessionStorage.getItem('setting')
    if (seting) {
      seting = JSON.parse(seting)
    }
    let controlItem = allControl.find(
      (item) =>
        item.dataType === code &&
        item.controlType === '2' &&
        item.fieldVOList &&
        item.fieldVOList.length
    )
    let retrunObj = {}
    rulesList.map((item) => {
      retrunObj[item] = obj[item]
    })
    list.map((item) => {
      retrunObj[item] = obj[item]
      obj[item].map((el) => {
        let arr = [
          'input',
          'textarea',
          'password',
          'input_number',
          'number',
          'money',
        ]
        rulesList.map((row) => {
          if (!(retrunObj[row][el.value] && retrunObj[row][el.value].length)) {
            if (arr.includes(el.type)) {
              retrunObj[row][el.value] = [
                {
                  required: false,
                  message: `请输入${el.label}`,
                  trigger: 'blur',
                },
              ]
            } else {
              retrunObj[row][el.value] = [
                {
                  required: false,
                  message: `请选择${el.label}`,
                  trigger: 'change',
                },
              ]
            }
          }
        })
      })
    })
    if (controlItem && Object.keys(controlItem).length) {
      list.map((item) => {
        if (controlItem.orgVOList && controlItem.orgVOList.length) {
          if (
            _isEdit &&
            (obj[formData]?.orgId !== obj[formData]?.createOrgId  ||
            obj[formData]?.groupId !== obj[formData]?.createGroupId)
          ) {
            //是否创建组织
            retrunObj[item].map((el) => {
              controlItem.fieldVOList.map((row) => {
                if (el.value === row.fieldCode) {
                  el.disabled = row.isEditAfter === '0'
                  if (el.type === 'slot') {
                    el.type = row.isEditAfter === '0' ? 'input' : el.type
                    if (el.asValue && row.isEditAfter === '0') {
                      el.value = el.asValue
                    }
                  }
                }
              })
            })
          }
        }
      })
      rulesList.map((rulesRow) => {
        let rulesKeys = Object.keys(retrunObj[rulesRow])
        rulesKeys.map((item) => {
          if (controlItem.orgVOList && controlItem.orgVOList.length) {
            let ids = controlItem.orgVOList.map((el) => el.organizationId)
            if (!_isEdit) {
              if (ids.includes(seting?.hospitalId)) {
                controlItem.fieldVOList.map((row) => {
                  if (item === row.fieldCode) {
                    retrunObj[rulesRow][item].map((el) => {
                      el.required = row.isNecessaryBefore === '1'
                    })
                  }
                })
              }
            } else {
              if (
                _dataSourceType === '2' &&
                ids.includes(seting?.hospitalId) &&
                _isCreateOrg === '1'
              ) {
                console.log(controlItem.fieldVOList)
                controlItem.fieldVOList.map((row) => {
                  if (item === row.fieldCode) {
                    retrunObj[rulesRow][item].map((el) => {
                      el.required = row.isNecessaryBefore === '1'
                    })
                  }
                })
              }
            }
          }
        })
      })
      return retrunObj
    } else {
      return retrunObj
    }
  },
  getIsOtherOrg() {
    const _query = getQueryParams()
    if(_query.businessOrgId && _query.businessGroupId) {
      return true
    } else {
      return false
    }
  }
}

// 数字 -> 千分位
export function verifyNumberComma(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(num)) return "";
  const parts = num.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}


function getQueryParams() {
  const params = new URLSearchParams(window.parent.location.search)
  return Object.fromEntries(params.entries())
}
//解决精度+
function accAddFn(a, b) {
  return parseFloat(add(bignumber(a), bignumber(b)))
}
//解决精度-
function SubtrFn(arg1, arg2) {
  return parseFloat(subtract(bignumber(arg1), bignumber(arg2)))
}
//解决精度 *
function accMulFn(arg1, arg2) {
  return parseFloat(multiply(bignumber(arg1), bignumber(arg2)))
}
//解决精度 /
function accDivFn(arg1, arg2) {
  return parseFloat(divide(bignumber(arg1), bignumber(arg2)))
}
function humpToHyphen(str = '', splitStr = '_') {
  //将驼峰转下划线小写
  if (str == '') {
    // 字符串是空的
    return 'str is empty'
  }
  if (typeof str.toLowerCase() !== 'string') {
    //必须是字符串类型，其他的都不要
    return 'incorrect character type'
  }
  //其他条件暂时不添加限制了，比如大驼峰先转换成小驼峰再处理，只能是字符串和下划线，等等其他，自行添加

  let reg = new RegExp('[A-Z]', 'g')

  return str.replace(reg, function (match, offset, ss) {
    //match 匹配到的字符，offset 偏移量-下标，ss 原字符
    return splitStr + match.toLowerCase()
  })
}

function format_number(num, len, type) {
  //num数字，len保留精度，type保留策略
  len = len > 0 && len <= 20 ? len : 2
  let result = cloneDeep(parseFloat(num))
  if (type == 1) {
    //ceil进一
    if (result < 0) {
      result = -ceil(Math.abs(result), len)
    } else {
      result = ceil(result, len)
    }
  } else if (type == 0) {
    //floor取整
    result = floor(result, len)
  } else if (type == 2) {
    //round四舍五入
    result = round(result, len)
  }
  return result
}

function sortList(arr, str, level = 'asc') {
  let obj = arr.sort((a, b) => {
    if (level === 'asc') {
      return a[str] - b[str]
    } else {
      return b[str] - a[str]
    }
  })
  return obj
}

function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj == 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}
function splitArrFn(str, splitStr = ',') {
  //字符串转数组
  if (!str) {
    return []
  }
  str = str.toString()
  if (str.indexOf(splitStr) !== -1) {
    return str.split(splitStr)
  } else {
    return [str]
  }
}
