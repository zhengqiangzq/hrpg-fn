import utils from '@/common/js/utils' // 公共方法
import validate from '@/common/js/validate' // 公共验证方法
import store from '@/store'
import print from '@/common/js/print' //打印
import fieldfList from '@/common/js/fieldfList' //展示列

export default {
  install(app, options) {
    app.config.globalProperties.$fn = utils
    app.config.globalProperties.$validate = validate
    app.config.globalProperties.$print = print
    app.config.globalProperties.$fieldfList = fieldfList
    app.config.globalProperties.$getBtnControl = (code) => {
      let tempBool = false
      let allControl = store.state.permission.allControl
      let seting = sessionStorage.getItem('setting')
      if (seting) {
        seting = JSON.parse(seting)
      }
      allControl.some((item) => {
        if (item.dataType === code && item.controlType === '1') {
          tempBool = true
        } else if (
          item.dataType === code &&
          (item.controlType === '2' ||
            item.controlType === '3' ||
            item.controlType === '4')
        ) {
          if (item.orgVOList && item.orgVOList.length) {
            let ids = item.orgVOList.map((item) => item.organizationId)
            if (ids.includes(seting?.hospitalId)) {
              tempBool = true
            }
          }
          if (
            item.createPrivateDataControl === '1' ||
            item.createBelowDataControl === '1'
          ) {
            tempBool = true
          }
        }
      })
      return tempBool
    }
    app.config.globalProperties.$permission = (
      code,
      list = store.state.permission.permissionCodes
    ) => {
      if (list) {
        return list.indexOf(code) > -1
      }
    }
    app.config.globalProperties.validSe = function (value) {
         // 基础Unicode表情（含肤色修饰）
      const unicodeEmoji = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu;
      // 组合表情（含零宽连接符）
      const compositeEmoji = /[\uD83C-\uDBFF][\uDC00-\uDFFF][\u200D\uFE0F]?/g;
      // 常见字符表情（需转义特殊字符）
      // const textEmoji = /(?:[:;=][\'\"\-]?[\)\(DPpdOo\/\\\|]|<3|\([\'\"]?[\)\|\\\/][\'\"\)]?)/g;
      return String(value)
        .replace(unicodeEmoji,'')
        .replace(compositeEmoji,'')
        // .replace(textEmoji, '')
        ?.trim()
    }
    app.directive('enterNumber', {
      //禁止输入中文和小数点
      inserted(el) {
        el.addEventListener('keypress', function (e) {
          e = e || window.event
          let charcode = typeof e.charCode === 'number' ? e.charCode : e.keyCode
          let re = /\d/
          if (
            !re.test(String.fromCharCode(charcode)) &&
            charcode > 9 &&
            !e.ctrlKey
          ) {
            if (e.preventDefault) {
              e.preventDefault()
            } else {
              e.returnValue = false
            }
          }
        })
      },
    })
    app.directive('focus', {
      inserted(el, binding, vnode) {
        // 聚焦元素
        el.querySelector('input').focus()
      },
    })
  },
}
