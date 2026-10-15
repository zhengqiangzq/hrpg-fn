<template>
  <div v-show="showDialog" class="app-container-flex">
    <div class="width100">
      <div class="titleTab" v-add-first-filter-class>
        <div class="tab otherTab" @click="closeDetailList">列表页</div>
        <div class="tab currentTab">明细页</div>
      </div>
      <!-- 条件栏 -->
      <div class="filter-wrapper first-filter-wrapper">
        <NewPageFilter
          v-model:query="filterInfo.query"
          :filter-btn="filterInfo.searchBtn"
          :filter-list="filterInfo.searchList"
          :clear-type="clearType"
        >
        </NewPageFilter>
      </div>
      <div class="filter-wrapper">
        <NewPageFilter :filter-btn="filterInfo.btnList">
          <template v-slot:filter-excel>
            <el-button @click="exportExcel()">导出 </el-button>
          </template>
        </NewPageFilter>
      </div>

      <table-container
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurpage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        :query="filterInfo.query"
        :check-box="false"
        :tab-index="true"
        :pager="false"
        row-key="id"
        :field-list="tableInfo.fieldList"
        @handleEvent="handleEvent"
        @pageInfo="pageInfo"
        :btnCode="'parallelAccountRule:detailList'"
      >
      </table-container>
    </div>
    <page-dialog
      v-show="dialogInfo.visible"
      :title="dialogInfo.title"
      v-model:visible="dialogInfo.visible"
      :width="dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
    >
      <div class="asset-msg">
        <div class="asset-msg-label">
          <i class="el-icon-warning"></i>{{ dialogInfo.msg }}：
        </div>
        <el-radio-group v-model="dialogInfo.flag">
          <el-radio :label="true">当前页数据</el-radio>
          <el-radio :label="false">全部页数据</el-radio>
        </el-radio-group>
      </div>
    </page-dialog>
  </div>
</template>
<script setup>
import {
  parallelAccountRuleDetailList,
  parallelAccountRuleExcel,
} from '@/api/rulesAndInitial/parallelAccountRule'
import { watch } from 'vue'
const { proxy } = getCurrentInstance()
const emit = defineEmits()
const props = defineProps(['visible'])
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
//导出提示相关配置
const dialogInfo = ref({
  visible: false,
  title: '提示',
  btLoading: false,
  type: '',
  msg: '',
  width: '400px',
  flag: true,
  btList: [
    { label: '取消', event: handleClose, show: true },
    {
      label: '打印',
      type: 'primary',
      event: checkConfirm,
      show: true,
    },
  ],
})
const filterInfo = ref({
  sortArr: [],
  copyQuery: {},
  query: { sort: 'create_time desc' },
  searchList: [
    {
      label: '核算账簿',
      value: 'accbookName',
      asValue: 'accbookId',
      componentType: 'select-data-custom',
      selectDataType: 'accountingBook',
      required: true,
    },
    {
      label: '规则编码',
      value: 'code',
      componentType: 'input',
      event: search,
    },
    {
      label: '规则名称',
      value: 'name',
      componentType: 'input',
      event: search,
    },
    {
      label: '来源科目',
      value: 'sourceAccasoaName',
      asValue: 'sourceAccasoaOriginalId',
      componentType: 'select-data-custom',
      selectDataType: 'Account',
      query: {},
    },
    {
      label: '目的科目',
      value: 'targetAccasoaName',
      asValue: 'targetAccasoaOriginalId',
      componentType: 'select-data-custom',
      selectDataType: 'Account',
      query: {},
    },
  ],
  searchBtn: [
    { type: 'button', label: '查询', event: search },
    { type: 'button', label: '重置', event: clearSearch },
  ],
  btnList: [
    {
      value: 'excel',
      type: 'slot',
      show: proxy.$permission('parallelAccountRule:export'),
    },
  ],
})

// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  data: [],
  selections: [],
  fieldList: [
    { label: '核算账簿', value: 'accbookName' },
    { label: '规则编码', value: 'code' },
    { label: '规则名称', value: 'name' },
    { label: '规则类型', value: 'typeValue' },
    { label: '来源科目', value: 'sourceAccasoaName' },
    { label: '来源辅助核算', value: 'sourceAssValue' },
    { label: '来源方向', value: 'sourceDirection' },
    { label: '目的科目', value: 'targetAccasoaName' },
    { label: '目的辅助核算', value: 'targetAssValue' },
    { label: '目的方向', value: 'targetDirectionValue' },
  ],
})
const page = ref({
  curPage: 1, // 当前页
  pageSize: 20, // 每页条数
})
const clearType = ref(true)
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue) // 更新父组件visible
  },
})
watch(
  () => filterInfo.value.query.accbookId,
  (val) => {
    if (val) {
      filterInfo.value.query['sourceAccasoaName'] = null
      filterInfo.value.query['sourceAccasoaOriginalId'] = null
      filterInfo.value.query['targetAccasoaName'] = null
      filterInfo.value.query['targetAccasoaOriginalId'] = null
      filterInfo.value.searchList.forEach((el) => {
        if (el.selectDataType === 'Account') {
          el.query = {
            accbookId: val,
            status: '1',
            isLastVersion: true,
          }
        }
      })
    }
  },
  {
    immediate: true,
  },
)
function pageInfo(obj) {
  page.value = obj
}
function handleClose() {
  dialogInfo.value.visible = false
}
function closeDetailList() {
  proxy.$store.dispatch('app/toggleOpenFilter')
  showDialog.value = false
  emit('callback')
}
async function exportExcel() {
  dialogInfo.value.flag = true
  dialogInfo.value.visible = true
  dialogInfo.value.type = 'excel'
  dialogInfo.value.msg = '请选择数据导出范围'
  dialogInfo.value.btList[1].label = '导出'
}
function checkConfirm() {
  if (dialogInfo.value.type === 'excel') {
    exportExcelList()
  } else if (dialogInfo.value.type === 'print') {
  }
  dialogInfo.value.visible = false
  dialogInfo.value.msg = ''
}
function exportExcelList() {
  parallelAccountRuleExcel({
    ...filterInfo.value.query,
    ...page.value,
    page: dialogInfo.value.flag,
  }).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}
// 查询
function search() {
  if (filterInfo.value.query.accbookId) {
    tableInfo.value.initCurpage = Math.random()
    tableInfo.value.refresh = Math.random()
    tableInfo.value.api = parallelAccountRuleDetailList
  } else {
    proxy.$message.warning('请先选择核算账簿!')
  }
}

// 触发事件
function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}
function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  tableInfo.value.data = []
}
onMounted(() => {
  if (userInfo) {
    filterInfo.value.query.accbookId = userInfo.accbookId
    filterInfo.value.query.accbookName = userInfo.accbookName
  }
})
</script>

<style scoped></style>
