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
      @handleEvent="handleEvent"
      @pageInfo="pageInfo"
      :btnCode="'adjunctAccountItem:list'"
    >
    </table-container>
    <PageDialog
      :title="addInfo.title"
      :visible="addInfo.visible"
      :btList="addInfo.btList"
      @reset="goback"
    >
      <PageForm
        ref="pageformRef"
        className="paddingBox order-model-formBox flex_wrap_start_start"
        v-model:ref-obj="addInfo.ref"
        :data="addInfo.data"
        :field-list="addInfo.fieldList"
        :rules="addInfo.rules"
        :label-width="addInfo.labelWidth"
      >
        <template v-slot:form-className>
          <el-input
            v-model="addInfo.data.className"
            style="width: 100%"
            class="not-mongolia"
            :required="true"
            disabled
            placeholder="请选择核算账簿"
          >
            <template #append>
              <el-icon @click="selectAccountBook">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </template>
      </PageForm>
    </PageDialog>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="adjunctAccountItem">
// 导入
import {
  adjunctAccountItemList,
  adjunctAccountItemAdd,
  adjunctAccountItemUpdate,
  adjunctAccountItemDelete,
  adjunctAccountItemExcel,
} from '@/api/base'
import { useSelectData } from '@/hooks/useSelectData'
import PageDialog from '@/components/PageDialog/index.vue'

// 获取 proxy
const { proxy } = getCurrentInstance()
const emit = defineEmits()
const { selectorInfo, selectorRef } = useSelectData()
const dicList = proxy.$store.state.permission.dict['fn_new_class_type']
// 响应式数据
const page = ref({
  curPage: 1, // 当前页
  pageSize: 20, // 每页条数
})

// 计算属性
const canDelete = computed(() => {
  return !(
    tableInfo.value.selections.length
    // &&
    // tableInfo.value.selections.filter((row) => row.status !== '0').length === 0
  )
})

// 过滤配置
const filterInfo = ref({
  copyQuery: {},
  query: { sort: 'create_time desc' },
  searchList: [
    {
      label: '辅助核算编码',
      value: 'code',
      componentType: 'input',
      event: search,
    },
    {
      label: '辅助核算名称',
      value: 'name',
      componentType: 'input',
      event: search,
    },
    {
      label: '系统档案',
      value: 'classNames',
      asValue: 'classIds',
      componentType: 'select-data-custom',
      selectDataType: 'systemArchive',
    },
    {
      label: '档案类型',
      value: 'classType',
      componentType: 'select-model',
      code: 'fn_new_class_type',
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
      show: proxy.$permission('adjunctAccountItem:add'),
    },
    {
      type: 'button',
      label: '删除',
      event: del,
      disabled: canDelete,
      show: proxy.$permission('adjunctAccountItem:delete'),
    },
    {
      type: 'button',
      label: '导出',
      event: exportExcel,
      show: proxy.$permission('adjunctAccountItem:excel'),
    },
  ],
})
// 表格配置
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: adjunctAccountItemList,
  selections: [],
  fieldList: [
    { label: '辅助核算编码', value: 'code' },
    { label: '辅助核算名称', value: 'name' },
    { label: '档案类型', value: 'classTypeValue' },
    { label: '系统档案', value: 'className' },
    { label: '备注', value: 'remark' },
    { label: '创建组织', value: 'createOrgName' },
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
        show: proxy.$permission('adjunctAccountItem:update'),
      },
      {
        label: '删除',
        event: del,
        popconfirmText: '删除后将改变数据,是否继续？',
        show: proxy.$permission('adjunctAccountItem:delete'),
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
      label: '辅助核算编码',
      value: 'code',
      type: 'input',
      required: true,
      width: '50%',
    },
    {
      label: '辅助核算名称',
      value: 'name',
      type: 'input',
      required: true,
      width: '50%',
    },
    {
      label: '系统档案',
      value: 'className',
      type: 'slot',
      required: true,
      width: '50%',
    },
    {
      label: '档案类型',
      value: 'classTypeValue',
      type: 'input',
      disabled: true,
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
        message: '请输入辅助核算编码',
        trigger: 'blur',
      },
    ],
    name: [
      {
        required: true,
        message: '请输入辅助核算名称',
        trigger: 'blur',
      },
    ],
    className: [
      {
        required: true,
        message: '请选择系统档案',
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

function selectAccountBook() {
  selectorInfo.type = 'systemArchive'
  selectorInfo.query = {}
  selectorInfo.callback = sysArchiveBack
  selectorInfo.visible = true
}
function sysArchiveBack(row) {
  addInfo.value.data.classId = row.id
  addInfo.value.data.className = row.code+' '+row.name
  addInfo.value.data.classType = row.classType
  addInfo.value.data.classTypeValue = row.classTypeValue
}
// ========== 增删改方法 ==========
function create() {
  addInfo.value.visible = true
  addInfo.value.data = {}
  addInfo.value.title = '新增辅助核算项'
}

function update(row) {
  addInfo.value.title = '修改辅助核算项'
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
      adjunctAccountItemDelete(ids, 'adjunctAccountItem:delete').then(
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
function exportExcel() {
  adjunctAccountItemExcel(
    filterInfo.value.query,
    'adjunctAccountItem:excel',
  ).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res)
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
function save() {
  addInfo.value.ref.validate((valid) => {
    if (valid) {
      let api = addInfo.value.data.id
        ? adjunctAccountItemUpdate
        : adjunctAccountItemAdd
      let btnCode = addInfo.value.data.id
        ? 'adjunctAccountItem:update'
        : 'adjunctAccountItem:add'
      let params = {
        ...addInfo.value.data,
      }
      api(params, btnCode).then((res) => {
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
</script>

<style scoped>
</style>
