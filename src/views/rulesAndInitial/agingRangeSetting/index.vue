<template>
  <div class="app-container">
    <div v-show="!modifyInfo.visible && !detailInfo.visible">
      <div class="filter-wrapper first-filter-wrapper">
        <NewPageFilter
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.searchBtn"
        />
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
        @handleEvent="handleEvent"
        @pageInfo="pageInfo"
        :btnCode="'agingRangeSetting:list'"
      >
        <template #col-code="{ row }">
          <span class="slip-edit" @click="showDetail(row)">{{ row.code }}</span>
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
    <SelectAllocationOrg
      v-if="selectAllocationOrgInfo.visible"
      v-model:query="selectAllocationOrgInfo.query"
      v-model:show-dialog="selectAllocationOrgInfo.visible"
      :api="getAllOrgTree"
      title="选择组织"
      :saveEmpty="true"
      :checkStrictly="true"
      :check-box="true"
      :highlightCurrent="true"
      @callback="selectAllocationOrgInfoCallBack"
    ></SelectAllocationOrg>
    <SelectAllocationOrgDetails
      v-if="selectAllocationOrgDetailInfo.visible"
      v-model:query="selectAllocationOrgDetailInfo.query"
      v-model:show-dialog="selectAllocationOrgDetailInfo.visible"
      :allocationApi="agingRangeSetDistribute"
      :cancelApi="agingRangeSetCancelDistribute"
      :loids="selectAllocationOrgDetailInfo.loids"
      @reset="getList"
    ></SelectAllocationOrgDetails>
  </div>
</template>

<script setup name="agingRangeSetting">
import { defineAsyncComponent } from 'vue'
import {
  getAllOrgTree,
} from '@/api/base'
import {
  agingRangeSetList,
  agingRangeSetDelete,
  agingRangeSetEnable,
  agingRangeSetDisable,
  agingRangeSetDistribute,
  agingRangeSetCancelDistribute,
} from '@/api/rulesAndInitial/agingRangeSetting'
const modify = defineAsyncComponent(() => import('./modify'))
const detail = defineAsyncComponent(() => import('./detail'))
const SelectAllocationOrgDetails = defineAsyncComponent(
  () => import('@/components/SelectAllocationOrg/details'),
)
const { proxy } = getCurrentInstance()
const emit = defineEmits()

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
const canAllocation = computed(() => {
  return !(
    tableInfo.value.selections.length &&
    tableInfo.value.selections.filter((row) => row.dataSourceType !== '2')
      .length === 0
  )
})
const page = ref({ curPage: 1, pageSize: 20 })
const selectAllocationOrgInfo = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
  loids: [],
})
const selectAllocationOrgDetailInfo = ref({
  visible: false,
  query: {
    dataType: 'agingRule',
    loid: '-2',
  },
  loids: [],
})
const slipSelectRequest = ref(true)

const filterInfo = ref({
  copyQuery: {},
  query: { sort: 'create_time desc' },
  searchList: [
    { label: '账龄编码', value: 'code', componentType: 'input' },
    { label: '账龄名称', value: 'name', componentType: 'input' },
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
      show: proxy.$permission('agingRangeSetting:add'),
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('agingRangeSetting:delete'),
      event: del,
      disabled: canDelete,
    },
    {
      type: 'dropdown',
      label: '启停用',
      show:
        proxy.$permission('agingRangeSetting:enable') ||
        proxy.$permission('agingRangeSetting:disable'),
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
          show: proxy.$permission('agingRangeSetting:enable'),
          disabled: canEnable,
        },
        {
          label: '停用',
          command: 'disable',
          show: proxy.$permission('agingRangeSetting:disable'),
          disabled: canDisable,
        },
      ],
    },
    {
      type: 'button',
      label: '分配',
      event: allocation,
      disabled: canAllocation,
      show:
        proxy.$permission('agingRangeSetting:allocation') &&
        proxy.$fn.getControl('agingRule'),
    },
    {
      type: 'button',
      label: '取消全部分配',
      show:
        proxy.$permission('agingRangeSetting:cancellAllocation') &&
        proxy.$fn.getControl('agingRule'),
      event: cancellAllocation,
      disabled: canAllocation,
    },
  ],
})

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: agingRangeSetList,
  selections: [],
  fieldList: [
    { label: '账龄编码', value: 'code', type: 'slot' },
    { label: '账龄名称', value: 'name' },
    { label: '时间单位', value: 'unitName' },
    { label: '单位天数', value: 'day' },
    { label: '备注', value: 'remark' },
    { label: '启用状态', value: 'statusValue' },
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
        show: proxy.$permission('agingRangeSetting:update'),
        ifRender: (row) => row.status === '0',
      },
      {
        label: '分配',
        show:
          proxy.$permission('agingRangeSetting:allocation') &&
          proxy.$fn.getControl('agingRule'),
        event: allocation,
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row)
        },
      },
      {
        label: '分配详情',
        show:
          proxy.$permission('agingRangeSetting:allocationDetail') &&
          proxy.$fn.getControl('agingRule'),
        event: allocationDetail,
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row)
        },
      },
      {
        label: '启用',
        event: enable,
        show: proxy.$permission('agingRangeSetting:enable'),
        ifRender: (row) => row.status === '0',
      },
      {
        label: '停用',
        event: disable,
        show: proxy.$permission('agingRangeSetting:disabled'),
        ifRender: (row) => row.status === '1',
      },

      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('agingRangeSetting:delete'),
        ifRender: (row) => row.status === '0',
      },
    ],
  },
})

const modifyInfo = ref({ visible: false, title: '', id: '' })
const detailInfo = ref({ visible: false, title: '账龄区间详情', id: '' })

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
})

function allocation(row) {
  const loids = getLoids(row)
  selectAllocationOrgInfo.value.loids = loids
  selectAllocationOrgInfo.value.visible = true
}
// 分配/取消全部分配
function cancellAllocation() {
  let params = {
    loids: [],
    orgList: [],
  }
  proxy
    .$confirm('请确认是否取消全部分配?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      params.loids = tableInfo.value.selections.map((item) => {
        return item.loid
      })
      agingRangeSetCancelDistribute(params).then((res) => {
        if (res && res.success) {
          proxy.$message.success({
            message: '操作成功',
            duration: 3000,
            showClose: true,
          })
          getList()
        }
      })
    })
}
function allocationDetail(row) {
  selectAllocationOrgDetailInfo.value.loids = [row.loid]
  selectAllocationOrgDetailInfo.value.query.loid = row.loid
  selectAllocationOrgDetailInfo.value.visible = true
}
function selectAllocationOrgInfoCallBack(allNodes) {
  let params = {
    loids: selectAllocationOrgInfo.value.loids,
    orgList: [],
  }
  if (allNodes && allNodes.length) {
    allNodes.map((item) => {
      let obj = {
        groupId: item.groupId,
        orgId: '-2',
      }
      if (item.type === '2') {
        obj.orgId = item.id
      }
      params.orgList.push(obj)
    })
  }
  agingRangeSetDistribute(params).then((res) => {
    if (res && res.success) {
      proxy.$message.success({
        message: '操作成功',
        duration: 3000,
        showClose: true,
      })
      getList()
    }
  })
}
function pageInfo(obj) {
  page.value = obj
}
function getList() {
  tableInfo.value.refresh = Math.random()
}
function search() {
  tableInfo.value.initCurpage = Math.random()
  getList()
}
function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}
function handleEvent(event, data) {
  if (event === 'tableCheck') tableInfo.value.selections = [...data]
}
// 行高亮已内置在 TableContainer 中，无需手动传递 :row-class-name

function create() {
  modifyInfo.value = { title: '新增账龄区间', id: '', visible: true }
}
function update(row) {
  modifyInfo.value = { title: '修改账龄区间', id: row.id, visible: true }
}
function showDetail(row) {
  detailInfo.value = { title: '账龄区间详情', id: row.id, visible: true }
}
function returnModify() {
  modifyInfo.value.id ? getList() : search()
}

function del(row) {
  const ids = _getIds(row)
  if (!ids.length) return proxy.$message.warning('请选择要删除的数据')
  proxy
    .$confirm('确定删除选中数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      agingRangeSetDelete(ids, 'agingRangeSetting:delete').then((resp) => {
        if (resp?.success) {
          proxy.$message.success('删除成功')
          getList()
        }
      })
    })
    .catch(() => {})
}

function enable(row) {
  const ids = _getIds(row)
  agingRangeSetEnable(ids, 'agingRangeSetting:enable').then((resp) => {
    if (resp?.success) {
      proxy.$message.success('启用成功')
      getList()
    }
  })
}

function disable(row) {
  const ids = _getIds(row)
  agingRangeSetDisable(ids, 'agingRangeSetting:disable').then((resp) => {
    if (resp?.success) {
      proxy.$message.success('停用成功')
      getList()
    }
  })
}

function _getIds(row) {
  return row?.id ? [row.id] : tableInfo.value.selections.map((r) => r.id)
}
function getLoids(row) {
  return row?.loid ? [row.loid] : tableInfo.value.selections.map((r) => r.loid)
}
</script>
