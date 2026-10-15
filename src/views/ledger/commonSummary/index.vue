<template>
  <div class="app-container">
    <div class="filter-wrapper first-filter-wrapper">
      <NewPageFilter
        v-model:query="filterInfo.query"
        :filter-list="filterInfo.searchList"
        :filter-btn="filterInfo.searchBtn"
      ></NewPageFilter>
    </div>
    <div class="filter-wrapper">
      <NewPageFilter :filter-btn="filterInfo.btnList"> </NewPageFilter>
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
      :pager="false"
      :tabIndex="true"
      :row-class-name="tableRowClassName"
      @handleEvent="handleEvent"
      :btnCode="'commonSummary:list'"
    >
    </table-container>
    <select-data ref="selectorRef" />
    <FormDialog ref="formDialogRef" />
  </div>
</template>

<script setup name="commonSummary">
// 导入
import { useFormDialog } from '@/hooks/useFormDialog'
import {
  commonSummaryList,
  commonSummaryCreate,
  commonSummaryUpdate,
  commonSummaryDelete,
  commonSummaryExcel,
} from '@/api/ledger/commonSummary'
// 获取 proxy
const { proxy } = getCurrentInstance()
const { formDialogInfo } = useFormDialog()
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig

// 计算属性
const canDelete = computed(() => {
  return !tableInfo.value.selections.length
})

// 过滤配置
const filterInfo = ref({
  copyQuery: {},
  query: { sort: 'create_time desc' },
  searchList: [
    {
      label: '核算账簿',
      value: 'accbookName',
      asValue: 'accbookId',
      componentType: 'select-data-custom',
      selectDataType: 'accountingBook',
      event: search,
    },
    {
      label: '常用摘要编码',
      value: 'code',
      componentType: 'input',
    },
    {
      label: '摘要内容',
      value: 'summaryName',
      componentType: 'input',
    },
    {
      label: '摘要属性',
      value: 'summaryType',
      componentType: 'select-model',
      code: 'summary_type',
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
      show: proxy.$permission('commonSummary:add'),
    },
    {
      type: 'button',
      label: '删除',
      event: del,
      disabled: canDelete,
      show: proxy.$permission('commonSummary:delete'),
    },
    {
      type: 'button',
      label: '导出',
      event: exportExcel,
      show: proxy.$permission('commonSummary:export'),
    },
  ],
})
// 表格配置
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: null,
  selections: [],
  fieldList: [
    { label: '核算账簿', value: 'accbookName' },
    { label: '常用摘要编码', value: 'code' },
    { label: '摘要内容', value: 'summaryName' },
    { label: '摘要属性', value: 'summaryTypeValue' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createDate' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '200',
    btList: [
      {
        label: '编辑',
        event: update,
        show: proxy.$permission('commonSummary:update'),
      },
      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('commonSummary:delete'),
      },
    ],
  },
})
function getList() {
  tableInfo.value.refresh = Math.random()
}

function search() {
  if (!filterInfo.value.query.accbookName)
    return proxy.$message.warning('请选择核算账簿')
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.api = commonSummaryList
  getList()
}
function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  tableInfo.value.data = []
}
function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}

function tableRowClassName({ row }) {
  let rowId = sessionStorage.getItem('storeRowId')
  if (rowId && row.id === rowId) {
    return 'check-row'
  }
  return ''
}
onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  if (userInfo) {
    filterInfo.value.query.accbookId = userInfo.accbookId
    filterInfo.value.query.accbookName = userInfo.accbookName
  }
})
// ========== 增删改方法 ==========
function create() {
  formDialogInfo.type = 'abstractDialog'
  formDialogInfo.formData = {}
  if (userInfo) {
    formDialogInfo.formData = {
      accbookId: userInfo.accbookId,
      accbookName: userInfo.accbookName,
    }
  }
  formDialogInfo.callback = save
  formDialogInfo.visible = true
}

function update(row) {
  formDialogInfo.type = 'abstractDialog'
  formDialogInfo.formData = {
    id: row.id,
    accbookName: row.accbookName,
    accbookId: row.accbookId,
    code: row.code,
    summaryName: row.summaryName,
    summaryType: row.summaryType,
  }
  formDialogInfo.callback = save
  formDialogInfo.visible = true
}

function del(row) {
  const ids = _getIds(row)
  if (ids.length === 0) {
    proxy.$message.warning('请选择要删除的数据')
    return
  }
  proxy
    .$confirm('确定删除选中数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      commonSummaryDelete(ids, 'commonSummary:delete').then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success('删除成功')
          getList()
        }
      })
    })
}
function exportExcel() {
  commonSummaryExcel(filterInfo.value.query, 'commonSummary:export').then(
    (res) => {
      if (res) {
        proxy.$fn.parseExcel(res)
      }
    },
  )
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
function save(row) {
  let api = row.id ? commonSummaryUpdate : commonSummaryCreate
  let btnCode = row.id ? 'commonSummary:update' : 'commonSummary:add'
  let params = {
    ...row,
  }
  // console.log('结果', params)
  api(params, btnCode).then((res) => {
    if (res && res.success) {
      proxy.$message.success('保存成功')
      getList()
    }
  })
}
</script>
