<template>
  <PageDialog
    v-show="setting.visible"
    :title="setting.title"
    v-model:visible="setting.visible"
    :width="setting.width"
    :bt-loading="setting.btLoading"
    :bt-list="setting.btList"
  >
    <div class="asset-msg">
      <div class="asset-msg-label">
        <i class="el-icon-warning"></i>{{ setting.msg }}：
      </div>
      <el-radio-group v-model="setting.flag">
        <el-radio :label="true">当前页数据</el-radio>
        <el-radio :label="false">全部页数据</el-radio>
      </el-radio-group>
    </div>
  </PageDialog>
</template>
<script setup name="excelOrPrintDialog">
import { fatchTemplateByCode } from '@/api/base'
const { proxy } = getCurrentInstance()
const props = defineProps({
  excelPrint: {
    type: Object,
    default: () => {
      return {}
    },
  },
})

//导出提示相关配置
const setting = ref({
  visible: false,
  title: '提示',
  btLoading: false,
  type: 'print',
  msg: '',
  width: '400px',
  flag: true,
  btList: [
    {
      label: '打印',
      type: 'primary',
      event: print,
      show: true,
    },
    { label: '取消', event: close, show: true },
  ],
})
watch(
  () => props.excelPrint,
  (val) => {
    //打印
    if (val && val.type === 'print') {
      setting.value.visible = true
      setting.value.type = 'print'
      setting.value.msg = '请选择数据打印范围'
      setting.value.btList[1].label = '打印'
      setting.value.flag = true
    }
    if (val && val.type === 'excel') {
      //导出
      setting.value.visible = true
      setting.value.type = 'excel'
      setting.value.msg = '请选择数据导出范围'
      setting.value.btList[1].label = '确定'
      setting.value.flag = true
    }
  },
  {
    deep: true,
  }
)

function close() {
  setting.value.visible = false
}
//打印或导出
function print() {
  if (setting.value.type === 'print') {
    printList()
  }
  if (setting.value.type === 'excel') {
    exportExcelList()
  }
  setting.value.visible = false
  setting.value.msg = ''
}
function printList() {
  fatchTemplateByCode(props.excelPrint.print.fatchTemplateByCode, props.excelPrint.print.btnCode).then(
    (res) => {
      if (res && res.success) {
        let temp = proxy.$fn.getPrintTemp(res.data[0])
        getPrintData(temp, setting.value.flag)
      }
    }
  )
}
function getPrintData(temp) {
  const Api = props.excelPrint.print.api
  let params = {
    ...props.excelPrint.print.params,
    page: setting.value.flag,
  }
  Api(params, props.excelPrint.btnCode).then((res) => {
    if (res.success && res) {
      let data = proxy.$fn.deepClone(res.data)
      let newData = data.map((item) => {
        return {
          ...item,
          ...item.orderInfo,
        }
      })
      props.excelPrint.print.fatchTemplateByCode.$lodopPermission
        ? proxy.$lodop.preview(
            temp,
            newData,
            !proxy.$permission(
              props.excelPrint.print.fatchTemplateByCode.resourceCode
            )
          )
        : proxy.$lodop.preview(temp, newData)
    }
  })
}
function exportExcelList() {
  const Api = props.excelPrint.excel.api
  let params = {
    ...props.excelPrint.excel.params,
    page: setting.value.flag,
  }
  Api(params, props.excelPrint.btnCode).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}
</script>
