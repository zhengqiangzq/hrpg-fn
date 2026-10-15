<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <TreeBtns
            :filterBtn="treeBtnInfo.btnList"
            :title="treeBtnInfo.title"
          />
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <el-input
            v-model="treeFilter.query.keyword"
            :clearable="true"
            placeholder="请输入编码/名称"
            class="show-placeholder"
            @keyup.enter.native="treeSearch"
          >
            <template #suffix>
              <i
                class="el-icon-search"
                @click="treeSearch"
                style="display: flex; align-items: center"
              >
                <el-icon><Search /></el-icon>
              </i>
            </template>
          </el-input>
        </div>
        <div class="left-container-main main-flex">
          <el-tree
            ref="treeRef"
            :data="treeInfo.data"
            highlight-current
            :props="treeInfo.defaultProps"
            node-key="id"
            :default-expanded-keys="treeInfo.treeData"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          >
          </el-tree>
        </div>
      </div>
      <div class="right-container">
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
          <NewPageFilter :filter-btn="filterInfo.btnList"></NewPageFilter>
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
          :btnCode="'voucherTypeRange:list'"
        >
        </table-container>
      </div>
    </div>
    <select-data ref="selectorRef" />
    <PageDialog
      :title="addInfo.title"
      :visible="addInfo.visible"
      :btList="addInfo.btList"
      @reset="goback"
    >
      <page-table
        :refresh="addInfo.refresh"
        v-model:data="addInfo.data"
        :field-list="addInfo.fieldList"
        :query="addInfo.query"
        :api="addInfo.api"
        :check-box="true"
        :tab-index="true"
        :pager="false"
        @handleEvent="dialogHandleEvent"
      >
      </page-table>
    </PageDialog>
  </div>
</template>

<script setup name="voucherTypeRange">
import PageDialog from '@/components/PageDialog/index.vue'
import { accountingbookUserAuthList, voucherTypeList } from '@/api/base'
import {
  voucherTypeRangeList,
  voucherTypeRangeCreate,
  voucherTypeRangeDelete,
  voucherTypeRangeUpdate,
} from '@/api/rulesAndInitial/voucherTypeRange'

const { proxy } = getCurrentInstance()
// 计算属性
const canDelete = computed(() => {
  return tableInfo.value.selections.length === 0
})
const clearType = ref(true)
let state = ref('')
// 树过滤信息
const treeFilter = ref({
  query: {
    keyword: '',
  },
})

// 树配置
const treeInfo = ref({
  data: [
    {
      id: '-2',
      name: '组织账簿',
      code: '',
      children: [],
    },
  ],
  defaultProps: {
    children: 'children',
    label: function (data, node) {
      if (data.code) {
        return data.code + ' ' + data.name
      } else {
        return data.name
      }
    },
  },
})
// 树按钮配置
const treeBtnInfo = ref({
  title: '账簿信息',
  btnList: [],
})

// 过滤配置
const filterInfo = ref({
  copyQuery: {
    sort: 'create_time desc',
  },
  query: { sort: 'create_time desc' },
  searchList: [
    {
      label: '凭证类型编码',
      value: 'code',
      componentType: 'input',
    },
    {
      label: '凭证类型名称',
      value: 'name',
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
      show: proxy.$permission('voucherTypeRange:add'),
    },
    {
      type: 'button',
      label: '删除',
      event: handleDelete,
      disabled: canDelete,
      show: proxy.$permission('voucherTypeRange:delete'),
    },
  ],
})

// 表格配置
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: voucherTypeRangeList,
  selections: [],
  fieldList: [
    { label: '凭证类型编码', value: 'voucherTypeCode' },
    { label: '凭证类型名称', value: 'voucherTypeName' },
    { label: '简称', value: 'shortname' },
    { label: '是否默认类型', value: 'isDefaultValue', type: 'status' },
    { label: '备注', value: 'remark' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '200',
    btList: [
      {
        label: '设置默认',
        event: setDefault,
        show: proxy.$permission('voucherTypeRange:setDefault'),
        ifRender: (row) => {
          return row.isDefault === '0'
        },
      },
      {
        label: '删除',
        event: handleDelete,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('voucherTypeRange:delete'),
      },
    ],
  },
})
// 弹窗配置
const addInfo = ref({
  refresh: 1,
  initCurpage: 1,
  visible: false,
  ref: null,
  query: {},
  api: voucherTypeList,
  title: '',
  selections: [],
  data: [],
  fieldList: [
    {
      label: '凭证类型编码',
      value: 'code',
    },
    {
      label: '凭证类型名称',
      value: 'name',
    },
    {
      label: '简称',
      value: 'shortName',
    },
  ],
  btList: [
    {
      type: 'primary',
      show: true,
      label: '确定',
      event: addData,
    },
    { type: 'button', show: true, label: '取消', event: goback },
  ],
})

function goback() {
  addInfo.value.visible = false
}

function getOrgTree() {
  let params = { type: '2' }
  accountingbookUserAuthList(params).then((res) => {
    treeInfo.value.data[0].children = res.data[0]?.accBookList || []
    handleNodeClick(treeInfo.value.data[0]?.children[0])
    setTimeout(() => {
      proxy.$refs.treeRef.setCurrentNode(treeInfo.value.data[0]?.children[0])
    }, 0)
  })
}
// ========== 树相关方法 ==========
function treeSearch() {
  proxy.$refs.treeRef.filter(treeFilter.value.query.keyword)
}

/** 树节点过滤 */
function filterNode(value, data) {
  if (!value) return true
  return (
    data.name.includes(value) || data.code?.includes(value) || data.id === '-2'
  )
}

function handleNodeClick(node) {
  if (node.id && node.id !== '-2') {
    filterInfo.value.query.accbookId = node.id
    state.value = node.id
    getList()
  }
}

function getList() {
  tableInfo.value.refresh = Math.random()
}

function search() {
  tableInfo.value.initCurpage = Math.random()
  getList()
}

function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  if (state.value) {
    filterInfo.value.query.accbookId = state.value
  }
  search()
}

function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}
function dialogHandleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      addInfo.value.selections = [...data]
      break
  }
}
// 行高亮已内置在 TableContainer 中，无需手动传递 :row-class-name

// ========== 增删改方法 ==========
function create() {
  addInfo.value.title = '新增凭证类型'
  addInfo.value.id = ''
  addInfo.value.visible = true
  addInfo.value.query = {
    idNotIn: tableInfo.value.data.map((item) => item.id),
  }
  proxy.$nextTick(() => {
    addInfo.value.refresh = Math.random()
  })
}
function handleDelete(row) {
  const ids = _getIds(row)
  if (ids.length === 0) {
    proxy.$message.warning('请选择要删除的数据')
    return
  }
  const msg =
    ids.length === 1
      ? '确定删除选中数据？'
      : `确定删除选中的 ${ids.length} 条数据？`
  proxy
    .$confirm(msg, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      voucherTypeRangeDelete(ids, 'voucherTypeRange:delete').then((resp) => {
        if (resp && resp.success) {
          proxy.$message.success('删除成功')
          getList()
        }
      })
    })
}

function _getIds(row) {
  let ids = []
  if (row && row.id) {
    ids = [row.id]
  } else {
    if (tableInfo.value.selections.length > 0) {
      ids = tableInfo.value.selections.map((item) => item.id)
    }
  }
  return ids
}
function addData() {
  if (addInfo.value.selections.length === 0) {
    proxy.$message.warning('请选择凭证类型')
    return
  }
  let params = {
    accbookId: filterInfo.value.query.accbookId,
    voucherTypeIds: addInfo.value.selections.map((item) => item.id),
  }
  voucherTypeRangeCreate(params, 'voucherTypeRange:add').then((res) => {
    if (res.code === 200 && res.success) {
      proxy.$message.success('保存成功')
      addInfo.value.visible = false
      getList()
    }
  })
}
function setDefault(row) {
  proxy
    .$confirm('确定设置为默认类型？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      let params = { ...row }
      voucherTypeRangeUpdate(params, 'voucherTypeRange:setDefault').then(
        (resp) => {
          if (resp && resp.success) {
            proxy.$message.success('设置成功')
            getList()
          }
        },
      )
    })
}
// 生命周期钩子
onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  getOrgTree()
})
</script>
