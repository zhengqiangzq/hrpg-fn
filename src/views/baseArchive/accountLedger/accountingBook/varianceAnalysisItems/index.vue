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
            v-model="treeInfo.query.keyword"
            :clearable="true"
            placeholder="请输入名称"
            class="show-placeholder flex"
            @keyup.enter.native="treeSearch"
          >
            <template #suffix>
              <i
                class="el-icon-search"
                @click="treeSearch"
                style="display: flex; align-items: center"
                ><el-icon><Search /></el-icon
              ></i>
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
            :default-checked-keys="[treeInfo.checked]"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container">
        <div class="slipui-card-body firstCard">
          <div
            class="slipui-btn-container border-style-bottom rightContainerTitleBox"
          >
            <div class="rightContainerTitle">差异分析项目详情</div>
            <el-button type="primary" @click="save" :disabled="nodeStatus"
              >保存</el-button
            >
          </div>
          <div>
            <page-form
              class="paddingBox order-model-formBox flex_wrap_start_start"
              ref="formRef"
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
    </div>
    <PageDialog
      :title="addInfo.title"
      :visible="addInfo.visible"
      :btList="addInfo.btList"
      @reset="goback"
    >
      <!-- 条件栏 -->
      <page-form
        ref="pageformRef"
        className="paddingBox order-model-formBox flex_wrap_start_start"
        v-model:ref-obj="addInfo.ref"
        :data="addInfo.data"
        :field-list="addInfo.fieldList"
        :rules="addInfo.rules"
        :label-width="addInfo.labelWidth"
      >
      </page-form>
    </PageDialog>
    <UploadExcel
      v-if="uploadExcelInfo.visible"
      v-model:showDialog="uploadExcelInfo.visible"
      type="260207"
      btnCode="varianceAnalysisItems:import"
      action="/base/diffanalyItem/importExcel"
    ></UploadExcel>
    <UploadLog
      v-if="uploadLogInfo.visible"
      v-model:showDialog="uploadLogInfo.visible"
      :query="uploadLogInfo.query"
    ></UploadLog>
  </div>
</template>

<script setup name="varianceAnalysisItems">
// 导入
import PageDialog from '@/components/PageDialog/index.vue'

import {
  varianceAnalysisAdd,
  varianceAnalysisUpdate,
  varianceAnalysisTreeList,
  varianceAnalysisGetbyId,
  varianceAnalysisDelete,
  varianceAnalysisEnable,
  varianceAnalysisDisable,
  varianceAnalysisExcel,
  exportTemplateExcel,
} from '@/api/base'
// 获取 proxy
const { proxy } = getCurrentInstance()
//
const nodeStatus = computed(() => {
  if (state.value.treeRow) {
    return state.value.treeRow.status === '1'
  } else {
    return true
  }
})
const canEnable = computed(() => {
  if (state.value.treeRow?.status) {
    return state.value.treeRow?.status === '1'
  } else {
    return true
  }
})
const canDisable = computed(() => {
  if (state.value.treeRow?.status) {
    return state.value.treeRow?.status === '0'
  } else {
    return true
  }
})

// 响应式数据
const state = ref({
  categoryId: '',
  treeRow: null,
})

const uploadExcelInfo = ref({
  visible: false,
})

const uploadLogInfo = ref({
  visible: false,
  query: {
    type: '260207',
  },
})

// 树配置
const treeInfo = ref({
  data: [],
  query: {
    keyword: '',
  },
  nodeKey: 'code',
  treeData: [],
  checked: [],
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
  title: '差异分析项目',
  btnList: [
    {
      type: 'button',
      label: '新增',

      show: proxy.$permission('varianceAnalysisItems:add'),
      event: addItem,
    },
    {
      type: 'button',
      label: '删除',

      show: proxy.$permission('varianceAnalysisItems:delete'),
      event: deleteItem,
      disabled: canEnable,
    },
    {
      type: 'button',
      label: '启用',

      show: proxy.$permission('varianceAnalysisItems:enable'),
      event: enabled,
      disabled: canEnable,
    },
    {
      type: 'button',
      label: '停用',

      show: proxy.$permission('varianceAnalysisItems:disable'),
      event: disable,
      disabled: canDisable,
    },
    {
      type: 'button',
      label: '导出',
      show: proxy.$permission('varianceAnalysisItems:export'),

      event: exportExcel,
    },
    {
      type: 'button',
      label: '下载导入模板',
      show: proxy.$permission('varianceAnalysisItems:importTemp'),

      event: exportTemptate,
    },
    {
      type: 'button',
      label: '导入',
      show: proxy.$permission('varianceAnalysisItems:import'),

      event: importExcel,
    },
    {
      type: 'button',
      label: '导入日志',
      show: proxy.$permission('varianceAnalysisItems:import'),

      event: importLog,
    },
  ],
})

// 表单配置
const formInfo = ref({
  ref: null,
  data: {
    diffanalyType: '1',
    status: '1',
  },
  labelWidth: '160px',
  fieldList: [
    {
      label: '差异分析项目编码',
      value: 'code',
      type: 'input',
      required: true,
    },
    {
      label: '现金流量项目名称',
      value: 'name',
      type: 'input',
      required: true,
    },
    {
      label: '所属上级项目',
      value: 'pname',
      type: 'input',
      disabled: true,
    },
    {
      label: '差异类型',
      value: 'diffanalyType',
      type: 'select-model',
      code: 'diffanaly_type',
    },
    {
      label: '增减属性',
      value: 'adjustAttributes',
      type: 'select-model',
      code: 'adjust_attributes',
    },
    {
      label: '启用状态',
      value: 'status',
      type: 'select-model',
      code: 'enabled_type',
      disabled: true,
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
        message: '请输入现金流量项目编码',
        trigger: 'blur',
      },
    ],
    name: [
      {
        required: true,
        message: '请输入现金流量项目名称',
        trigger: 'blur',
      },
    ],
    diffanalyType: [
      {
        required: true,
        message: '请选择差异类型',
        trigger: 'change',
      },
    ],
    adjustAttributes: [
      {
        required: true,
        message: '请选择增减属性',
        trigger: 'change',
      },
    ],
  },
})

// 弹窗配置
const addInfo = ref({
  visible: false,
  ref: null,
  title: '',
  data: {
    diffanalyType: '1',
    status: '1',
  },
  fieldList: [
    {
      label: '差异分析项目编码',
      value: 'code',
      type: 'input',
      required: true,
    },
    {
      label: '现金流量项目名称',
      value: 'name',
      type: 'input',
      required: true,
    },
    {
      label: '所属上级项目',
      value: 'pname',
      type: 'input',
      disabled: true,
    },
    {
      label: '差异类型',
      value: 'diffanalyType',
      type: 'select-model',
      code: 'diffanaly_type',
    },
    {
      label: '增减属性',
      value: 'adjustAttributes',
      type: 'select-model',
      code: 'adjust_attributes',
    },
    {
      label: '启用状态',
      value: 'status',
      type: 'select-model',
      code: 'enabled_type',
      disabled: true,
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
        message: '请输入现金流量项目编码',
        trigger: 'blur',
      },
    ],
    name: [
      {
        required: true,
        message: '请输入现金流量项目名称',
        trigger: 'blur',
      },
    ],
    diffanalyType: [
      {
        required: true,
        message: '请选择差异类型',
        trigger: 'change',
      },
    ],
    adjustAttributes: [
      {
        required: true,
        message: '请选择增减属性',
        trigger: 'change',
      },
    ],
  },
  btList: [
    {
      type: 'primary',

      show: proxy.$permission('varianceAnalysisItems:add'),
      label: '确定',
      event: addSave,
    },
    { type: 'button', show: true, label: '取消', event: goback },
  ],
})

// 生命周期钩子
onMounted(() => {
  getTree()
})

async function getList(id) {
  if (!id) return
  await varianceAnalysisGetbyId(id).then((res) => {
    if (res.code === 200) {
      formInfo.value.data = { ...res.data }
      state.value.treeRow = { ...res.data }
    }
  })
}

// ========== 树相关方法 ==========
async function getTree() {
  const { data, code, msg } = await varianceAnalysisTreeList(
    {},
    'varianceAnalysisItems:list',
  )
  if (code === 200) {
    treeInfo.value.data = [
      {
        children: [...data],
        code: '',
        name: '差异分析项目',
        id: '-2',
      },
    ]
  }
}

async function handleNodeClick(node) {
  state.value.categoryId = node.id
  if (['-2'].includes(node.id)) {
    state.value.treeRow = ''
    formInfo.value.data = {
      diffanalyType: '1',
      status: '1',
    }
    return
  }
  await varianceAnalysisGetbyId(node.id).then((res) => {
    if (res.code === 200) {
      formInfo.value.data = { ...res.data }
      state.value.treeRow = { ...res.data }
    }
  })
}
function filterNode(value, data) {
  return data.name?.includes(value) ?? false
}

function treeSearch() {
  proxy.$refs.treeRef.filter(treeInfo.value.query.keyword)
}

// ========== 增删改查方法 ==========
function addItem() {
  addInfo.value.title = '新增差异分析项目'
  addInfo.value.data = {
    diffanalyType: '1',
    status: '1',
  }
  if (state.value.treeRow && state.value.treeRow.id !== '-2') {
    addInfo.value.data['pid'] = state.value.treeRow.id
    addInfo.value.data['pname'] = state.value.treeRow.name
  }
  addInfo.value.visible = true
}

function enabled() {
  varianceAnalysisEnable(
    state.value.treeRow.id,
    'varianceAnalysisItems:enabled',
  ).then((res) => {
    if (res.code === 200) {
      proxy.$message.success('启用成功')
      getTree()
      getList(state.value.treeRow.id)
    }
  })
}

function disable() {
  varianceAnalysisDisable(
    state.value.treeRow.id,
    'varianceAnalysisItems:disable',
  ).then((res) => {
    if (res.code === 200) {
      proxy.$message.success('停用成功')
      getTree()
      getList(state.value.treeRow.id)
    }
  })
}

function deleteItem() {
  proxy
    .$confirm('删除后将改变数据,是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      varianceAnalysisDelete(
        state.value.treeRow.id,
        'varianceAnalysisItems:delete',
      ).then((res) => {
        if (res.code === 200) {
          proxy.$message.success('删除成功')
          state.value.categoryId = ''
          state.value.treeRow = ''
          getTree()
          getList(state.value.treeRow.id)
        }
      })
    })
}

function save() {
  formInfo.value.ref.validate((valid) => {
    if (valid) {
      let params = { ...formInfo.value.data }
      varianceAnalysisUpdate(params, 'varianceAnalysisItems:update').then(
        (res) => {
          if (res.code === 200) {
            proxy.$message.success('保存成功')
            getTree()
            getList(state.value.treeRow.id)
          }
        },
      )
    }
  })
}
function addSave() {
  addInfo.value.ref.validate((valid) => {
    if (valid) {
      let params = { ...addInfo.value.data }
      varianceAnalysisAdd(params, 'varianceAnalysisItems:add').then((res) => {
        if (res.code === 200) {
          proxy.$message.success('保存成功')
          addInfo.value.visible = false
          getTree()
        }
      })
    }
  })
}

function goback(raw) {
  addInfo.value.visible = false
  // if (!raw) return
  // getTree()
}

// ========== 导入导出方法 ==========
function importExcel() {
  uploadExcelInfo.value.visible = true
}
function importLog() {
  uploadLogInfo.value.visible = true
}
function exportExcel() {
  varianceAnalysisExcel({}, 'varianceAnalysisItems:export').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function exportTemptate() {
  let fileName = '差异分析项目导入模板'
  exportTemplateExcel(fileName).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
</script>

<style scoped></style>
