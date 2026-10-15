<template>
  <div class="app-container">
    <div v-show="!modifyInfo.visible && !detailInfo.visible">
      <!-- 筛选区 -->
      <div class="filter-wrapper first-filter-wrapper">
        <NewPageFilter
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.searchBtn"
        />
      </div>
      <!-- 按钮栏 -->
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
        @handleEvent="handleEvent"
        btnCode="auxiliaryAccountingScope:list"
      >
        <template v-slot:col-accasoaName="scope">
          <span class="slip-edit" @click="showDetail(scope.row)">{{
            scope.row.accasoaName
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
  </div>
</template>

<script setup name="auxiliaryAccountingScope">
import { defineAsyncComponent } from 'vue'
import {
  auxiliaryAccountingScopeList,
  auxiliaryAccountingScopeDelete,
  auxiliaryAccountingScopeEnable,
  auxiliaryAccountingScopeDisable,
  auxiliaryAccountingScopeExcel,
} from '@/api/rulesAndInitial/auxiliaryAccountingScope'
const modify = defineAsyncComponent(() => import('./modify'))
const detail = defineAsyncComponent(() => import('./detail'))

const { proxy } = getCurrentInstance()
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const canDelete = computed(() => {
  return !(
    tableInfo.value.selections.length &&
    tableInfo.value.selections.filter((row) => row.status !== '0').length === 0
  )
})

const canEnable = computed(() => {
  return !(
    tableInfo.value.selections.length &&
    tableInfo.value.selections.filter((row) => row.status !== '0').length === 0
  )
})

const canDisable = computed(() => {
  return !(
    tableInfo.value.selections.length &&
    tableInfo.value.selections.filter((row) => row.status !== '1').length === 0
  )
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
      label: '科目编码',
      value: 'accasoaCode',
      componentType: 'input',
    },
    {
      label: '科目名称',
      value: 'accasoaName',
      componentType: 'input',
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
      show: proxy.$permission('auxiliaryAccountingScope:add'),
    },
    {
      type: 'button',
      label: '删除',
      event: del,
      show: proxy.$permission('auxiliaryAccountingScope:delete'),
      disabled: canDelete,
    },
    {
      type: 'dropdown',
      label: '启停用',
      show:
        proxy.$permission('auxiliaryAccountingScope:enable') ||
        proxy.$permission('auxiliaryAccountingScope:disable'),
      disabled: () => {
        const selections = tableInfo.value.selections
        if (!selections.length) return true
        // return !proxy.$fn.isCurrentOrgBatch(selections)
      },
      event: (command) => {
        if (command === 'enable') enable()
        else if (command === 'disable') disable()
      },
      children: [
        {
          label: '启用',
          command: 'enable',
          show: proxy.$permission('auxiliaryAccountingScope:enable'),
          disabled: canEnable,
        },
        {
          label: '停用',
          command: 'disable',
          show: proxy.$permission('auxiliaryAccountingScope:disable'),
          disabled: canDisable,
        },
      ],
    },
    {
      type: 'button',
      label: '导出',
      event: exportExcel,
      show: proxy.$permission('auxiliaryAccountingScope:export'),
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
    { label: '科目表', value: 'accchartName' },
    { label: '科目编码', value: 'accasoaName', type: 'slot' },
    { label: '控制维度', value: 'dimName' },
    { label: '备注', value: 'remark' },
    { label: '启用状态', value: 'statusValue' },
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
        show: proxy.$permission('auxiliaryAccountingScope:update'),
        ifRender: function (row) {
          return row.status === '0'
        },
      },
      {
        label: '启用',
        event: enable,
        show: proxy.$permission('auxiliaryAccountingScope:enable'),
        ifRender: function (row) {
          return row.status === '0'
        },
      },
      {
        label: '停用',
        event: disable,
        show: proxy.$permission('auxiliaryAccountingScope:disable'),
        ifRender: function (row) {
          return row.status === '1'
        },
      },
      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('auxiliaryAccountingScope:delete'),
        ifRender: function (row) {
          return row.status === '0'
        },
      },
    ],
  },
})

const modifyInfo = ref({ visible: false, title: '', id: '' })
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
  tableInfo.value.api = auxiliaryAccountingScopeList
  getList()
}
function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  tableInfo.value.data = []
}
function handleEvent(event, data) {
  if (event === 'tableCheck') tableInfo.value.selections = [...data]
}

function create() {
  modifyInfo.value.title = '新增辅助核算范围控制'
  modifyInfo.value.id = ''
  modifyInfo.value.visible = true
  modifyInfo.value.data = {
    accbookId: filterInfo.value.query.accbookId || '',
    accbookName: filterInfo.value.query.accbookName || '',
  }
}
function update(row) {
  sessionStorage.setItem('storeRowId', row.id)
  modifyInfo.value.title = '编辑辅助核算范围控制'
  modifyInfo.value.id = row.id
  modifyInfo.value.visible = true
}
function showDetail(row) {
  detailInfo.value.title = '辅助核算范围控制详情'
  detailInfo.value.id = row.id
  detailInfo.value.visible = true
}
function returnModify() {
  modifyInfo.value.id ? search() : search()
}

function del(row) {
  const ids = row?.id ? [row.id] : tableInfo.value.selections.map((r) => r.id)
  if (!ids.length) return proxy.$message.warning('请选择要删除的数据')
  proxy
    .$confirm('确定删除选中数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      auxiliaryAccountingScopeDelete(
        ids,
        'auxiliaryAccountingScope:delete',
      ).then((resp) => {
        if (resp?.success) {
          proxy.$message.success('删除成功')
          search()
        }
      })
    })
    .catch(() => {})
}

function enable(row) {
  const ids = row?.id ? [row.id] : tableInfo.value.selections.map((r) => r.id)
  if (!ids.length) return proxy.$message.warning('请选择要启用的数据')
  proxy
    .$confirm('确定启用选中数据？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      auxiliaryAccountingScopeEnable(
        ids,
        'auxiliaryAccountingScope:enable',
      ).then((resp) => {
        if (resp?.success) {
          proxy.$message.success('启用成功')
          search()
        }
      })
    })
    .catch(() => {})
}

function disable(row) {
  const ids = row?.id ? [row.id] : tableInfo.value.selections.map((r) => r.id)
  if (!ids.length) return proxy.$message.warning('请选择要停用的数据')
  proxy
    .$confirm('确定停用选中数据？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      auxiliaryAccountingScopeDisable(
        ids,
        'auxiliaryAccountingScope:disable',
      ).then((resp) => {
        if (resp?.success) {
          proxy.$message.success('停用成功')
          search()
        }
      })
    })
    .catch(() => {})
}

function exportExcel() {
  auxiliaryAccountingScopeExcel(
    filterInfo.value.query,
    'auxiliaryAccountingScope:export',
  ).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
</script>
