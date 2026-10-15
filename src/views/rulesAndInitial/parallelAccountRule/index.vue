<template>
  <div class="app-container">
    <div
      v-show="
        !modifyInfo.visible && !detailInfo.visible && !detailListInfo.visible
      "
    >
      <div class="titleTab" v-add-first-filter-class>
        <div class="tab currentTab">列表页</div>
        <div class="tab otherTab" @click="detailListInfo.visible = true">
          明细页
        </div>
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
        </NewPageFilter>
      </div>
      <!-- 表格 -->
      <table-container
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurpage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        :query="filterInfo.query"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        :tab-index="true"
        :pager="false"
        @handleEvent="handleEvent"
        :btnCode="'parallelAccountRule:list'"
      >
        <template v-slot:col-code="scope">
          <span class="slip-edit" @click="showDetail(scope.row)">{{
            scope.row.code
          }}</span>
        </template>
      </table-container>
    </div>
    <modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      @returnModify="returnModify"
    />

    <!-- 明细信息 -->
    <detail
      v-if="detailInfo.visible"
      v-model:visible="detailInfo.visible"
      :id="detailInfo.id"
      @returnBack="getList"
    />
    <detailList
      v-if="detailListInfo.visible"
      v-model:visible="detailListInfo.visible"
      @callback="getList"
    ></detailList>
    <UploadExcel
      v-if="uploadExcelInfo.visible"
      v-model:showDialog="uploadExcelInfo.visible"
      type="260202"
      btnCode="parallelAccountRule:import"
      action="/base/parallelVoucherRule/importExcel"
    ></UploadExcel>
    <UploadLog
      v-if="uploadLogInfo.visible"
      v-model:showDialog="uploadLogInfo.visible"
      :query="uploadLogInfo.query"
    ></UploadLog>
    <PageDialog
      v-model:visible="copyInfo.visible"
      :title="copyInfo.title"
      :width="copyInfo.width"
    >
      <pageTable
        :table-data="copyInfo.tableData"
        :field-list="copyInfo.fieldList"
        :data="copyInfo.data"
        :tabIndex="true"
        :checkBox="false"
        :pager="false"
      />
    </PageDialog>
    <SelectData ref="selectorRef" />
  </div>
</template>

<script setup name="newProductApplication">
import { exportTemplateExcel } from '@/api/base'
import {
  parallelAccountRuleList,
  parallelAccountRuleDelete,
  parallelAccountRuleCopyOther,
  parallelAccountRuleCopyDetail,
} from '@/api/rulesAndInitial/parallelAccountRule'
import { useSelectData } from '@/hooks/useSelectData'
const { selectorInfo, selectorRef } = useSelectData()
const modify = defineAsyncComponent(() => import('./modify'))
const detail = defineAsyncComponent(() => import('./detail'))
const detailList = defineAsyncComponent(() => import('./detailList'))
const { proxy } = getCurrentInstance()
const emit = defineEmits()
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const uploadExcelInfo = ref({
  visible: false,
})
const uploadLogInfo = ref({
  visible: false,
  query: {
    type: '260202',
  },
})
// 过滤相关配置
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
      label: '规则类型',
      value: 'type',
      componentType: 'select-model',
      code: 'parallel_rule_type',
      event: search,
    },
  ],
  searchBtn: [
    { type: 'button', label: '查询', event: search },
    { type: 'button', label: '重置', event: clearSearch },
  ],
  btnList: [
    {
      type: 'button',
      label: '新增',
      event: create,
      show: proxy.$permission('parallelAccountRule:add'),
    },

    {
      type: 'button',
      label: '删除',
      event: del,
      show: proxy.$permission('parallelAccountRule:delete'),
    },
    {
      type: 'button',
      label: '复制到其他账簿',
      event: copyToOther,
      show: proxy.$permission('parallelAccountRule:copyOther'),
    },
        {
      type: "dropdown",
      label: "导入",
      show:
        proxy.$permission("parallelAccountRule:import") ||
        proxy.$permission("parallelAccountRule:importTemp"),
      children: [
        {
          label: "导入",
          command: "import",
          show: proxy.$permission("parallelAccountRule:import"),
        },
        {
          label: "导入日志",
          command: "importLog",
          show: proxy.$permission("parallelAccountRule:import"),
        },
        {
          label: "下载导入模版",
          command: "importTemplate",
          show: proxy.$permission("parallelAccountRule:importTemp"),
        },
      ],
      event: (command) => {
        switch (command) {
          case "import":
            importRule();
            break;
          case "importLog":
            importLog();
            break;
          case "importTemplate":
            importTemplate();
            break;
        }
      },
    },
  ],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: null,
  selections: [],
  fieldList: [
    { label: '核算账簿', value: 'accbookName' },
    { label: '规则编码', value: 'code', type: 'slot' },
    { label: '规则名称', value: 'name' },
    { label: '规则类型', value: 'typeValue', type: 'status' },
    { label: '规则说明', value: 'remark' },
    { label: '创建组织', value: 'createOrgName' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime', type: 'datetime' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '200',
    btList: [
      {
        label: '编辑',
        event: update,
        show: proxy.$permission('parallelAccountRule:update'),
      },
      {
        label: '复制详情',
        event: copyDetial,
        show: proxy.$permission('parallelAccountRule:copyDetail'),
      },
      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('parallelAccountRule:delete'),
      },
    ],
  },
})
const modifyInfo = ref({
  visible: false,
  title: '',
  id: '',
})
const detailInfo = ref({
  visible: false,
  id: '',
})
const detailListInfo = ref({
  visible: false,
})

const copyInfo = ref({
  visible: false,
  title: '',
  data: [],
  fieldList: [
    {
      label: '复制日期',
      value: 'createDate',
    },
    {
      label: '本方账簿',
      value: 'fromAccbookName',
    },
    {
      label: '目的账簿',
      value: 'toAccbookName',
    },
    {
      label: '复制内容',
      value: 'typeValue',
    },

    {
      label: '摘要',
      value: 'explanation',
    },
    {
      label: '说明',
      value: 'copyResult',
    },
  ],
})
const clearType = ref(true)
onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  if(userInfo) {
    filterInfo.value.query.accbookId = userInfo.accbookId
    filterInfo.value.query.accbookName = userInfo.accbookName
  }
})
function importTemplate() {
  let fileName = '平行记账规则导入模板'
  exportTemplateExcel(fileName).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function returnModify() {
  if (modifyInfo.value.id) {
    getList()
  } else {
    search()
  }
}
// 获取列表
function getList() {
  tableInfo.value.refresh = Math.random()
}
// 查询
function search() {
   if (!filterInfo.value.query.accbookName)
    return proxy.$message.warning('请选择核算账簿')
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.api = parallelAccountRuleList
  getList()
}
// 触发事件
function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}
//创建
function create() {
  modifyInfo.value.title = '新增平行记账规则'
  modifyInfo.value.id = ''
  modifyInfo.value.visible = true
}
//更新
function update(row) {
  modifyInfo.value.title = '修改平行记账规则'
  modifyInfo.value.id = row.id
  modifyInfo.value.visible = true
}
//展示明细
function showDetail(row) {
  detailInfo.value.id = row.id
  detailInfo.value.visible = true
}
//删除
function del(row) {
  let ids = _getIds(row)
  if (!ids.length) return proxy.$message.warning('请选择要删除的数据')
  proxy
    .$confirm('确定删除选中数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      parallelAccountRuleDelete(ids, 'parallelAccountRule:delete').then(
        (resp) => {
          if (resp?.success) {
            proxy.$message.success('删除成功')
            getList()
          }
        },
      )
    })
    .catch(() => {})
}
function copyDetial(row) {
  copyInfo.value.title = '复制详情'
  let params = {
    sourceId: row.id,
  }
  parallelAccountRuleCopyDetail(params).then((resp) => {
    if (resp.success) {
      copyInfo.value.data = resp.data
    }
  })
  copyInfo.value.visible = true
}
function _getIds(row) {
  let ids = []
  if (row && row.id) {
    ids = [row.id]
  } else {
    if (tableInfo.value.selections.length > 0) {
      ids = tableInfo.value.selections.map((row) => row.id)
    }
  }
  return ids
}
function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  tableInfo.value.data = []
}
function copyToOther() {
  selectorInfo.type = 'accountingBook'
  selectorInfo.query = {}
  selectorInfo.showCheckbox = true
  selectorInfo.callback = copyCallBack
  selectorInfo.visible = true
}
function copyCallBack(row) {
  let accbookIds = row.map((item) => item.id)
  let sourceId = tableInfo.value.selections.map((item) => item.id).join(',')
  let data = {
    accbookIds,
    sourceId,
  }
  parallelAccountRuleCopyOther(data, 'parallelAccountRule:copyOther').then(
    (resp) => {
      if (resp?.success) {
        proxy.$message.success('复制成功')
        getList()
      }
    },
  )
}
function importRule() {
  uploadExcelInfo.value.visible = true
}
function importLog() {
  uploadLogInfo.value.visible = true
}
</script>

<style scoped></style>
