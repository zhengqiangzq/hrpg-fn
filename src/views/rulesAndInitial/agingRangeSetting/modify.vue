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
      <div class="model-panel">
        <div class="model-panel-title"><p>基本信息</p></div>
        <div class="model-panel-body">
          <page-form
            ref="modifyForm"
            class="paddingBox order-model-formBox flex_wrap_start_start"
            :data="formInfo.data"
            :field-list="formInfo.fieldList"
            :rules="formInfo.rules"
            :label-width="formInfo.labelWidth"
            :listTypeInfo="listTypeInfo"
          />
        </div>
      </div>
      <div class="model-panel">
        <div class="model-panel-title"><p>默认信息</p></div>
        <div class="model-panel-body">
          <el-form ref="tableForm" :model="tableInfo" style="width: 100%">
            <NewPageFilter :filter-btn="filterInfo.btnList"> </NewPageFilter>
            <page-table
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :query="filterInfo.query"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              :pager="false"
              :tabIndex="true"
              :isDynamic="true"
              @handleEvent="handleEvent"
            >
              <template #col-agingDesc="{ row, $index }">
                <el-form-item
                  :prop="`data.${$index}.agingDesc`"
                  :rules="[
                    {
                      required: $index >= 0,
                      message: '请填写账期描述',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-input
                    v-model.lazy="row.agingDesc"
                    :placeholder="'请输入账期描述'"
                  />
                </el-form-item>
              </template>
              <template #col-agingStart="{ row, $index }">
                <el-input-number
                  style="width: 100%"
                  v-model.lazy="row.agingStart"
                  :controls="false"
                  :min="0"
                  :max="999999999"
                  :disabled="$index > 0 && tableInfo.data[$index - 1]?.agingEnd"
                  @blur="onStartDaysChange($index)"
                />
              </template>
              <template #col-agingEnd="{ row, $index }">
                <el-input-number
                  style="width: 100%"
                  v-model.lazy="row.agingEnd"
                  :controls="false"
                  :min="0"
                  :max="999999999"
                  @blur="onEndDaysChange($index)"
                />
              </template>
              <template #col-agingTotal="{ row, $index }">
                <el-form-item
                  :prop="`data.${$index}.agingTotal`"
                  :rules="[
                    {
                      required: true,
                      validator: (rule, value, callback) => {
                        if (
                          value !== '' &&
                          value !== null &&
                          value !== undefined &&
                          Number(value) < 0
                        ) {
                          callback('账期总数不能为负数')
                        } else {
                          callback()
                        }
                      },
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model.lazy="row.agingTotal"
                    :disabled="true"
                    :controls="false"
                    :max="999999999"
                  />
                </el-form-item>
              </template>
            </page-table>
          </el-form>
        </div>
      </div>
    </NewFullScreen>
  </div>
</template>

<script setup name="agingRangeSettingModify">
import {
  agingRangeSetCreate,
  agingRangeSetUpdate,
  agingRangeSetGetbyId,
} from '@/api/rulesAndInitial/agingRangeSetting'
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:visible', 'returnModify'])
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '修改账龄区间' },
  id: { type: [Number, String] },
  flowFormType: { type: String },
})
const formRefs = ref([])
const canDelete = computed(() => {
  return !(tableInfo.value.selections.length > 0)
})
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})
const listTypeInfo = ref({
  unitDay: [
    {
      key: '1',
      value: '1',
    },
    {
      key: '30',
      value: '30',
    },
    {
      key: '360',
      value: '360',
    },
  ],
})
const formInfo = ref({
  ref: null,
  data: {
    status: '1',
    unit: '0',
    day: '1',
  },
  fieldList: [
    {
      label: '账龄编码',
      value: 'code',
      type: 'input',
      required: true,
      width: '25%',
    },
    {
      label: '账龄名称',
      value: 'name',
      type: 'input',
      required: true,
      width: '25%',
    },
    {
      label: '时间单位',
      value: 'unit',
      type: 'select-model',
      code: 'validity_unit',
      required: true,
      width: '25%',
    },
    {
      label: '单位天数',
      value: 'day',
      type: 'select',
      list: 'unitDay',
      required: true,
      disabled: true,
      width: '25%',
    },
    {
      label: '启用状态',
      value: 'status',
      type: 'select-model',
      code: 'enabled_type',
      disabled: true,
      width: '25%',
    },
    {
      label: '备注',
      value: 'remark',
      type: 'textarea',
      width: '100%',
      maxlength: 200,
    },
  ],
  rules: {
    code: [{ required: true, message: '请输入账龄编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入账龄名称', trigger: 'blur' }],
    unit: [{ required: true, message: '请选择时间单位', trigger: 'change' }],
    day: [{ required: true, message: '请输入单位天数', trigger: 'blur' }],
  },
  labelWidth: '120px',
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  selections: [],
  fieldList: [
    { label: '账期描述', value: 'agingDesc', type: 'slot' },
    { label: '账期开始', value: 'agingStart', type: 'slot' },
    { label: '账期结束', value: 'agingEnd', type: 'slot' },
    { label: '账期总数', value: 'agingTotal', type: 'slot' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '80',
    btList: [{ label: '删除', event: delRow, show: true }],
  },
})

const filterInfo = ref({
  btnList: [
    { type: 'button', label: '增加行', event: addRow },
    {
      type: 'button',
      label: '删除行',
      event: removeRows,
      disabled: canDelete,
    },
  ],
})

onMounted(() => {
  if (props.id) getMain()
})
watch(
  () => formInfo.value.data.unit,
  (val) => {
    switch (val) {
      case '0':
        formInfo.value.data.day = '1'
        break
      case '1':
        formInfo.value.data.day = '30'
        break
      case '2':
        formInfo.value.data.day = '360'
        break
    }
  },
  { deep: true },
)
function getMain() {
  agingRangeSetGetbyId(props.id).then((res) => {
    formInfo.value.data = res.data
    tableInfo.value.data = res.data.detailList
  })
}

function handleEvent(event, data) {
  if (event === 'tableCheck') tableInfo.value.selections = [...data]
}

function addRow() {
  let _index = tableInfo.value.data.length - 1
  _index = _index < 0 ? 0 : _index
  // 1. 获取最后一行数据
  const lastRow = tableInfo.value.data[_index]
  // 2. 判断最后一行是否存在，且 agingEnd 没有值（兼容 null, undefined, '' 等情况）
  if (lastRow && !lastRow.agingEnd) {
    // 3. 如果 agingEnd 没值，则赋值为 agingStart + 1
    // 注意：这里假设 agingStart 是数字类型，如果可能是字符串，建议用 Number(lastRow.agingStart) + 1
    lastRow.agingEnd = Number(lastRow.agingStart) + 1
  }
  tableInfo.value.data.push({
    sort: tableInfo.value.data.length,
    agingDesc: '',
    agingStart: null,
    agingEnd: null,
    agingTotal: null,
  })
  onEndDaysChange(_index)
}
function removeRows() {
  tableInfo.value.data = tableInfo.value.data.filter(
    (row) => !tableInfo.value.selections.includes(row),
  )
}
function delRow(row) {
  tableInfo.value.data = tableInfo.value.data.filter((item) => item !== row)
  // 删除后重新计算后续行的startDays
  refreshStartDays()
}
// 当endDays变化时，自动计算下一行的startDays
function onEndDaysChange(index) {
  const currentRow = tableInfo.value.data[index]
  const nextIndex = index + 1
  // 如果当前行有endDays，且不是最后一行，则自动设置下一行的startDays
  if (currentRow.agingEnd && nextIndex < tableInfo.value.data.length) {
    tableInfo.value.data[nextIndex].agingStart = String(
      Number(currentRow.agingEnd) + 1,
    )
    calcTotalDays(nextIndex)
  }
  // 计算当前行的totalDays
  calcTotalDays(index)
}

// 当startDays变化时，校验并计算totalDays
function onStartDaysChange(index) {
  const currentRow = tableInfo.value.data[index]

  // 非第一行，且前一行有endDays时，自动设置startDays
  if (index > 0) {
    const prevRow = tableInfo.value.data[index - 1]
    if (prevRow.agingEnd) {
      const expectedStartDays = String(Number(prevRow.agingEnd) + 1)
      if (currentRow.agingStart !== expectedStartDays) {
        proxy.$message.warning(
          `第${index + 1}行：账期开始应为${expectedStartDays}`,
        )
        currentRow.agingStart = expectedStartDays
      }
    }
  }

  // 校验endDays是否大于startDays
  if (currentRow.agingStart && currentRow.agingEnd) {
    if (Number(currentRow.agingEnd) <= Number(currentRow.agingStart)) {
      proxy.$message.warning(`第${index + 1}行：账期结束必须大于账期开始`)
    }
  }

  // 计算totalDays
  calcTotalDays(index)
}

// 计算账期总数
function calcTotalDays(index) {
  const row = tableInfo.value.data[index]
  if (row.agingEnd) {
    if (row.agingStart) {
      row.agingTotal = String(Number(row.agingEnd) - Number(row.agingStart) + 1)
    } else {
      row.agingTotal = String(Number(row.agingEnd))
    }
  } else {
    row.agingTotal = null
  }
}

// 刷新所有行的startDays
function refreshStartDays() {
  const data = tableInfo.value.data
  for (let i = 1; i < data.length; i++) {
    const prevRow = data[i - 1]
    if (prevRow.agingEnd) {
      data[i].agingStart = String(Number(prevRow.agingEnd) + 1)
      calcTotalDays(i)
    }
  }
}

function save() {
  formRefs.value = [
    proxy.$refs['modifyForm'].$refs['form'],
    proxy.$refs.tableForm,
  ]
  proxy.$fn.checkForm(formRefs.value).then(() => {
    let api = props.id ? agingRangeSetUpdate : agingRangeSetCreate
    let params = {
      ...formInfo.value.data,
      detailList: tableInfo.value.data,
    }
    const btnCode = props.id
      ? 'agingRangeSetting:update'
      : 'agingRangeSetting:add'
    // console.log('结果', params)
    api(params, btnCode).then((resp) => {
      if (resp?.success) {
        proxy.$message.success('保存成功')
        showDialog.value = false
        emit('returnModify', false)
      }
    })
  })
}

defineExpose({ save })
</script>
