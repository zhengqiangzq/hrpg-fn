<template>
  <div class="app-container">
    <div class="filter-wrapper first-filter-wrapper">
      <NewPageFilter
        v-model:query="filterInfo.query"
        :filter-list="filterInfo.searchList"
        :filter-btn="filterInfo.searchBtn"
      >
      </NewPageFilter>
    </div>
    <div class="filter-wrapper">
      <NewPageFilter :filter-btn="filterInfo.btnList"></NewPageFilter>
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
      @pageInfo="pageInfo"
      :btnCode="'voucherType:list'"
    >
    </table-container>
    <PageDialog
      :title="addInfo.title"
      :visible="addInfo.visible"
      :btList="addInfo.btList"
      @reset="goback"
    >
      <!-- 条件栏 -->
      <PageForm
        ref="pageformRef"
        className="paddingBox order-model-formBox flex_wrap_start_start"
        v-model:ref-obj="addInfo.ref"
        :data="addInfo.data"
        :field-list="addInfo.fieldList"
        :rules="addInfo.rules"
        :label-width="addInfo.labelWidth"
      >
      </PageForm>
    </PageDialog>
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
      :allocationApi="voucherTypeDistribute"
      :cancelApi="voucherTypeCancelDistribute"
      :loids="selectAllocationOrgDetailInfo.loids"
      @reset="getList"
    ></SelectAllocationOrgDetails>
  </div>
</template>

<script setup name="voucherType">
// 导入
import {
  getAllOrgTree,
  voucherTypeList,
  voucherTypeAdd,
  voucherTypeUpdate,
  voucherTypeDelete,
  voucherTypeEnable,
  voucherTypeDisable,
  voucherTypeDistribute,
  voucherTypeCancelDistribute,
} from '@/api/base'
import PageDialog from '@/components/PageDialog/index.vue'
import SelectAllocationOrgDetails from '@/components/SelectAllocationOrg/details'
import SelectAllocationOrg from '@/components/SelectAllocationOrg/index'
const { proxy } = getCurrentInstance()
const page = ref({
  curPage: 1, // 当前页
  pageSize: 20, // 每页条数
})
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
    dataType: 'voucherType',
    loid: '-2',
  },
  loids: [],
})
// 计算属性
const canDelete = computed(() => {
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
// 过滤配置
const filterInfo = ref({
  copyQuery: {},
  query: { sort: 'create_time desc' },
  searchList: [
    {
      label: '凭证类型编码',
      value: 'code',
      componentType: 'input',
      event: search,
    },
    {
      label: '凭证类型名称',
      value: 'name',
      componentType: 'input',
      event: search,
    },
    {
      label: '启用状态',
      value: 'status',
      componentType: 'select-model',
      code: 'enabled_type',
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
      show: proxy.$permission('voucherType:add'),
    },
    {
      type: 'button',
      label: '启用',
      event: enable,
      disabled: canDelete,
      show: proxy.$permission('voucherType:enabled'),
    },
    {
      type: 'button',
      label: '停用',
      event: stop,
      disabled: canDisable,
      show: proxy.$permission('voucherType:stop'),
    },
    {
      type: 'button',
      label: '删除',
      event: del,
      disabled: canDelete,
      show: proxy.$permission('voucherType:delete'),
    },
    {
      type: 'button',
      label: '分配',
      event: allocation,
      disabled: canAllocation,
      show:
        proxy.$permission('voucherType:allocation') &&
        proxy.$fn.getControl('voucherType'),
    },
    {
      type: 'button',
      label: '取消全部分配',
      show:
        proxy.$permission('voucherType:cancellAllocation') &&
        proxy.$fn.getControl('voucherType'),
      event: cancellAllocation,
      disabled: canAllocation,
    },
  ],
})

// 表格配置
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: voucherTypeList,
  selections: [],
  fieldList: [
    { label: '凭证类型编码', value: 'code' },
    { label: '凭证类型名称', value: 'name' },
    { label: '凭证类型简称', value: 'shortname' },
    { label: '启用状态', value: 'statusValue' },
    { label: '备注', value: 'remark' },
    { label: '创建组织', value: 'createOrgName' },
    { label: '数据来源类型', value: 'dataSourceTypeValue' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '200',
    btList: [
      {
        label: '编辑',
        event: update,
        show: proxy.$permission('voucherType:update'),
        ifRender: function (row) {
          return row.status === '0'
        },
      },
      {
        label: '分配',
        show:
          proxy.$permission('voucherType:allocation') &&
          proxy.$fn.getControl('voucherType'),
        event: allocation,
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row)
        },
      },
      {
        label: '分配详情',
        show:
          proxy.$permission('voucherType:allocationDetail') &&
          proxy.$fn.getControl('voucherType'),
        event: allocationDetail,
        ifRender: (row) => {
          return proxy.$fn.isCurrentOrg(row)
        },
      },
      {
        label: '启用',
        event: enable,
        show: proxy.$permission('voucherType:enable'),
        ifRender: function (row) {
          return row.status === '0'
        },
      },
      {
        label: '停用',
        event: stop,
        show: proxy.$permission('voucherType:stop'),
        ifRender: function (row) {
          return row.status === '1'
        },
      },
      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('voucherType:delete'),
        ifRender: function (row) {
          return row.status === '0'
        },
      },
    ],
  },
})
// 新增参数
const addInfo = ref({
  visible: false,
  ref: null,
  title: '',
  data: {},
  fieldList: [
    {
      label: '凭证类型编码',
      value: 'code',
      type: 'input',
      required: true,
      width: '50%',
    },
    {
      label: '凭证类型名称',
      value: 'name',
      type: 'input',
      required: true,
      width: '50%',
    },
    {
      label: '凭证类型简称',
      value: 'shortname',
      type: 'input',
      required: true,
      width: '50%',
    },
    {
      label: '备注',
      value: 'remark',
      type: 'textarea',
    },
  ],
  rules: {
    code: [
      {
        required: true,
        message: '请输入凭证类型编码',
        trigger: 'blur',
      },
    ],
    name: [
      {
        required: true,
        message: '请输入凭证类型名称',
        trigger: 'blur',
      },
    ],
    shortname: [
      {
        required: true,
        message: '请输入凭证类型简称',
        trigger: 'blur',
      },
    ],
  },
  btList: [
    {
      type: 'primary',
      show: true,
      label: '确定',
      event: save,
    },
    { type: 'button', show: true, label: '取消', event: goback },
  ],
})
// ========== 列表相关方法 ==========
function pageInfo(obj) {
  page.value = obj
}

function getList() {
  tableInfo.value.refresh = Math.random()
}

function search() {
  getList()
}
function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}
function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}

// 行高亮已内置在 TableContainer 中，无需手动传递 :row-class-name

// ========== 增删改方法 ==========
function create() {
  addInfo.value.visible = true
  addInfo.value.data = {}
  addInfo.value.title = '新增凭证类型'
}

function update(row) {
  addInfo.value.title = '修改凭证类型'
  addInfo.value.data = row
  addInfo.value.visible = true
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
      voucherTypeDelete(ids).then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success('删除成功')
          getList()
        }
      })
    })
    .catch(() => {})
}

function allocation(row) {
  const loids = getLoids(row)
  selectAllocationOrgInfo.value.loids = loids
  selectAllocationOrgInfo.value.visible = true
}
// 分配/取消全部分配
function cancellAllocation() {
  let params = {
    loids: [],
    groupOrgList: [],
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
      voucherTypeCancelDistribute(params).then((res) => {
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
    groupOrgList: [],
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
      params.groupOrgList.push(obj)
    })
  }
  voucherTypeDistribute(params).then((res) => {
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
function getLoids(row) {
  let loids = []
  if (row && row.loid) {
    loids = [row.loid]
  } else {
    if (tableInfo.value.selections.length > 0) {
      loids = tableInfo.value.selections.map((row) => row.loid)
    }
  }
  return loids
}
function save() {
  addInfo.value.ref.validate((valid) => {
    if (valid) {
      let api = addInfo.value.data.id ? voucherTypeUpdate : voucherTypeAdd
      let params = {
        ...addInfo.value.data,
      }
      if (!addInfo.value.data.id) {
        params['status'] = '1'
      }
      api(params).then((res) => {
        if (res && res.success) {
          proxy.$message.success('保存成功')
          addInfo.value.visible = false
          getList()
        }
      })
    }
  })
}
function goback() {
  addInfo.value.visible = false
}
// ========== 启用停用方法 ==========
function enable(row) {
  proxy
    .$confirm('确定启用该凭证类型?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      let ids = _getIds(row)

      voucherTypeEnable(ids).then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success('启用成功')
          getList()
        }
      })
    })
    .catch(() => {})
}

function stop(row) {
  proxy
    .$confirm('确定停用该凭证类型?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      let ids = _getIds(row)
      voucherTypeDisable(ids).then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success('停用成功')
          getList()
        }
      })
    })
    .catch(() => {})
}
</script>

<style scoped></style>
