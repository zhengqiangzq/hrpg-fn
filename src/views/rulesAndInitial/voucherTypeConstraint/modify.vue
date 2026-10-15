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
            :data="formInfo.data"
            :field-list="formInfo.fieldList"
            :rules="formInfo.rules"
          >
          </page-form>
        </div>
      </div>
      <div class="model-panel">
        <div class="model-panel-title">
          <p>控制科目</p>
        </div>
        <div class="model-panel-body">
          <NewPageFilter :filter-btn="filterInfo.btnList"> </NewPageFilter>
          <div class="flex_full_item">
            <el-form :model="tableInfo" ref="tableForm" style="width: 100%">
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
              <template v-slot:col-accasoaName="scope">
                <el-form-item
                  v-if="scope.$index >= 0"
                  :prop="`data.${scope.$index}.accasoaName`"
                  :rules="[
                      {
                        required: true,
                        message: '请选择会计科目',
                        trigger: 'change',
                      },
                    ]"
                >
                  <el-input
                    class="not-mongolia"
                    :disabled="true"
                    v-model="scope.row.accasoaName"
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
            </page-table>
            </el-form>
          </div>
        </div>
      </div>
    </NewFullScreen>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="voucherTypeConstraintModify">
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useSelectData } from '@/hooks/useSelectData'
import {
  voucherTypeConstraintCreate,
  voucherTypeConstraintGetbyId,
  voucherTypeConstraintUpdate,
} from '@/api/rulesAndInitial/voucherTypeConstraint'
const { proxy } = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '修改凭证类型约束规则',
  },
  id: {
    type: [Number, String],
  },
  flowFormType: {
    type: String,
  },
  data: {
    type: Object,
    default: {},
  },
})
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const formRefs = ref([])
let _index = ref('')
const { selectorInfo, selectorRef } = useSelectData()
const isLoading = ref(false)
const formInfo = ref({
  ref: null,
  data: {
    status: '1',
  },
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
      label: '凭证类型',
      value: 'voucherTypeName',
      asValue: 'voucherTypeId',
      type: 'select-data-custom',
      selectDataType: 'voucherType',
      required: true,
    },
    {
      label: '限制类型',
      value: 'limitTypeCode',
      type: 'select-model',
      code: 'limit_type',
      required: true,
    },
    {
      label: '启用状态',
      value: 'status',
      type: 'select-model',
      code: 'enabled_type',
      disabled: true,
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
      { required: true, message: '请选择核算账簿', trigger: 'change' },
    ],
    voucherTypeName: [
      { required: true, message: '请选择凭证类型', trigger: 'blur' },
    ],
    limitTypeCode: [
      { required: true, message: '请选择限制类型', trigger: 'change' },
    ],
  },
})

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  selections: [],
  fieldList: [
    {
      label: '会计科目',
      value: 'accasoaName',
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
// 过滤配置
const filterInfo = ref({
  btnList: [
    {
      type: 'button',
      label: '增加行',
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
watch(
  () => formInfo.value.data.accbookId,
  (val) => {
    if (!isLoading.value) {
      tableInfo.value.data = []
    }
  },
)
function getMain() {
  isLoading.value = true
  voucherTypeConstraintGetbyId(props.id).then((res) => {
    if (res.code === 200 && res.success) {
      formInfo.value.data = res.data
      tableInfo.value.data = res.data.detailList
    }
  }).finally(()=>{
    isLoading.value = false
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
    accasoaName: '',
  })
}
/** 批量删除选中行 */
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
function handleAccountSelected(row) {
  tableInfo.value.data[_index.value]['accasoaOriginalId'] = row.originalId
  tableInfo.value.data[_index.value].accasoaName = row.name
  tableInfo.value.data[_index.value]['accasoaCode'] = row.code
  // 待实现
}
function save() {
  formRefs.value.push(
    proxy.$refs['modifyForm'].$refs['form'],
    proxy.$refs['tableForm'],
  )
  proxy.$fn.checkForm(formRefs.value).then(() => {
    if (tableInfo.value.data.length === 0) {
      proxy.$message.warning('请添加控制科目')
      return
    }
    let params = {
      ...formInfo.value.data,
      detailList: tableInfo.value.data,
    }
    let api = props.id
      ? voucherTypeConstraintUpdate
      : voucherTypeConstraintCreate
    let btnCode = props.id
      ? 'voucherTypeConstraint:update'
      : 'voucherTypeConstraint:add'
    api(params, btnCode).then((res) => {
      if (res?.success) {
        proxy.$message.success('保存成功')
        showDialog.value = false
        emit('returnModify', false)
      }
    })
  })
}

defineExpose({
  save,
})
</script>
