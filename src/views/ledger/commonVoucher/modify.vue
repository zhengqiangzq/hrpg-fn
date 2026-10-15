<template>
  <div class="app-container-flex">
    <NewFullScreen
      v-model="showDialog"
      :title="title"
      :needReturn="!flowFormType"
    >
      <template v-slot:full-button>
        <el-button v-if="!flowFormType" type="primary" @click="save()">
          保存
        </el-button>
      </template>
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
          />
        </div>
      </div>
      <div class="model-panel">
        <div class="model-panel-title">
          <p>分录明细</p>
        </div>
        <div class="model-panel-body">
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
          <div class="flex_full_item">
            <el-form
              ref="tableForm"
              :model="tableInfo.data"
              style="width: 100%"
            >
              <page-table
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :api="tableInfo.api"
                :pager="false"
                :tabIndex="true"
                :isRowClickSelect="false"
                :query="filterInfo.query"
                :field-list="tableInfo.fieldList"
                :handle="tableInfo.handle"
                :isDynamic="true"
                @handleEvent="handleEvent"
              >
                <template v-slot:col-explanation="scope">
                  <el-form-item
                    v-if="scope.$index >= 0"
                    :prop="`${scope.$index}.explanation`"
                    :rules="
                      scope.$index >= 0
                        ? [
                            {
                              required: true,
                              message: '请输入摘要',
                              trigger: 'blur',
                            },
                          ]
                        : []
                    "
                  >
                    <el-input v-model="scope.row.explanation" maxlength="200" />
                  </el-form-item>
                </template>
                <template v-slot:col-accountName="scope">
                  <el-form-item
                    v-if="scope.$index >= 0"
                    :prop="`${scope.$index}.accountName`"
                    :rules="
                      scope.$index >= 0
                        ? [
                            {
                              required: true,
                              message: '请输入摘要',
                              trigger: 'change',
                            },
                          ]
                        : []
                    "
                  >
                    <el-input
                      v-model="scope.row.accountName"
                      class="not-mongolia"
                      style="width: 100%"
                      disabled
                      placeholder="请选择会计科目"
                    >
                      <template #append>
                        <el-icon @click="selectSubject(scope.$index)">
                          <Search />
                        </el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-slot:col-assName="scope">
                  <el-form-item
                    v-if="scope.$index >= 0"
                    :prop="`${scope.$index}.assName`"
                    :rules="
                      scope.$index >= 0
                        ? [
                            {
                              required: true,
                              message: '请选择辅助核算',
                              trigger: 'change',
                            },
                          ]
                        : []
                    "
                  >
                    <el-input
                      v-model="scope.row.assName"
                      :class="scope.row.accountName ? 'not-mongolia' : ''"
                      style="width: 100%"
                      :required="true"
                      disabled
                      placeholder="请选择辅助核算"
                    >
                      <template #append>
                        <el-icon
                          @click="selectAuxiliary(scope.$index, scope.row)"
                        >
                          <Search />
                        </el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-slot:col-debitAmount="scope">
                  <el-form-item
                    v-if="scope.$index >= 0"
                    :prop="`${scope.$index}.debitAmount`"
                  >
                    <el-input-number
                      v-model="scope.row.debitAmount"
                      :precision="2"
                      :min="-999999999999"
                      :max="999999999999"
                      controls-position="right"
                      style="width: 100%"
                      @change="onDebitChange(scope.row)"
                    />
                  </el-form-item>
                </template>
                <template v-slot:col-creditAmount="scope">
                  <el-form-item
                    v-if="scope.$index >= 0"
                    :prop="`${scope.$index}.creditAmount`"
                  >
                    <el-input-number
                      v-model="scope.row.creditAmount"
                      :precision="2"
                      :min="-999999999999"
                      :max="999999999999"
                      controls-position="right"
                      style="width: 100%"
                      @change="onCreditChange(scope.row)"
                    />
                  </el-form-item>
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

<script setup name="commonVoucherModify">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useSelectData } from '@/hooks/useSelectData'
import {
  commonVoucherCreate,
  commonVoucherUpdate,
  commonVoucherGetbyId,
} from '@/api/ledger/commonVoucher'

const { proxy } = getCurrentInstance()
const { selectorInfo, selectorRef } = useSelectData()
const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '修改常用凭证',
  },
  id: {
    type: [Number, String],
  },
  flowFormType: {
    type: String,
  },
})
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig

let _index = ref('')
const formRefs = ref([])
const canDelete = computed(() => {
  return tableInfo.value.selections.length === 0
})
const dialogInfo = ref({
  visible: false,
  title: '辅助核算',
  btLoading: false,
  flag: true,
  tableData: [],
  data: {},
})
const formInfo = ref({
  ref: null,
  disabled: false,
  data: {},
  fieldList: [
    {
      label: '核算账簿',
      value: 'accbookName',
      asValue: 'accbookId',
      type: 'select-data-custom',
      selectDataType: 'accountingBook',
      required: true,
      query: {
        status: '1',
      },
    },
    {
      label: '常用凭证编码',
      value: 'code',
      type: 'input',
      required: true,
    },
    {
      label: '常用凭证名称',
      value: 'name',
      type: 'input',
      required: true,
    },
    {
      label: '常用凭证属性',
      value: 'property',
      type: 'select-model',
      code: 'summary_type',
      required: true,
    },
    {
      label: '凭证类别',
      value: 'voucherTypeName',
      asValue: 'voucherTypeId',
      type: 'select-data-custom',
      selectDataType: 'voucherType',
      required: true,
      // query:{
      //   status:'1',
      // }
    },
  ],
  rules: {
    accbookName: [
      { required: true, message: '请选择核算账簿', trigger: 'change' },
    ],
    code: [{ required: true, message: '请输入常用凭证编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入常用凭证名称', trigger: 'blur' }],
    property: [
      { required: true, message: '请选择常用凭证属性', trigger: 'change' },
    ],
    voucherTypeName: [
      { required: true, message: '请选择凭证类别', trigger: 'change' },
    ],
  },
  labelWidth: '140px',
})

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  selections: [],
  fieldList: [
    {
      label: '摘要',
      value: 'explanation',
      type: 'slot',
    },
    {
      label: '会计科目',
      value: 'accountName',
      type: 'slot',
    },
    {
      label: '辅助核算',
      value: 'assName',
      type: 'slot',
    },
    {
      label: '借方',
      value: 'debitAmount',
      type: 'slot',
    },
    {
      label: '贷方',
      value: 'creditAmount',
      type: 'slot',
    },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '80',
    btList: [
      {
        label: '删除',
        event: delRow,
        show: true,
      },
    ],
  },
})

const filterInfo = ref({
  btnList: [
    {
      type: 'button',
      label: '新增行',
      event: addRow,
      disabled: computed(() => !formInfo.value.data.accbookId),
    },
    {
      type: 'button',
      label: '删除行',
      event: removeRows,
      disabled: canDelete,
    },
  ],
})
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    if (userInfo) {
      formInfo.value.data.accbookId = userInfo.accbookId
      formInfo.value.data.accbookName = userInfo.accbookName
    }
  }
})

function getMain() {
  commonVoucherGetbyId(props.id, 'commonVoucher:detail').then((res) => {
    if (res && res.success) {
      formInfo.value.data = res.data
      tableInfo.value.data = res.data.detailVOList
    }
  })
}

function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}

function addRow() {
  tableInfo.value.data.push({
    explanation: '',
    accountName: '',
    assName: '',
    debitAmount: null,
    creditAmount: null,
  })
}

function removeRows() {
  tableInfo.value.data = tableInfo.value.data.filter(
    (row) => !tableInfo.value.selections.includes(row),
  )
}
function delRow(row) {
  tableInfo.value.data = tableInfo.value.data.filter((item) => item !== row)
}

function selectSubject(index) {
  _index.value = index
  selectorInfo.type = 'Account'
  selectorInfo.query = {
    accbookId: formInfo.value.data.accbookId,
    status: '1',
    isLastVersion: true,
  }
  selectorInfo.clickParams = 'id'
  selectorInfo.code = 'id'
  selectorInfo.callback = handleAccountSelected
  selectorInfo.visible = true
}
/** 科目选择回调 */
function handleAccountSelected(row) {
  tableInfo.value.data[_index.value].accasoaOriginalId = row.originalId
  tableInfo.value.data[_index.value].accountName = row.code + ' ' + row.name
}
function selectAuxiliary(index, row) {
  _index.value = index
  const currentName = row.accountName
  if (!currentName) return
  if (row.assVOList) {
    row.assVOList.forEach((it) => {
      it['assName'] = `${it.assValueCode} ${it.assValueName}`
    })
  }

  dialogInfo.value.tableData = row.assVOList || []
  dialogInfo.value.data.accbookId = formInfo.value.data.accbookId || ''
  // 当前操作的是 source：只有当 sourceAssValue 为空时，才取 source 的原始 ID
  dialogInfo.value.id = row.accasoaOriginalId
  dialogInfo.value.visible = true
}
// 借方和贷方互斥：输入借方清空贷方，输入贷方清空借方
function onDebitChange(row) {
  if (Number(row.debitAmount) !== 0) {
    row.creditAmount = null
  }
}
function onCreditChange(row) {
  if (Number(row.creditAmount) !== 0) {
    row.debitAmount = null
  }
}
function save() {
  formRefs.value = [
    proxy.$refs['modifyForm'].$refs['form'],
    proxy.$refs['tableForm'],
  ]
  proxy.$fn.checkForm(formRefs.value).then(() => {
    if (tableInfo.value.data.length === 0) {
      proxy.$message.warning('请添加分录明细')
      return
    }
    let isSave = tableInfo.value.data.every((it, index) => {
      if (!it.debitAmount && !it.creditAmount) {
        proxy.$message.warning(`第${index + 1}行借贷必填一方！`)
        return false
      }
      return true
    })
    if (!isSave) return
    let params = {
      ...formInfo.value.data,
      detailVOList: tableInfo.value.data.map((it, index) => ({
      ...it, // 展开原始行数据
      detailIndex: index + 1, // 动态注入明细序号
      sortNum: index + 1      // 动态注入排序号
    }))
    }
    let api = props.id ? commonVoucherUpdate : commonVoucherCreate
    let btnCode = props.id ? 'commonVoucher:update' : 'commonVoucher:add'
    api(params, btnCode).then((resp) => {
      if (resp && resp.success) {
        proxy.$message.success('保存成功')
        showDialog.value = false
        emit('returnModify', false)
      }
    })
  })
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
  const assField = 'assVOList'
  const assValueField = 'assName'
  tableInfo.value.data[_index.value][assField] = [...arr]
  tableInfo.value.data[_index.value][assValueField] = strArr.join(',')
  dialogInfo.value.visible = false
}
defineExpose({
  save,
})
</script>
