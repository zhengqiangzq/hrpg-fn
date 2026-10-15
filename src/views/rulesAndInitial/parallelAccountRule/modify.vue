<template>
  <div class="app-container-flex">
    <NewFullScreen
      v-model="showDialog"
      :title="title"
      :needReturn="!flowFormType"
    >
      <template v-slot:full-button>
        <el-button v-if="!flowFormType" type="primary" @click="save()"
          >保存</el-button
        >
      </template>

      <!-- 基本信息 -->
      <div class="model-panel">
        <div class="model-panel-title">
          <p>基本信息</p>
        </div>
        <div class="model-panel-body">
          <page-form
            ref="modifyForm"
            class="paddingBox order-model-formBox flex_wrap_start_start"
            v-model:ref-obj="formInfo.ref"
            :disabled="formInfo.disabled"
            :data="formInfo.data"
            :field-list="formInfo.fieldList"
            :rules="formInfo.rules"
            :label-width="formInfo.labelWidth"
            @handleEvent="handleEventForm"
          >
            <template v-slot:form-accbookName>
              <el-input
                v-model="formInfo.data.accbookName"
                style="width: 100%"
                class="not-mongolia"
                type="input"
                :disabled="true"
                placeholder="请选择核算账簿"
              >
                <template #append>
                  <el-icon @click="selectAccountBook">
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </template>
          </page-form>
        </div>
      </div>

      <!-- 对照信息 -->
      <div class="model-panel">
        <div class="model-panel-title">
          <p>对照关系</p>
        </div>
        <div class="model-panel-body">
          <!-- 条件栏 -->
          <new-page-filter :filter-btn="filterInfo.list" />
          <div class="flex_full_item">
            <el-form :model="tableInfo" ref="tableForm" style="width: 100%">
              <!-- 表格 -->
              <page-table
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :api="tableInfo.api"
                :pager="false"
                :tabIndex="true"
                :isRowClickSelect="false"
                :field-list="tableInfo.fieldList"
                :handle="tableInfo.handle"
                :isDynamic="true"
                @handleEvent="handleEvent"
              >
                <template v-slot:col-sourceAccasoaName="scope">
                  <el-form-item
                    v-if="scope.$index >= 0"
                    :prop="`data.${scope.$index}.sourceAccasoaName`"
                    :rules="[
                      {
                        required: true,
                        message: `请选择来源科目`,
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-input
                      v-model="scope.row.sourceAccasoaName"
                      class="not-mongolia"
                      style="width: 100%"
                      :required="true"
                      disabled
                      placeholder="请选择来源科目"
                    >
                      <template #append>
                        <el-icon
                          @click="
                            handleSelectAccount('sourceAss', scope.$index)
                          "
                        >
                          <Search />
                        </el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-slot:col-sourceAssValue="scope">
                  <el-input
                    v-model="scope.row.sourceAssValue"
                    :class="scope.row.sourceAccasoaName ? 'not-mongolia' : ''"
                    style="width: 100%"
                    :required="true"
                    disabled
                    placeholder="请选择来源辅助核算"
                  >
                    <template #append>
                      <el-icon
                        @click="
                          handleSelectAuxiliary(
                            'sourceAss',
                            scope.$index,
                            scope.row,
                          )
                        "
                      >
                        <Search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <template v-slot:col-targetAccasoaName="scope">
                  <el-form-item
                    v-if="scope.$index >= 0"
                    :prop="`data.${scope.$index}.targetAccasoaName`"
                    :rules="[
                      {
                        required: true,
                        message: `请选择目的科目`,
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-input
                      v-model="scope.row.targetAccasoaName"
                      class="not-mongolia"
                      style="width: 100%"
                      :required="true"
                      disabled
                      placeholder="请选择目的科目"
                    >
                      <template #append>
                        <el-icon
                          @click="
                            handleSelectAccount('targetAss', scope.$index)
                          "
                        >
                          <Search />
                        </el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-slot:col-targetAssValue="scope">
                  <el-input
                    v-model="scope.row.targetAssValue"
                    :class="scope.row.targetAccasoaName ? 'not-mongolia' : ''"
                    style="width: 100%"
                    :required="true"
                    disabled
                    placeholder="请选择辅助核算"
                  >
                    <template #append>
                      <el-icon
                        @click="
                          handleSelectAuxiliary(
                            'targetAss',
                            scope.$index,
                            scope.row,
                          )
                        "
                      >
                        <Search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
              </page-table>
            </el-form>
          </div>
        </div>
      </div>
    </NewFullScreen>
    <select-data ref="selectorRef" />
    <sup-account-dialog
      v-if="dialogInfo.visible"
      v-model:visible="dialogInfo.visible"
      :bt-loading="dialogInfo.btLoading"
      :id="dialogInfo.id"
      :table-data="dialogInfo.tableData"
      :data="dialogInfo.data"
      @callback="goback"
    />
  </div>
</template>

<script setup name="parallelAccountRuleModify">
import {
  parallelAccountRuleGetbyId,
  parallelAccountRuleUpdate,
  parallelAccountRuleCreate,
} from '@/api/rulesAndInitial/parallelAccountRule'
import { useSelectData } from '@/hooks/useSelectData'

// ---- 基础 ----
const { proxy } = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '修改平行账簿规则',
  },
  id: {
    type: Number,
  },
  flowFormType: {
    type: String,
  },
})
const { selectorInfo, selectorRef } = useSelectData()
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
let selectAss = ref('')
let _index = ref('')
//辅助核算List
const supAccList = ref({
  fieldList: [],
})

// ---- 表单 ----
const formInfo = ref({
  ref: null,
  defaultList: [],
  data: {},
  fieldList: [
    {
      label: '核算账簿',
      value: 'accbookName',
      type: 'slot',
      required: true,
    },
    {
      label: '规则编码',
      value: 'code',
      type: 'input',
    },
    {
      label: '规则名称',
      value: 'name',
      type: 'input',
    },
    {
      label: '规则类型',
      value: 'type',
      type: 'select-model',
      code: 'parallel_rule_type',
      event: 'typeChange',
    },
    {
      label: '分录生成规则',
      value: 'genRule',
      type: 'select-model',
      code: 'parallel_detail_create_rule',
    },
    {
      label: '规则说明',
      value: 'remark',
      type: 'textarea',
      maxlength: 200,
    },
  ],
  rules: {
    accbookName: [
      { required: true, message: '请选择核算账簿', trigger: 'blur' },
    ],
    code: [{ required: true, message: '请输入规则编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  },
  labelWidth: '120px',
})
const formRefs = ref([])

// ---- 过滤 ----
const filterInfo = ref({
  list: [
    {
      label: '新增行',
      type: 'button',
      event: addRow,
      disabled: () => !formInfo.value.data.accbookId,
    },
    {
      label: '删除行',
      type: 'button',
      disabled: () => !tableInfo.value.selections.length,
      event: removeRows,
    },
  ],
})

// ---- 表格 ----
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  data: [],
  selections: [],
  fieldList: [
    {
      label: '来源科目',
      value: 'sourceAccasoaName',
      type: 'slot',
    },
    {
      label: '来源辅助核算',
      value: 'sourceAssValue',
      type: 'slot',
    },
    {
      label: '来源方向',
      value: 'sourceDirection',
      type: 'select-model',
      code: 'accounting_account_direction',
    },
    {
      label: '目的科目',
      value: 'targetAccasoaName',
      type: 'slot',
    },
    {
      label: '目的辅助核算',
      value: 'targetAssValue',
      type: 'slot',
    },
    {
      label: '目的方向',
      value: 'targetDirection',
      type: 'select-model',
      code: 'accounting_account_direction',
    },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '120',
    btList: [
      {
        label: '删除',
        event: removeRow,
        show: true,
      },
    ],
  },
})
const dialogInfo = ref({
  visible: false,
  title: '辅助核算',
  btLoading: false,
  flag: true,
  tableData: [],
  data: {},
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

// ---- 生命周期 ----
onMounted(() => {
  if (props.id) {
    getDetail()
    getList()
  } else {
    if (userInfo) {
      formInfo.value.data.accbookId = userInfo.accbookId
      formInfo.value.data.accbookName = userInfo.accbookName
    }
  }
})

// ---- 数据加载 ----
/** 获取详情 */
function getDetail() {
  parallelAccountRuleGetbyId(props.id, 'parallelAccountRule:detail').then(
    (res) => {
      if (res && res.success) {
        formInfo.value.data = res.data
        tableInfo.value.data = res.data.detailVOList
      }
    },
  )
}

/** 刷新表格 */
function getList() {
  tableInfo.value.refresh = Math.random()
}

// ---- 保存 / 提交 ----
/** 保存（外部流程页面亦通过此方法提交） */
function save(isSaveAndSubmit, obj = {}) {
  formRefs.value=[
    proxy.$refs['modifyForm'].$refs['form'],
    proxy.$refs['tableForm'],
  ]
  proxy.$fn.checkForm(formRefs.value).then(() => {
    if (tableInfo.value.data.length === 0) {
      proxy.$message.warning('请添加对照关系')
      return
    }
    const params = {
      ...formInfo.value.data,
    }
    let api = params.id ? parallelAccountRuleUpdate : parallelAccountRuleCreate
    let btnCode = params.id ? ':update' : ':add'
    params.detailVOList = tableInfo.value.data

    api(params, 'parallelAccountRule' + btnCode).then((resp) => {
      if (resp && resp.success) {
        proxy.$message.success('保存成功')
        showDialog.value = false
        emit('returnModify', false)
      }
    })
  })
}

/** 保存并提交（流程页面调用） */
function saveAndSubmit(flowData) {
  save(true, flowData)
}

// ---- 表格行操作 ----
/** 新增行 */
function addRow() {
  tableInfo.value.data.push({})
}

/** 批量删除选中行 */
function removeRows() {
  tableInfo.value.data = tableInfo.value.data.filter(
    (row) => !tableInfo.value.selections.includes(row),
  )
}

/** 删除单行（操作列） */
function removeRow(row) {
  tableInfo.value.data = tableInfo.value.data.filter((item) => item !== row)
}

/** 表格事件 */
function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}
function handleEventForm(event, data) {
  console.log(event, data)
  switch (event) {
    case 'typeChange':
      tableInfo.value.data = []
      break
  }
}
function selectAccountBook() {
  selectorInfo.type = 'accountingBook'
  selectorInfo.callback = bookBack
  selectorInfo.visible = true
  selectorInfo.query = {
    status: '1',
  }
}
function bookBack(row) {
  if (row.id) {
    formInfo.value.data['accbookId'] = row.id
    formInfo.value.data.accbookName = row.code + ' ' + row.name
  } else {
    formInfo.value.data.accbookId = ''
    formInfo.value.data.accbookName = ''
  }
  tableInfo.value.data = []
}
// ---- 选择器 ----
/** 打开科目选择（来源 / 目的('sourceAss'/'targetAss')共用） */
function handleSelectAccount(code, index) {
  selectAss.value = code
  _index.value = index
  selectorInfo.type = 'Account'
  selectorInfo.query = {
    accbookId: formInfo.value.data.accbookId,
    status: '1',
    isLastVersion: true,
  }
  const isSource = code === 'sourceAss'
  const isFn = formInfo.value.data.type == '1'
  if (isSource) {
    // source 的属性与 type 保持一致
    selectorInfo.query['accAttribute'] = isFn ? '1' : '2'
  } else {
    // target 的属性与 type 相反
    selectorInfo.query['accAttribute'] = isFn ? '2' : '1'
  }

  selectorInfo.clickParams = 'id'
  selectorInfo.code = 'id'
  selectorInfo.callback = handleAccountSelected
  selectorInfo.visible = true
}

/** 科目选择回调 */
function handleAccountSelected(row) {
  if (selectAss.value === 'sourceAss') {
    tableInfo.value.data[_index.value].sourceAccasoaOriginalId = row.originalId
    tableInfo.value.data[_index.value].sourceAccasoaName =
      row.code + ' ' + row.name
  } else {
    tableInfo.value.data[_index.value].targetAccasoaName =
      row.code + ' ' + row.name
    tableInfo.value.data[_index.value].targetAccasoaOriginalId = row.originalId
  }
  // 待实现
}

/** 打开辅助核算选择（来源 / 目的共用） */
function handleSelectAuxiliary(code, index, row) {
  const isSource = code === 'sourceAss'
  _index.value = index
  const currentName = isSource ? row.sourceAccasoaName : row.targetAccasoaName
  if (!currentName) return
  selectAss.value = code
  console.log('查看行是否有值，有值就不传id', row, dialogInfo.value)

  if (isSource) {
    if (row.sourceAssVOs) {
      row.sourceAssVOs.forEach((it) => {
        it['assName'] = `${it.assValueCode} ${it.assValueName}`
      })
    }
  } else {
    if (row.targetAssVOs) {
      row.targetAssVOs.forEach((it) => {
        it['assName'] = `${it.assValueCode} ${it.assValueName}`
      })
    }
  }
  dialogInfo.value.tableData = isSource
    ? row.sourceAssVOs || []
    : row.targetAssVOs || []
  dialogInfo.value.data.accbookId = formInfo.value.data.accbookId || ''
  if (isSource) {
    // 当前操作的是 source：只有当 sourceAssValue 为空时，才取 source 的原始 ID
    dialogInfo.value.id = !row.sourceAssValue
      ? row.sourceAccasoaOriginalId || ''
      : ''
  } else {
    // 当前操作的是 target：只有当 targetAssValue 为空时，才取 target 的原始 ID
    dialogInfo.value.id = !row.targetAssValue
      ? row.targetAccasoaOriginalId || ''
      : ''
  }
  dialogInfo.value.visible = true
}

/** 辅助核算选择回调 */
function goback(row) {
  const arr = []
  const strArr = []
  row.forEach((item) => {
    strArr.push(
      `【${item.accassitemName}:${item.assName ? item.assName : '~'}】`,
    )
    arr.push({
      accassitemCode: item.accassitemCode || '',
      accassitemName: item.accassitemName || '',
      assValueCode: item.assValueCode || '',
      assValueName: item.assValueName || '',
      accassitemId: item.accassitemId,
      assValue: item.assValue || '',
      assName: item.assName || '',
    })
  })
  const isSource = selectAss.value === 'sourceAss'
  const assVOsField = isSource ? 'sourceAssVOs' : 'targetAssVOs'
  const assValueField = isSource ? 'sourceAssValue' : 'targetAssValue'
  tableInfo.value.data[_index.value][assVOsField] = [...arr]
  tableInfo.value.data[_index.value][assValueField] = strArr.join(',')
  dialogInfo.value.visible = false
}
// 名称不要做改变，在流程引擎中需要通过 refs 进行调用
defineExpose({
  save,
  saveAndSubmit,
})
</script>

<style scoped></style>
