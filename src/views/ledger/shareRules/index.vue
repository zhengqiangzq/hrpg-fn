<template>
  <div class="app-container">
    <div v-show="!modifyInfo.visible && !detailInfo.visible">
      <div class="filter-wrapper first-filter-wrapper">
        <NewPageFilter
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.searchBtn"
          :clear-type="clearType"
        >
        </NewPageFilter>
      </div>
      <div class="filter-wrapper">
        <NewPageFilter :filter-btn="filterInfo.btnList"> </NewPageFilter>
      </div>
      <table-container
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurpage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        :pager="false"
        :query="filterInfo.query"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        :row-class-name="tableRowClassName"
        @handleEvent="handleEvent"
        @pageInfo="pageInfo"
        :btnCode="'shareRules:list'"
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
      :data="modifyInfo.data"
      @returnModify="returnModify"
    />
    <detail
      v-if="detailInfo.visible"
      v-model:visible="detailInfo.visible"
      :id="detailInfo.id"
      :title="detailInfo.title"
      @returnModify="returnModify"
    />
    <UploadExcel
      v-if="uploadExcelInfo.visible"
      v-model:showDialog="uploadExcelInfo.visible"
      type="260208"
      btnCode="shareRules:import"
      action="/ga/shareRule/importExcel"
    ></UploadExcel>
    <UploadLog
      v-if="uploadLogInfo.visible"
      v-model:showDialog="uploadLogInfo.visible"
      :query="uploadLogInfo.query"
    ></UploadLog>
  </div>
</template>

<script setup name="shareRules">
import { defineAsyncComponent } from 'vue'
import { exportTemplateExcel } from '@/api/base'
import {
  shareRulesList,
  shareRulesDelete,
  shareRulesExcel,
} from '@/api/ledger/shareRules'

const modify = defineAsyncComponent(() => import('./modify'))
const detail = defineAsyncComponent(() => import('./detail'))

const { proxy } = getCurrentInstance()
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const canDelete = computed(() => {
  return tableInfo.value.selections.length
})
const page = ref({
  curPage: 1,
  pageSize: 20,
})
const clearType = ref(true)
const uploadExcelInfo = ref({
  visible: false,
})
const uploadLogInfo = ref({
  visible: false,
  query: {
    type: '260208',
  },
})
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
      required: true,
    },
    {
      label: '分摊规则编码',
      value: 'code',
      componentType: 'input',
    },
    {
      label: '分摊规则名称',
      value: 'name',
      componentType: 'input',
    },
    {
      label: '分摊对象',
      value: 'accassitemNames',
      asValue: 'accassitemIds',
      componentType: 'select-data-custom',
      selectDataType: 'adjunctAccountItem',
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
      show: proxy.$permission('shareRules:add'),
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('shareRules:delete'),
      event: del,
      disabled: canDelete,
    },

    {
      type: 'dropdown',
      label: '导入/导出',
      show:
        proxy.$permission('shareRules:import') ||
        proxy.$permission('shareRules:importTemplate') ||
        proxy.$permission('shareRules:exportMerge') ||
        proxy.$permission('shareRules:exportSplit') ||
        proxy.$permission('shareRules:exportList'),
      children: [
        {
          label: '导出',
          command: 'export',
          show: proxy.$permission('shareRules:exportList'),
        },
        {
          label: '下载导入模版',
          command: 'importTemplate',
          show: proxy.$permission('shareRules:importTemplate'),
        },
        {
          label: '导入',
          command: 'import',
          show: proxy.$permission('shareRules:import'),
        },
        {
          label: '导入日志',
          command: 'importLog',
          show: proxy.$permission('shareRules:import'),
        },
      ],
      event: (command) => {
        switch (command) {
          case 'import':
            importRule()
            break
          case 'importLog':
            importLog()
            break
          case 'importTemplate':
            importTemplate()
            break
          case 'export':
            exportExcel()
            break
        }
      },
    },
  ],
})

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: undefined,
  selections: [],
  fieldList: [
    { label: '核算账簿', value: 'accbookName' },
    { label: '分摊规则编码', value: 'code', type: 'slot' },
    { label: '分摊规则名称', value: 'name' },
    { label: '分摊对象', value: 'accassitemNames' },
    { label: '分摊方式', value: 'shareTypeValue' },
    { label: '创建组织', value: 'orgName' },
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
        show: proxy.$permission('shareRules:update'),
      },

      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('shareRules:delete'),
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
  title: '',
  id: '',
})
function pageInfo(obj) {
  page.value = obj
}

function getList() {
  tableInfo.value.refresh = Math.random()
}

function search() {
  if (!filterInfo.value.query.accbookName)
    return proxy.$message.warning('请选择核算账簿')
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.api = shareRulesList
  getList()
}

function clearSearch() {
  clearType.value = !clearType.value
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

function create() {
  modifyInfo.value.title = '新增分摊规则'
  modifyInfo.value.id = ''
  modifyInfo.value.visible = true
  modifyInfo.value.data = {
    accbookId: filterInfo.value.query.accbookId || '',
    accbookName: filterInfo.value.query.accbookName || '',
  }
}

function update(row) {
  sessionStorage.setItem('storeRowId', row.id)
  modifyInfo.value.title = '修改分摊规则'
  modifyInfo.value.id = row.id
  modifyInfo.value.visible = true
}

function showDetail(row) {
  detailInfo.value.title = '分摊规则详情'
  detailInfo.value.id = row.id
  detailInfo.value.visible = true
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
      shareRulesDelete(ids, 'shareRules:delete').then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success('删除成功')
          getList()
        }
      })
    })
}

function exportExcel() {
  shareRulesExcel(filterInfo.value.query, 'shareRules:export').then(
    (res) => {
      if (res) {
        proxy.$fn.parseExcel(res)
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

function importTemplate() {
  let fileName = '分摊规则导入模板'
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
onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  if (userInfo) {
    filterInfo.value.query.accbookId = userInfo.accbookId
    filterInfo.value.query.accbookName = userInfo.accbookName
  }
})
</script>
