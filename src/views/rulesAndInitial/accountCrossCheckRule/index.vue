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
        <NewPageFilter :filter-btn="filterInfo.btnList" />
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
        :btnCode="'accountCrossCheckRule:list'"
      >
        <template v-slot:col-accasoaCode="scope">
          <span class="slip-edit" @click="showDetail(scope.row)">{{
            scope.row.accasoaCode
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
    <!-- <select-data ref="selectorRef" /> -->
  </div>
</template>

<script setup name="accountCrossCheckRule">
import { computed, defineAsyncComponent } from 'vue'
import {
  parallelAccountRuleList,
  parallelAccountRuleDelete,
  parallelAccountRuleExcel,
  parallelAccountRuleEnable,
  parallelAccountRuleDisable,
} from '@/api/rulesAndInitial/accountCrossCheckRule'
const modify = defineAsyncComponent(() => import('./modify'))
const detail = defineAsyncComponent(() => import('./detail'))
const { proxy } = getCurrentInstance()
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const clearType = ref(true)
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
      label: '会计科目',
      value: 'accasoaName',
      asValue: 'accasoaOriginalId',
      componentType: 'select-data-custom',
      selectDataType: 'Account',
      valueField: 'originalId',
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
      show: proxy.$permission('accountCrossCheckRule:add'),
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('accountCrossCheckRule:delete'),
      event: del,
      disabled: canDelete,
    },
    {
      type: 'dropdown',
      label: '启停用',
      show:
        proxy.$permission('accountCrossCheckRule:enable') ||
        proxy.$permission('accountCrossCheckRule:disable'),
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
          show: proxy.$permission('accountCrossCheckRule:enable'),
          disabled: canEnable,
        },
        {
          label: '停用',
          command: 'disable',
          show: proxy.$permission('accountCrossCheckRule:disable'),
          disabled: canDisable,
        },
      ],
    },
    {
      type: 'button',
      label: '导出',
      event: exportExcel,
      show: proxy.$permission('accountCrossCheckRule:export'),
    },
  ],
})

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: null,
  selections: [],
  fieldList: [
    { label: '核算账簿', value: 'accbookName' },
    { label: '科目编码', value: 'accasoaCode', type: 'slot' },
    { label: '科目名称', value: 'accasoaName' },
    { label: '辅助核算项', value: 'accassItemName' },
    { label: '规则说明', value: 'remark' },
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
        show: proxy.$permission('accountCrossCheckRule:update'),
        ifRender: function (row) {
          return row.status === '0'
        },
      },
      {
        label: '停用',
        event: disable,
        show: proxy.$permission('accountCrossCheckRule:disable'),
        ifRender: function (row) {
          return row.status === '1'
        },
      },
      {
        label: '启用',
        event: enable,
        show: proxy.$permission('accountCrossCheckRule:enable'),
        ifRender: function (row) {
          return row.status === '0'
        },
      },
      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('accountCrossCheckRule:delete'),
        ifRender: function (row) {
          return row.status === '0'
        },
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
  tableInfo.value.api = parallelAccountRuleList
  getList()
}

function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  tableInfo.value.data = []
  // search()
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
  modifyInfo.value.title = '新增科目交叉校验规则'
  modifyInfo.value.id = ''
  modifyInfo.value.visible = true
  modifyInfo.value.data = {
    accbookId: filterInfo.value.query.accbookId || '',
    accbookName: filterInfo.value.query.accbookName || '',
  }
}

function update(row) {
  sessionStorage.setItem('storeRowId', row.id)
  modifyInfo.value.title = '修改科目交叉校验规则'
  modifyInfo.value.id = row.id
  modifyInfo.value.visible = true
}

function showDetail(row) {
  detailInfo.value.title = '科目交叉校验规则详情'
  detailInfo.value.id = row.id
  detailInfo.value.visible = true
}
watch(
  () => filterInfo.value.query.accbookId,
  (val) => {
    if (val) {
      filterInfo.value.searchList.forEach((el) => {
        if (el.selectDataType === 'Account') {
          el.query = {
            accountingbookId: val,
            date: new Date().toISOString().split('T')[0],
          }
        }
      })
    }
  }
)
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
      parallelAccountRuleDelete(ids, 'accountCrossCheckRule:delete').then(
        (resp) => {
          if (resp && resp.success) {
            proxy.$message.success('删除成功')
            getList()
          }
        },
      )
    })
    .catch(() => {})
}

function enable(row) {
  const ids = _getIds(row)
  if (ids.length === 0) {
    proxy.$message.warning('请选择要启用的数据')
    return
  }
  proxy
    .$confirm('确定启用选中数据？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      parallelAccountRuleEnable(ids, 'accountCrossCheckRule:enable').then(
        (resp) => {
          if (resp && resp.success) {
            proxy.$message.success('启用成功')
            getList()
          }
        },
      )
    })
    .catch(() => {})
}

function disable(row) {
  const ids = _getIds(row)
  if (ids.length === 0) {
    proxy.$message.warning('请选择要停用的数据')
    return
  }
  proxy
    .$confirm('确定停用选中数据？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      parallelAccountRuleDisable(ids, 'accountCrossCheckRule:disable').then(
        (resp) => {
          if (resp && resp.success) {
            proxy.$message.success('停用成功')
            getList()
          }
        },
      )
    })
    .catch(() => {})
}

function exportExcel() {
  parallelAccountRuleExcel(
    filterInfo.value.query,
    'accountCrossCheckRule:export',
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
