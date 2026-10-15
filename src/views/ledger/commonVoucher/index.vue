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
        :query="filterInfo.query"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        :row-class-name="tableRowClassName"
        @handleEvent="handleEvent"
        :pager="false"
        :btnCode="'commonVoucher:list'"
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
    <detail
      v-if="detailInfo.visible"
      v-model:visible="detailInfo.visible"
      :id="detailInfo.id"
      :title="detailInfo.title"
      @returnModify="returnModify"
    />
  </div>
</template>

<script setup name="commonVoucher">
import { defineAsyncComponent } from 'vue'
import {
  commonVoucherList,
  commonVoucherDelete,
  commonVoucherExcel,
} from '@/api/ledger/commonVoucher'
const modify = defineAsyncComponent(() => import('./modify'))
const detail = defineAsyncComponent(() => import('./detail'))

const { proxy } = getCurrentInstance()
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const canDelete = computed(() => {
  return !(tableInfo.value.selections.length > 0)
})
const page = ref({
  curPage: 1,
  pageSize: 20,
})
const clearType = ref(true)

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
      label: '常用凭证编码',
      value: 'code',
      componentType: 'input',
    },
    {
      label: '常用凭证名称',
      value: 'name',
      componentType: 'input',
    },
    {
      label: '常用凭证属性',
      value: 'property',
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
      show: proxy.$permission('commonVoucher:add'),
    },
    {
      type: 'button',
      label: '删除',
      event: del,
      disabled: canDelete,
      show: proxy.$permission('commonVoucher:delete'),
    },
    {
      type: 'button',
      label: '导出',
      event: exportExcel,
      show: proxy.$permission('commonVoucher:export'),
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
    { label: '常用凭证编码', value: 'code', type: 'slot' },
    { label: '常用凭证名称', value: 'name' },
    { label: '常用凭证属性', value: 'propertyName' },
    { label: '凭证类别', value: 'voucherTypeName' },
    { label: '创建组织', value: 'orgName' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createDate' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '160',
    btList: [
      {
        label: '编辑',
        event: update,
        show: proxy.$permission('commonVoucher:update'),
      },
      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('commonVoucher:delete'),
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

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  if (userInfo) {
    filterInfo.value.query.accbookId = userInfo.accbookId
    filterInfo.value.query.accbookName = userInfo.accbookName
  }
})

function getList() {
  tableInfo.value.refresh = Math.random()
}

function search() {
  if (!filterInfo.value.query.accbookName)
    return proxy.$message.warning('请选择核算账簿')
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.api = commonVoucherList
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
  modifyInfo.value.title = '新增常用凭证'
  modifyInfo.value.id = ''
  modifyInfo.value.visible = true
}

function update(row) {
  sessionStorage.setItem('storeRowId', row.id)
  modifyInfo.value.title = '修改常用凭证'
  modifyInfo.value.id = row.id
  modifyInfo.value.visible = true
}

function showDetail(row) {
  sessionStorage.setItem('storeRowId', row.id)
  detailInfo.value.title = '常用凭证详情'
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
      commonVoucherDelete(ids, 'commonVoucher:delete').then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success('删除成功')
          getList()
        }
      })
    })
    .catch(() => {})
}

function exportExcel() {
  commonVoucherExcel(
    filterInfo.value.query,
    'commonVoucher:export',
  ).then((res) => {
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
</script>
