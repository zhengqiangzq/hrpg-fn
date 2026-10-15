<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <TreeBtns :filterBtn="treeBtnInfo.btnList" :title="treeBtnInfo.title" />
        <div class="left-container-header border-style-bottom">
          <el-input
              v-model="formInfo.query.name"
              :clearable="true"
              placeholder="请输入编码/名称"
              suffix-icon="Search"
              class="show-placeholder flex"
              @keyup.enter="handleSearch"
          ></el-input>
        </div>
        <div class="left-container-main main-flex">
          <el-tree
              ref="menuTree"
              :data="treeInfo.data"
              highlight-current
              :props="treeInfo.defaultProps"
              node-key="id"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container">
        <div class="filter-wrapper no-margin-bottom">
          <NewPageFilter
              :filter-btn="filterInfo.btnList"
              className="float-right"
          >
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <page-form
              class="flex_wrap_start_start paddingBox order-model-formBox"
              v-model:ref-obj="formInfo.ref"
              :data="formInfo.data"
              :field-list="formInfo.fieldList"
              :rules="formInfo.rules"
              :label-width="formInfo.labelWidth"
          >
          </page-form>
        </div>
      </div>
    </div>
    <add-edit
        v-if="states.dialogVisible"
        v-model:visible="states.dialogVisible"
        :title="states.title"
        @callback="diaLogeCallback"
    />
  </div>
</template>
<script setup name="tree">
import {getCurrentInstance, onMounted, ref} from "vue";
import AddEdit from './addEdit.vue'
import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {exportTemplateExcel} from "@/api/base";

const { proxy } = getCurrentInstance()

const API = {
  list: null,
  add: null,
  update: null,
  del: null,
  detail: null,
  enable: null,
  deactivate: null,
  export: null,
  download: exportTemplateExcel,
}

const {
  exportData,
  downloadTemplate
} = useUpload(API, 'fundsChequeTypeImportTemplate', '/business/paymentOrder/import/excel', () => getList(), 'tree:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'tree',
  type: '14004',
  action: '/cheque/type/import/excelRecord'
})

const treeBtnInfo = ref({
  title: '差异分析项目',
  btnList: [
    {
      type: 'button',
      label: '新增',
      disabled: false,
      event: addNewData,
      show: proxy.$permission('tree:add'),
    },
    {
      type: 'button',
      label: '删除',
      disabled: true,
      event: deleteClick,
      show: proxy.$permission('tree:delete'),
    },
    {
      type: 'button',
      label: '启用',
      disabled: true,
      event: Enable,
        show: proxy.$permission('tree:enable'),
    },
    {
      type: 'button',
      label: '停用',
      disabled: true,
      event: Deactivate,
      show: proxy.$permission('tree:unenable'),
    },
    {
      type: 'button',
      label: '下载模板',
      show: proxy.$permission('tree:download'),
      event: () => downloadTemplate('票据类型模板', 'tree:download'),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出',
      show: proxy.$permission('tree:export'),
      event: () => exportData({}),
    },
  ]
})
const menuTree = ref()
const states = ref({
  dialogVisible: false,
  row: null
})
const treeInfo = ref({
  defaultProps: {
    children: 'children',
    label: (data, node) => { return data.code ? `${data.code}-${data.name}` : data.name },
  },
  expandOnClickNode: false,
  defaultExpandAll: true,
  current: null,
  filterText: '',
  data: [
    {
      id: '-2', code: '', name: '票据类型', children: []
    }
  ]
})

const formInfo = ref({
  ref: null,
  options: [],
  query: {
    name: "",
    enableStatus: '1'
  },
  data: {
  },
  fieldList: [
    { label: '票据类型编码', disabled: true, value: 'code', type: 'input' },
    { label: '票据类型名称',  value: 'name', type: 'input' },
    { label: '启用状态', value: 'enableStatus', type: 'select-model', code: 'enabled_type', disabled: true },
    { label: '创建组织',  value: 'orgName', type: 'input', disabled: true },
    { label: '备注',  value: 'remark', type: 'textarea' },
  ],
  disabled: true,
  rules: {
    code: [{ required: true, message: '请输入票据类型编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入票据类型名称', trigger: 'blur' }],
  },
})
// 右侧按钮配置
const filterInfo = ref({
  btnList: [
    {
      type: 'button',
      label: '保存',
      show: true,
      event: () => save(),
    },
  ],
})

onMounted(() => {
  // getList()
})

function getList() {
  API.list({}).then(res => {
    treeInfo.value.data[0].children = res?.data || []
  })
}

function addNewData() {
  states.value.dialogVisible = true;
}

function save() {
  formInfo.value.ref.validate(flag => {
    if (flag) {
      const api = formInfo.value.data.id ? API.update : API.add
      api(formInfo.value.data).then(async res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          await getList()
          function findNode(nodes, code) {
            const node = nodes.find(_node => _node.code === code)
            if (node) return node
            for (const index in nodes) {
              const node = findNode(nodes[index].children || [], code)
              if (node) return node
            }
            return undefined
          }
          await handleNodeClick(findNode(treeInfo.value.data, formInfo.value.data.code))
        }
      })
    }
  })
}

function getNodeData(node) {
  if (!node || node.id === '-2') return states.value.row = null
  states.value.row = node
  API.detail(node.id).then(res => {
    treeInfo.value.current = res.data
    formInfo.value.data = res.data
    treeInfo.value.currentNodeKey = res.data.id
    const del = treeBtnInfo.btnList.filter(it => it.label === '删除')[0]
    const enable = treeBtnInfo.btnList.filter(it => it.label === '启用')[0]
    const unenable = treeBtnInfo.btnList.filter(it => it.label === '停用')[0]
    del.disabled = enable.disabled = res.data.enableStatus === '1'
    unenable.disabled = res.data.enableStatus !== '1'
  })
}
function handleSearch() {
  menuTree.value.filter(formInfo.value.query.name);
}
function filterNode(value, data) {
  const NAME = data.name + data.code + ''
  return NAME.includes(value);
}

function handleNodeClick(data) {
  getNodeData(data)
}

// 启用
async function Enable() {
  if(!states.value.row) return
  const { code } = await API.enable([states.value.row.id])
  if (code === 200) {
    proxy.$message.success('启用成功')
    await getNodeData(states.value.row)
  }
}
// 停用
async function Deactivate() {
  if(!states.value.row) return
  const { code } = await API.deactivate([states.value.row.id])
  if (code === 200) {
    proxy.$message.success('停用成功')
    await getNodeData(states.value.row)
  }
}

function deleteClick() {
  const ids = states.value.row ? [states.value.row.id] : []
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.del(ids).then(async ({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        await getList()
      }
    })
  })
}
function diaLogeCallback(flag) {
  states.value.dialogVisible = false
  if (flag) {
    getList()
  }
}
</script>
