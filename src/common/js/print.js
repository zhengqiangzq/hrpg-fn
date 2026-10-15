import { ElMessage } from 'element-plus'
import { getLodop } from '@/assets/js/LodopFuncs.js'
import BACKIMG from '@/assets/image/back-img.png'
import OUTIMG from '@/assets/image/out-img.png'
import PUTIMG from '@/assets/image/put-img.png'

export default {
  /*批量打印条码/二维码*/
  buildRenderBarCode: function (barCodeList, printIndex) {
    let LODOP = getLodop()
    //每批打印数量
    let patchNum = 20

    for (let j = 0; j < barCodeList.length / patchNum; j++) {
      LODOP.PRINT_INIT('printBarCode')
      if (barCodeList != '') {
        for (let i = patchNum * j; i < patchNum * (j + 1); i++) {
          if (i >= barCodeList.length) {
            break
          }
          let printInfo = barCodeList[i]
          let width = printInfo.width
          let height = printInfo.height
          //设置是否旋转打印
          if (height > width) {
            // intOrient = 2;
          }
          var defaultPrintWay = printInfo.qrCodeRule
          let itemArr = Object.entries(printInfo)
          for (let i = 0; i < itemArr.length; i++) {
            let value = itemArr[i][1]
            if (itemArr[i][0] === 'price') {
              value = value ? value.toFixed(3) : ''
            }
            defaultPrintWay = defaultPrintWay.replace(itemArr[i][0], value)
          }
          let temp = defaultPrintWay.split(';')
          temp.shift()
          defaultPrintWay = temp.join(';')
          LODOP.NewPageA()
          try {
            new Function(defaultPrintWay)()
          } catch (e) {
            console.error(e)
          }
          // eval(defaultPrintWay)
        }
      }
      LODOP.SET_PRINT_MODE('CUSTOM_TASK_NAME', 'printBarCode' + j)
      if (printIndex || printIndex === 0) {
        LODOP.SET_PRINTER_INDEX(printIndex) //指定打印机
      }
      LODOP.PRINT()
    }
  },
  printOrder: function (data, pageSize = false) {
    const content = getPrintOrderContent(data)
    //调用getLodop获取LODOP对象
    let LODOP = getLodop()
    LODOP.PRINT_INIT('printOrder')
    LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1)
    if (pageSize === 'Horizontal') {
      LODOP.SET_PRINT_PAGESIZE(2, 2100, 2960, '')
    } else if (pageSize === 'Mini') {
      LODOP.SET_PRINT_PAGESIZE(1, 2790, 920, 'LodopCustomPage')
    } else {
      LODOP.SET_PRINT_PAGESIZE(0, 0, 0, '')
    }
    LODOP.ADD_PRINT_TABLE(
      '15mm',
      '5mm',
      'RightMargin:5mm',
      'BottomMargin:10mm',
      content
    )
    LODOP.ADD_PRINT_HTM(
      '97%',
      '46%',
      '90%',
      '5mm',
      "<body style='font-size: 10px'>第<font tdata='PageNO' color='black'>##</font>页 / 共<font tdata='PageCount'  color='black'>##</font>页</body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLE('Alignment', 3)
    LODOP.ADD_PRINT_TEXT(15, 0, 'RightMargin:5mm', 30, data.orgName)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    if (data.barCode) {
      LODOP.ADD_PRINT_BARCODE(15, 20, 140, 45, '128Auto', data.barCode)
      LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    }
    if (data.qrCode) {
      LODOP.ADD_PRINT_BARCODE(10, 20, 106, 106, 'QRCode', data.qrCode)
      LODOP.SET_PRINT_STYLEA(0, 'QRCodeVersion', 7)
    }
    LODOP.PREVIEW()
  },
  printScrapOrder: function (data, pageSize = false) {
    // const content = getPrintOrderContent(data);
    // //调用getLodop获取LODOP对象
    // let LODOP = getLodop()
    // LODOP.PRINT_INIT("printOrder");
    // LODOP.SET_SHOW_MODE("LANDSCAPE_DEFROTATED", 1);
    // if (pageSize === "Horizontal") {
    //   LODOP.SET_PRINT_PAGESIZE(2, 2100, 2970, "");
    // } else if (pageSize === "Mini") {
    //   LODOP.SET_PRINT_PAGESIZE(1, 2410, 920, "LodopCustomPage");
    // } else {
    //   LODOP.SET_PRINT_PAGESIZE(0, 0, 0, "");
    // }
    // LODOP.ADD_PRINT_TABLE("5mm", "5mm", "RightMargin:5mm", "BottomMargin:10mm", content);
    // LODOP.ADD_PRINT_HTM("97%", "46%", "90%", "5mm", "<body style='font-size: 10px'>第<font tdata='PageNO' color='black'>##</font>页 / 共<font tdata='PageCount'  color='black'>##</font>页</body>");
    // LODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
    // LODOP.SET_PRINT_STYLE("Alignment", 3);
    // LODOP.ADD_PRINT_TEXT(15, 0, "RightMargin:5mm", 30, data.orgName);
    // LODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
    // if (data.barCode) {
    //   LODOP.ADD_PRINT_BARCODE(15, 20, 140, 45, "128Auto", data.barCode);
    //   LODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
    // }
    // LODOP.PREVIEW();

    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 204mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(14, 201, 401, 15, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 50, 350, 15, '申请部门:' + data.main.deptName)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 250, 275, 15, '报废时间:' + data.main.scrapTime)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 450, 175, 15, '单据号:' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '80mm', content)
    // LODOP.ADD_PRINT_TEXTA("date", "110mm", 525, 175, 15, "登记时间：" + data.main.storageTime);
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_HTM(
      '110mm',
      670,
      175,
      15,
      "<body>p<font tdata='PageNO'  color='blue'>#</font> / <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      '110mm',
      5,
      670,
      15,
      '院长：        分管院领导：          采购办：          卫材供应中心：         库管员：        制单人：           '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    // LODOP.ADD_PRINT_TEXT("120mm", 13, 296, 15, "价税合计(大写)：");
    // LODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
    // LODOP.ADD_PRINT_TEXT("120mm", 392, 296, 15, "(小写)");
    // LODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
    LODOP.ADD_PRINT_LINE('115mm', 0, '115mm', 800, 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    // LODOP.ADD_PRINT_IMAGE(0, 10, 104, 70, '<img src="/static/img/put-img.1b9eee3c.png">');
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.PREVIEW()
  },

  designRule: function (data, width, height) {
    return new Promise((resolve, reject) => {
      let LODOP = getLodop()
      try {
        new Function(data)()
      } catch (e) {
        console.error(e)
      }
      // eval(data)
      if (LODOP.CVERSION) {
        CLODOP.On_Return = function (TaskID, Value) {
          resolve(Value)
        }
      }
      // LODOP.ADD_PRINT_RECT(0, 0, width + 'mm', height + 'mm', 0, 1);
      LODOP.SET_SHOW_MODE('HIDE_PBUTTIN_SETUP', 1)
      LODOP.PRINT_DESIGN()
    })
  },
  printReceivingCheckOrder: function (data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCutCahngeLine() + renderReceivingCheckOrderData(data, '')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('printOrder')
    LODOP.SET_PRINT_PAGESIZE(2, 2100, 2970, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)

    LODOP.ADD_PRINT_TEXT(24, 380, 394, 35, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 17)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)

    LODOP.ADD_PRINT_TEXT(24, 800, 200, 35, data.main.type)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)

    LODOP.ADD_PRINT_TABLE(50, 5, '285mm', '180mm', content)
    LODOP.ADD_PRINT_HTM(
      '193mm',
      180,
      112,
      '5mm',
      "<body>第<font tdata='PageNO'  color='blue'> #  </font> 页/共 <font tdata='PageCount'  color='blue'> #  </font>     页</body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLEA(0, 'Horient', 2)
    LODOP.PREVIEW()
  },
  printInOrder: function (data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 203mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(14, 201, 401, 15, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 100, 350, 15, '供应商:' + data.main.supplier)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 400, 175, 15, '发票号:' + data.main.invoiceNumber)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 580, 175, 15, '单据号:' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '80mm', content)
    LODOP.ADD_PRINT_TEXTA(
      'date',
      '110mm',
      525,
      175,
      15,
      '登记时间：' + data.main.storageTime
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_HTM(
      '110mm',
      670,
      175,
      15,
      "<body>p<font tdata='PageNO'  color='blue'>#</font> / <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      '110mm',
      5,
      470,
      15,
      '分管领导：        采购：          卫材中心：          验收：         制单：        '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT('120mm', 13, 296, 15, '价税合计(大写)：')
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT('120mm', 392, 296, 15, '(小写)')
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_LINE('115mm', 0, '115mm', 800, 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_IMAGE(
      0,
      10,
      104,
      70,
      '<img src="/static/img/put-img.1b9eee3c.png">'
    )
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.PREVIEW()
  },
  printReceivingOrder: function (data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 203mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(14, 201, 401, 15, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      49,
      100,
      350,
      15,
      '供应商:' + (data.main.supplier || '')
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      49,
      400,
      175,
      15,
      '发票号:' + (data.main.invoiceNumber || '')
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      49,
      580,
      175,
      15,
      '单据号:' + (data.main.orderNo || '')
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '80mm', content)
    LODOP.ADD_PRINT_TEXTA(
      'date',
      '110mm',
      525,
      175,
      15,
      '登记时间：' + (data.main.storageTime || '')
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_HTM(
      '110mm',
      670,
      175,
      15,
      "<body>p<font tdata='PageNO'  color='blue'>#</font> / <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      '110mm',
      5,
      480,
      15,
      '分管领导：        采购办：          卫材中心：          验收：         制单：        '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_IMAGE(
      0,
      10,
      104,
      70,
      '<img src="/static/img/put-img.1b9eee3c.png">'
    )
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.PREVIEW()
  },
  printRecipt: function (data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut30() + renderReceivingCheckOrderData(data, 'width: 190mm')
    //调用getLodop获取LODOP对象
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(14, 201, 401, 15, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(50, 20, 200, 15, '部门：' + data.main.dept)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(70, 20, 200, 15, '汇总时间：' + data.main.time)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(50, 354, 365, 15, '来货单位：' + data.main.orgName)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(80, 20, '241mm', '40mm', content)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      '112.84mm',
      44,
      991,
      15,
      ' 分管院领导：                 采购办：                卫材供应中心：     '
    )
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_IMAGE(
      0,
      664,
      100,
      60,
      '<img src="/static/img/put-img.1b9eee3c.png">'
    )
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.ADD_PRINT_TEXT(70, 354, 200, 15, '单据数量：')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.PREVIEW()
  },
  printCheckPriceOrder: function (data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 203mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(14, 201, 401, 15, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 10, 350, 15, '供应商:' + data.main.supplier)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      49,
      300,
      320,
      15,
      '消耗时间:' + data.main.consumeTimeRange
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 620, 175, 15, '单据号:' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '80mm', content)
    LODOP.ADD_PRINT_TEXTA(
      'date',
      '110mm',
      475,
      175,
      15,
      '验价时间：' + data.main.checkPriceTime
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_HTM(
      '110mm',
      670,
      175,
      15,
      "<body>p<font tdata='PageNO'  color='blue'>#</font> / <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      '110mm',
      5,
      470,
      15,
      '分管领导：          验价：' +
        data.main.checkPriceUser +
        '           制单： '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT('120mm', 13, 296, 15, '价税合计(大写)：')
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT('120mm', 392, 296, 15, '(小写)')
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_LINE('115mm', 0, '115mm', 800, 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.PREVIEW()
  },
  // 领用出库
  printOutOrder(data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 203mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(14, 201, 401, 15, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 16, 200, 15, '领用部门：' + data.main.dept)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 260, 175, 15, '领用时间：' + data.main.time)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 480, 175, 15, '单据号：' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '90mm', content)
    LODOP.ADD_PRINT_HTM(
      '120mm',
      602,
      127,
      15,
      "<body>p<font tdata='PageNO'  color='blue'>#</font>/ <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      '120mm',
      5,
      530,
      15,
      '制单：' +
        data.main.createUser +
        '                 库管：' +
        data.main.opreatBy +
        '                         领物人：     '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_IMAGE(
      0,
      664,
      100,
      60,
      '<img src="/static/img/out-img.a94ea05c.png">'
    )
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.PREVIEW()
  },
  // 领用入库
  printUseInOrder(data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 203mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(14, 201, 401, 15, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 16, 200, 15, '领用部门：' + data.main.dept)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 260, 175, 15, '领用时间：' + data.main.time)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 480, 175, 15, '单据号：' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '90mm', content)
    LODOP.ADD_PRINT_HTM(
      '120mm',
      602,
      127,
      15,
      "<body>p<font tdata='PageNO'  color='blue'>#</font>/ <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      '120mm',
      5,
      530,
      15,
      '制单：' +
        data.main.user +
        '                 库管：' +
        data.main.user +
        '                         领物人：     '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_IMAGE(
      0,
      664,
      100,
      60,
      '<img src="/static/img/put-img.1b9eee3c.png">'
    )
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.PREVIEW()
  },
  printReturnOrder(data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 203mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(14, 201, 401, 15, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 5, 175, 15, '供应商:' + data.main.supplier)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 180, 175, 15, '出库类别：退货出库')
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 355, 175, 15, '日期:' + data.main.date)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 530, 155, 15, '单据号' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '90mm', content)
    //LODOP.ADD_PRINT_TEXTA("date","120mm",537,175,15,"打印时间:"+data.main.time);
    //LODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
    LODOP.ADD_PRINT_HTM(
      '120mm',
      719,
      174,
      '5mm',
      "<body>p<font tdata='PageNO'  color='blue'>#</font> / <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      '120mm',
      5,
      530,
      15,
      '收货人：                 制单人：                  库管：           '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_IMAGE(1, 680, 104, 70, renderTitleImg('退'))
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.PREVIEW()
  },
  // 领用退回出库单
  printUseReturnOutOrder(data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 203mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(16, 109, 401, 15, '宣汉县人民医院领用退回出库单')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 16, 200, 15, '退回部门：' + data.main.dept)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 260, 175, 15, '退回时间：' + data.main.time)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 480, 175, 15, '单据号：' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '90mm', content)
    LODOP.ADD_PRINT_TEXT(
      '120mm',
      5,
      530,
      15,
      '制单：' +
        data.main.user +
        '                 库管：' +
        data.main.user +
        '                         退回人：     '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_HTM(
      '120mm',
      665,
      175,
      15,
      "<body>p<font tdata='PageNO'  color='blue'>#</font> / <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_IMAGE(
      0,
      664,
      100,
      60,
      '<img src="/static/img/out-img.a94ea05c.png">'
    )
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.PREVIEW()
  },
  // 领用退回入库单
  printUseReturnOrder(data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() + renderReceivingCheckOrderData(data, 'width: 203mm')
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(1, 2410, 1400, 'LodopCustomPage')
    LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1)
    LODOP.ADD_PRINT_RECT(0, 0, '241mm', '140mm', 0, 1)
    LODOP.SET_PRINT_STYLEA(0, 'PreviewOnly', 1)
    LODOP.ADD_PRINT_TEXT(16, 109, 401, 15, '宣汉县人民医院领用退回入库单')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 16, 200, 15, '退回部门：' + data.main.dept)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 260, 175, 15, '退回时间：' + data.main.time)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(49, 480, 175, 15, '单据号：' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(60, 0, '241mm', '90mm', content)
    LODOP.ADD_PRINT_TEXT(
      '120mm',
      5,
      530,
      15,
      '制单：' +
        data.main.user +
        '                 库管：' +
        data.main.user +
        '                         退回人：     '
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_HTM(
      '120mm',
      665,
      175,
      15,
      "<body>p<font tdata='PageNO'  color='blue'>#</font> / <font tdata='PageCount'  color='blue'>#</font></body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_IMAGE(
      0,
      664,
      100,
      60,
      '<img src="/static/img/put-img.1b9eee3c.png">'
    )
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
    LODOP.PREVIEW()
  },
  // 申购单采购单打印
  printPurchOrder(data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCutCahngeLine() +
      `<table style="border-collapse:collapse;">
            <thead>
              <tr>
                <th style="height: 15px;border: none" colspan="${
                  data.titles.length
                }"></th>
              </tr>
              <tr>
              ${data.titles
                .map(
                  (title) => `
                   <th class="titles" style="width:${title.width}%;text-align: ${title.align};">${title.title}</th>
              `
                )
                .join('')}
              </tr>
            </thead>
            <tbody>
                ${data.details
                  .map(
                    (rows) => `
                    <tr>${rows
                      .map(
                        (row) =>
                          `<td style="text-align: ${row.align}">${row.value}</td>`
                      )
                      .join('')}</tr>
                `
                  )
                  .join('')}
            </tbody>
            ${sum(data)}
            <tr>
                <td colspan="3" rowspan="3">相关部门审核：</td>
                <td colspan="4">卫生材料供应中心负责人审核：</td>
                <td colspan="5"></td>
            </tr>
            <tr>
                <td colspan="4">采购办办事员复核：</td>
                <td colspan="5"></td>
            </tr>
            <tr>
                <td colspan="4">采购办负责人审核：</td>
                <td colspan="5"></td>
            </tr>
            <tr>
                <td colspan="3" rowspan="3">院领导审批意见：</td>
                <td colspan="4">分管卫材院领导签字：</td>
                <td colspan="5"></td>
            </tr>
            <tr>
                <td colspan="4">分管采购院领导签字：</td>
                <td colspan="5"></td>
            </tr>
            <tr>
                <td colspan="4">院长签字：</td>
                <td colspan="5"></td>
            </tr>
         </table>
        `
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(2, 2100, 2970, '')
    LODOP.ADD_PRINT_TEXT(15, 240, 500, 30, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLEA(0, 'Horient', 2)
    LODOP.ADD_PRINT_TEXT(70, 160, 270, 15, '申请部门:' + data.main.dept)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(70, 470, 270, 15, '申请时间:' + data.main.time)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(70, 770, 270, 15, '申请单号:' + data.main.orderNo)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(85, 5, '275mm', '163mm', content)
    LODOP.ADD_PRINT_HTM(
      '195mm',
      480,
      112,
      '5mm',
      "<body>第<font tdata='PageNO'  color='blue'>#</font>页 / 共<font tdata='PageCount'  color='blue'>#</font>页</body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.PREVIEW()
  },
  printSurgicalSummary(data) {
    buildDataSpecific(data)
    let content =
      styleSpecific() +
      `<table style="border-collapse:collapse;">
            <thead>
              <tr>
                <th style="height: 15px;border: none" colspan="${
                  data.titles.length
                }"></th>
              </tr>
              <tr>
              ${data.titles
                .map(
                  (title) => `
                   <th class="titles" style="width:${title.width}%;text-align: ${title.align};">${title.title}</th>
              `
                )
                .join('')}
              </tr>
            </thead>
            <tbody>
                ${data.details
                  .map(
                    (rows) => `
                    <tr>${rows
                      .map(
                        (row) =>
                          `<td style="text-align: ${row.align}">${row.value}</td>`
                      )
                      .join('')}</tr>
                `
                  )
                  .join('')}
            </tbody>
            ${sum(data)}
            <tr>
                <td colspan="2" rowspan="2">相关部门审核：</td>
                <td colspan="3">采购办价格审核人签字：</td>
                <td colspan="6"></td>
            </tr>
            <tr>
                <td colspan="3">采购办负责人签字：</td>
                <td colspan="6"></td>
            </tr>
            <tr>
                <td colspan="2" rowspan="3">院领导审批意见：</td>
                <td colspan="3">分管行政院领导签字：</td>
                <td colspan="6"></td>
            </tr>
            <tr>
                <td colspan="3">分管卫材院领导签字：</td>
                <td colspan="6"></td>
            </tr>
            <tr>
                <td colspan="3">院长签字：</td>
                <td colspan="6"></td>
            </tr>
         </table>
        `
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(2, 2100, 2970, '')
    LODOP.ADD_PRINT_TEXT(15, 240, 500, 30, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLEA(0, 'Horient', 2)
    LODOP.ADD_PRINT_TEXT(
      70,
      260,
      270,
      15,
      '开始时间:' + data.main.consumeTimeGreater
    )
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TEXT(
      70,
      670,
      270,
      15,
      '结束时间:' + data.main.consumeTimeGreater
    )
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(85, 5, '275mm', '163mm', content)
    LODOP.ADD_PRINT_HTM(
      '195mm',
      480,
      112,
      '5mm',
      "<body>第<font tdata='PageNO'  color='blue'>#</font>页 / 共<font tdata='PageCount'  color='blue'>#</font>页</body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.PREVIEW()
  },
  printSurgicalStockQuery(data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() +
      `<table style="border-collapse:collapse;">
            <thead>
              <tr>
                <th style="height: 15px;border: none" colspan="${
                  data.titles.length
                }"></th>
              </tr>
              <tr>
              ${data.titles
                .map(
                  (title) => `
                   <th class="titles" style="width:${title.width}%;text-align: ${title.align};">${title.title}</th>
              `
                )
                .join('')}
              </tr>
            </thead>
            <tbody>
                ${data.details
                  .map(
                    (rows) => `
                    <tr>${rows
                      .map(
                        (row) =>
                          `<td style="text-align: ${row.align}">${row.value}</td>`
                      )
                      .join('')}</tr>
                `
                  )
                  .join('')}
            </tbody>
            ${sum(data)}
         </table>
        `
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(2, 2100, 2970, '')
    LODOP.ADD_PRINT_TEXT(15, 240, 500, 30, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLEA(0, 'Horient', 2)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(85, 5, '275mm', '163mm', content)
    LODOP.ADD_PRINT_HTM(
      '195mm',
      480,
      112,
      '5mm',
      "<body>第<font tdata='PageNO'  color='blue'>#</font>页 / 共<font tdata='PageCount'  color='blue'>#</font>页</body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.PREVIEW()
  },
  printDataQuery(data) {
    buildDataSpecific(data)
    let content =
      styleSpecificCut() +
      `<table style="border-collapse:collapse;">
            <thead>
              <tr>
                <th style="height: 15px;border: none" colspan="${
                  data.titles.length
                }"></th>
              </tr>
              <tr>
              ${data.titles
                .map(
                  (title) => `
                   <th class="titles" style="width:${title.width}%;text-align: ${title.align};">${title.title}</th>
              `
                )
                .join('')}
              </tr>
            </thead>
            <tbody>
                ${data.details
                  .map(
                    (rows) => `
                    <tr>${rows
                      .map(
                        (row) =>
                          `<td style="text-align: ${row.align}">${row.value}</td>`
                      )
                      .join('')}</tr>
                `
                  )
                  .join('')}
            </tbody>
            ${sum(data)}
         </table>
        `
    let LODOP = getLodop()
    LODOP.PRINT_INIT('init')
    LODOP.SET_PRINT_PAGESIZE(2, 2100, 2970, '')
    LODOP.ADD_PRINT_TEXT(15, 240, 500, 30, data.title)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLEA(0, 'Horient', 2)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.ADD_PRINT_TABLE(85, 5, '275mm', '163mm', content)
    LODOP.ADD_PRINT_HTM(
      '195mm',
      480,
      112,
      '5mm',
      "<body>第<font tdata='PageNO'  color='blue'>#</font>页 / 共<font tdata='PageCount'  color='blue'>#</font>页</body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.PREVIEW()
  },
  printInventory: function (data, pageSize = false) {
    buildDataSpecific(data)
    const content = styleSpecificCut() + renderReceivingCheckOrderData(data)
    //调用getLodop获取LODOP对象
    let LODOP = getLodop()
    LODOP.PRINT_INIT('printOrder')
    LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1)
    if (pageSize) {
      LODOP.SET_PRINT_PAGESIZE(2, 2100, 2970, '')
    } else {
      LODOP.SET_PRINT_PAGESIZE(0, 0, 0, '')
    }
    LODOP.ADD_PRINT_TABLE(
      '10mm',
      '10mm',
      'RightMargin:5mm',
      'BottomMargin:10mm',
      content
    )
    LODOP.ADD_PRINT_HTM(
      '97%',
      '46%',
      '90%',
      '5mm',
      "<body style='font-size: 10px'>第<font tdata='PageNO' color='black'>##</font>页 / 共<font tdata='PageCount'  color='black'>##</font>页</body>"
    )
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    LODOP.SET_PRINT_STYLE('Alignment', 3)
    LODOP.ADD_PRINT_TEXT(16, 200, 401, 15, '宣汉县人民医院盘点表')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 15)
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)

    if (data.barCode) {
      LODOP.ADD_PRINT_BARCODE(15, 20, 140, 45, '128Auto', data.barCode)
      LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
    }
    LODOP.PREVIEW()
  },
  printGeneralTemplate: function (info, template, detailList) {
    if (template) {
      let LODOP = getLodop()
      let printer = window.localStorage.getItem('printer_a4') || -1
      if (printer != -1) {
        LODOP.SET_PRINTER_INDEX(printer)
      }

      let val = [
        {
          ...info,
          itemList: detailList,
        },
      ]
      let flag = false

      for (let i = 0; i < val.length; i++) {
        let printcontent = ''
        let mouldContent = template
          .substring(template.indexOf('\n') + 1)
          .replace(/"LinkedItem",1/g, '"LinkedItem",-1')
        let content = mouldContent
        let startIndex = content.indexOf('<for>') + 3
        let endIndex = content.indexOf('</for>')
        let firstContent = content.substring(0, startIndex)
        let forContent = content.substring(startIndex, endIndex) //循环使用
        let LastContent = content.substring(endIndex, content.length)

        let fContent = firstContent
        let lContent = LastContent
        for (let items in val[i]) {
          fContent = fContent.replace('{{' + items + '}}', val[i][items])
          lContent = lContent.replace('{{' + items + '}}', val[i][items])
        }
        printcontent += fContent
        let forchangeContent = ''

        for (let [index, itemProject] of val[i].itemList.entries()) {
          let itemProjectContent = forContent
          itemProjectContent = itemProjectContent.replace(
            '{{sortNo}}',
            index + 1
          )
          for (let item in itemProject) {
            itemProjectContent = itemProjectContent.replace(
              '{{' + item + '}}',
              itemProject[item] || ''
            )
          }
          forchangeContent += itemProjectContent
        }

        printcontent += forchangeContent
        printcontent += lContent
        printcontent = printcontent.replace(/\{\{.*?\}\}/g, '')
        try {
          new Function(printcontent)()
        } catch (e) {
          console.error(e)
        }
        // eval(printcontent)
        LODOP.NewPage()
      }
      if (flag) {
        LODOP.PRINT()
      } else {
        LODOP.PREVIEW()
      }
    } else {
      ElMessage.$message.error('此报告单元未设置打印模板')
    }
  },
}

function buildDataSpecific(data) {
  const titles = data.titles
  data.details = []
  data.rows.forEach((row) => {
    const detail = []
    row.forEach((value, index) => {
      detail.push({
        value: value,
        align: titles[index].align,
      })
    })
    data.details.push(detail)
  })
}

function renderReceivingCheckOrderData(data, str) {
  return `<table style="border-collapse:collapse;${str}">
            <thead>
              <tr>
                <th style="height: 15px;border: none" colspan="${
                  data.titles.length
                }"></th>
              </tr>
              <tr>
              ${data.titles
                .map(
                  (title) => `
                   <th class="titles" style="width:${title.width}%;text-align: ${title.align};">${title.title}</th>
              `
                )
                .join('')}
              </tr>
            </thead>
            <tbody>
                ${data.details
                  .map(
                    (rows) => `
                    <tr>${rows
                      .map(
                        (row) =>
                          `<td style="text-align: ${row.align}">${row.value}</td>`
                      )
                      .join('')}</tr>
                `
                  )
                  .join('')}
            </tbody>
            ${sum(data)}
         </table>
        `
}

function styleSpecificCut() {
  return `
                <style>
                    table {
                        border-collapse:collapse;
                        width: 100%;
                    }
                    td , tfoot th{
                        border: 1px solid black;
                        line-height: 25px;
                        height: 20px;
                        font-family: "宋体";
                        font-size: 13px;
                        white-space: nowrap;
                        overflow: hidden;
                        max-width: 30mm;
                    }
                    .titles{
                           font-weight: bold;
                        font-family: "宋体";
                        font-size: 13px;
                        height: 20px;
                        border: 1px solid black;
                        width:100%;
                    }

                </style>
            `
}

function styleSpecificCut30() {
  return `
                <style>
                    table {
                        border-collapse:collapse;
                        width: 100%;
                    }
                    td , tfoot th{
                        border: 1px solid black;
                        line-height: 25px;
                        height: 30px;
                        font-family: "宋体";
                        font-size: 13px;
                        white-space: nowrap;
                        overflow: hidden;
                        max-width: 30mm;
                    }
                    .titles{
                           font-weight: bold;
                        font-family: "宋体";
                        font-size: 13px;
                        height: 20px;
                        border: 1px solid black;
                        width:100%;
                    }

                </style>
            `
}

function styleSpecificCutCahngeLine() {
  return `
                <style>
                    table {
                        border-collapse:collapse;
                        width: 100%;
                    }
                    td , tfoot th{
                        border: 1px solid black;
                        line-height: 25px;
                        height: 20px;
                        font-family: "宋体";
                        font-size: 13px;

                    }
                    .titles{
                        font-weight: bold;
                        font-family: "宋体";
                        font-size: 13px;
                        height: 20px;
                        border: 1px solid black;
                        width:100%;
                    }

                </style>
            `
}

function styleSpecific() {
  return `
                <style>
                    table {
                        border-collapse:collapse;
                        width: 100%;
                    }
                    td , tfoot th{
                        border: 1px solid black;
                        line-height: 25px;
                        height: 26px;
                        font-family: "宋体";
                        white-space: nowrap;
                        overflow: hidden;
                        font-size: 13px;
                    }
                    .titles{
                        font-weight: bold;
                        font-family: "宋体";
                        font-size: 13px;
                        height: 26px;
                        border: 1px solid black;
                    }

                </style>
            `
}

/**
 * 打印样式
 * @returns {string}
 */
function style() {
  return `
                <style>
                    table {
                        border-collapse:collapse;
                        width: 100%;
                    }
                    td , tfoot th{
                        border: 1px solid black;
                        line-height: 25px;
                        height: 26px;
                        white-space: nowrap;
                        overflow: hidden;
                        font-size: 12px;
                    }
                    .titles{
                        font-weight: bold;
                        font-size: 14px;
                        height: 26px;
                        border: 1px solid black;
                    }
                    .title {
                        height: 50px;
                        font-size: 20px;
                        vertical-align: top;
                    }
                    .main {
                        text-align: left;
                        margin-left: 20px;
                        height: 26px;
                        font-weight: normal;
                        font-size: 14px;
                    }
                    .sign td {
                        border: none;
                        font-size: 16px;
                        font-weight: bold;
                    }
                </style>
            `
}

/**
 * 获取打印类容
 * @param data
 * @returns {string}
 */
function getPrintOrderContent(data) {
  buildData(data)
  return style() + renderData(data)
}

/**
 * 装载数据
 * @param data
 * @returns {string}
 */
function renderData(data) {
  return `<table style="border-collapse:collapse;">
            <thead>
              <tr>
                <th class="title" colspan="${data.titles.length}">${
    data.title
  }${renderTitleImg(data.title)}</th>
              </tr>
              ${getMain(data.mainData)}
              <tr>
                <th style="height: 15px;border: none" colspan="${
                  data.titles.length
                }"></th>
              </tr>
              <tr>
              ${data.titles
                .map(
                  (title) => `
                   <th class="titles" style="width:${title.width}%;text-align: ${title.align};">${title.title}</th>
              `
                )
                .join('')}
              </tr>
            </thead>
            <tbody>
                ${data.details
                  .map(
                    (rows) => `
                    <tr>${rows
                      .map(
                        (row) =>
                          `<td style="text-align: ${row.align}">${row.value}</td>`
                      )
                      .join('')}</tr>
                `
                  )
                  .join('')}
                ${sum(data)}
                ${sign(data)}
            </tbody>
         </table>
        `
}

function renderTitleImg(str) {
  if (str.indexOf('入') != -1) {
    return `<img src="${PUTIMG}" style="position: absolute;right:0;top: 40px">`
  } else if (str.indexOf('出') != -1) {
    return `<img src="${OUTIMG}" style="position: absolute;right:0;top: 40px">`
  } else if (str.indexOf('退') != -1) {
    return `<img src="${BACKIMG}" style="position: absolute;right:0;top: 40px">`
  } else {
    return ''
  }
}

/**
 * 获取主表类容
 * @param data
 * @returns {string}
 */
function getMain(data) {
  let msg = ''
  for (let i = 0; i < data.length; i += 2) {
    const pre = data[i]
    if (i + 1 === data.length) {
      msg += `<tr><th class="main" colspan="${pre.colspan}">${pre.value}</th></tr>`
      break
    }
    const next = data[i + 1]
    msg += `<tr><th class="main" colspan="${pre.colspan}">${pre.value}</th><th class="main" colspan="${next.colspan}">${next.value}</th></tr>`
  }
  return msg
}

/**
 * 构建打印数据
 * @param data
 */
function buildData(data) {
  const main = data.main
  const titles = data.titles
  const titleLength = titles.length

  data.mainData = []
  if (main) {
    Object.keys(main).forEach((key, index) => {
      let colspan = ~~(titleLength / 2)
      if (index % 2 !== 0) {
        colspan = Math.ceil(titleLength / 2)
      }
      data.mainData.push({
        value: `${key}：${main[key]}`,
        colspan: colspan,
      })
    })
  }
  data.details = []
  data.rows.forEach((row) => {
    const detail = []
    row.forEach((value, index) => {
      detail.push({
        value: value,
        align: titles[index].align,
      })
    })
    data.details.push(detail)
  })
}

/**
 * 处理合计项
 * @param data
 * @returns {string}
 */
function sum(data) {
  if (data.sum && data.sum.length) {
    return `<tr>
              ${data.titles
                .map((value, index) => {
                  if (index === 0) {
                    return `<td align="center">合计</td>`
                  }
                  if (data.sum.includes(index)) {
                    return `<td align="right" tdata="Sum" format="#,##0.00">
                  <font color="black">######</font></td>`
                  } else {
                    return `<td></td>`
                  }
                })
                .join('')}
          </tr>`
  }
  return ''
}

/**
 * 处理签字栏
 * @param data
 */
function sign(data) {
  const sign = data.sign
  const titles = data.titles
  if (sign && sign.length) {
    const colspan = ~~(titles.length / sign.length)
    return `<tr class="sign">
                ${sign
                  .map((value) => `<td colspan="${colspan}">${value}：</td>`)
                  .join('')}
            </tr>`
  }
  return ''
}
