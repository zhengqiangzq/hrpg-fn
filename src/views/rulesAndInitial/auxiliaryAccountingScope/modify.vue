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
        <div class="model-panel-title"><p>基本信息</p></div>
        <div class="model-panel-body">
          <page-form
            ref="modifyForm"
            class="paddingBox order-model-formBox flex_wrap_start_start"
            v-model:ref-obj="formInfo.ref"
            :data="formInfo.data"
            :field-list="formInfo.fieldList"
            :rules="formInfo.rules"
            :list-type-info="listTypeInfo"
            :label-width="formInfo.labelWidth"
            @handleEvent="handleEvent"
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
            <template v-slot:form-accasoaName>
              <el-input
                :class="formInfo.data.accbookId ? 'not-mongolia' : ''"
                :disabled="true"
                placeholder="请选择会计科目"
                v-model="formInfo.data.accasoaName"
              >
                <template #append>
                  <el-icon @click="selectSubject">
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </template>
          </page-form>
        </div>
      </div>
      <!-- 控制规则 -->
      <div class="model-panel">
        <div class="model-panel-title"><p>控制规则</p></div>
        <div class="model-panel-body">
          <div style="margin-bottom: 8px">
            <span> 条件显示名称： </span>
            <div class="w-full" style="display: inline-block; width: 94%">
              <el-input :value="resultStr" disabled></el-input>
              <!-- <el-text>{{ resultStr||'' }}</el-text> -->
            </div>
          </div>

          <NewPageFilter :filter-btn="filterInfo.btnList"> </NewPageFilter>
          <!-- 条件表格 -->
          <div class="flex_full_item">
            <el-form
              :model="tableInfo"
              ref="tableForm"
              style="width: 100%"
              @submit.native.prevent
            >
              <PageTable
                ref="tableRef"
                v-model:data="tableInfo.data"
                baseHeight="350px"
                :pager="false"
                :checkBox="true"
                :isDynamic="false"
                :field-list="tableInfo.fieldList"
                :handle="tableInfo.handle"
                @handleEvent="handleEventTable"
              >
                <template v-slot:col-fieldCode="{ row, $index }">
                  <!-- {{ row.operator }} -->
                  <el-select
                    v-model="row.fieldCode"
                    @change="selectOneChange(row, $index)"
                    value-key="value"
                  >
                    <el-option
                      v-for="item in selectOne"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </template>
                <template v-slot:col-operator="{ row, $index }">
                  <!-- {{ row.onlyShowOption }} -->
                  <select-model
                    v-model="row.operator"
                    type-code="determine_term"
                    :check-default="false"
                    :onlyShowOption="row.onlyShowOption || ['']"
                    @change="checkChange(row, $index)"
                  />
                  <!-- @change="selectoperator(row, index)" -->
                </template>
                <template v-slot:col-fieldValueName="{ row, $index }">
                  <!-- {{ row.fieldValueName }} -->
                  <!-- 是引用类型并且字段类型不为字典——弹窗展示-->
                  <el-input
                    v-if="row.isRelation == '1' && row.classType !== '1'"
                    v-model="row.fieldValueName"
                    class="not-mongolia"
                    style="width: 100%"
                    :required="true"
                    disabled
                  >
                    <template #append>
                      <el-icon @click="SelectSupAccount(row, $index)">
                        <Search />
                      </el-icon>
                    </template>
                  </el-input>
                  <!-- 是引用类型并且字段类型是字典——下拉展示-->
                  <el-select
                    v-else-if="row.isRelation == '1' && row.classType == '1'"
                    v-model="row.fieldValue"
                    :multiple="row.checkBox"
                    @change="selectChange(row)"
                  >
                    <!-- @visible-change="(v) => v && searchSelect(row)" -->
                    <el-option
                      v-for="item in row._refOptions || []"
                      :key="item.key"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                  <!-- 时间框 -->
                  <el-date-picker
                    v-else-if="
                      row.isRelation !== '1' &&
                      row.fieldType == 'LocalDate' &&
                      row.operator !== 'BETWEEN'
                    "
                    v-model="row.fieldValueName"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    type="date"
                    style="width: 100%; min-width: auto"
                    placeholder="请选择日期"
                  >
                  </el-date-picker>
                  <!-- 文本框  -->
                  <el-input
                    v-else-if="
                      row.isRelation !== '1' && row.fieldType == 'String'
                    "
                    v-model="row.fieldValueName"
                  ></el-input>
                  <!-- 数字框 int -->
                  <el-input-number
                    v-else-if="
                      row.isRelation !== '1' &&
                      ['Integer', 'BigDecimal'].includes(row.fieldType) &&
                      row.operator !== 'BETWEEN'
                    "
                    :precision="2"
                    :controls="false"
                    v-model="row.fieldValueName"
                  ></el-input-number>
                  <!-- 数字框 long -->
                  <el-input-number
                    v-else-if="
                      row.isRelation !== '1' &&
                      row.fieldType == 'Long' &&
                      row.operator !== 'BETWEEN'
                    "
                    :precision="0"
                    :controls="false"
                    v-model="row.fieldValueName"
                  ></el-input-number>
                  <RangeInput
                    v-else-if="
                      row.isRelation !== '1' &&
                      ['Integer', 'BigDecimal'].includes(row.fieldType) &&
                      row.operator === 'BETWEEN'
                    "
                    v-model="row.fieldValueName"
                    class="filter-rangeInput"
                    type="number"
                    @change="
                      (val) => rangeInputChange(val, ['start', 'end'], row)
                    "
                  />
                  <RangeInput
                    v-else-if="
                      row.isRelation !== '1' &&
                      row.fieldType == 'Long' &&
                      row.operator === 'BETWEEN'
                    "
                    v-model="row.fieldValueName"
                    class="filter-rangeInput"
                    type="number"
                  />
                  <!-- @change="(val) => rangeInputChange(val, ['start', 'end'])" -->
                  <RangeDate
                    v-else-if="
                      row.isRelation !== '1' &&
                      row.fieldType == 'LocalDate' &&
                      row.operator === 'BETWEEN'
                    "
                    v-model="row.fieldValueName"
                    class="filter-RangeDate"
                    type="date"
                    @change="
                      (val) => rangeInputChange(val, ['start', 'end'], row)
                    "
                  />
                </template>
                <template v-slot:col-logicalOperator="{ row, $index }">
                  <select-model
                    v-if="$index !== tableInfo.data.length - 1"
                    v-model="row.logicalOperator"
                    type-code="logical_operator"
                    :check-default="false"
                  />
                </template>
              </PageTable>
            </el-form>
          </div>
        </div>
      </div>
    </NewFullScreen>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="auxiliaryAccountingScopeModify">
import { useSelectData } from '@/hooks/useSelectData'
import { accasoaById, accountQueryServlet, assPropertyList } from '@/api/base'
import useDictionary from '@/hooks/useDictionary'
import {
  auxiliaryAccountingScopeCreate,
  auxiliaryAccountingScopeUpdate,
  auxiliaryAccountingScopeGetbyId,
} from '@/api/rulesAndInitial/auxiliaryAccountingScope'
// 输入范围选择器
const RangeInput = defineAsyncComponent(
  () => import('@/nonGlobalComponents/RangeInput/index'),
)
// 输入范围选择器
const RangeDate = defineAsyncComponent(
  () => import('@/nonGlobalComponents/RangeDate/index'),
)
const { proxy } = getCurrentInstance()
const { setOptions, getOptionsValue } = useDictionary()
const emit = defineEmits(['update:visible', 'returnModify'])
const { selectorInfo, selectorRef } = useSelectData()

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '新增辅助核算范围控制' },
  id: { type: [Number, String] },
  flowFormType: { type: String },
  data: {
    type: Object,
    default: {},
  },
})
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const listTypeInfo = ref({
  accList: [],
})
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})
const selectOne = ref([])
const fieldPropertiesList = ref([])

// 数字：都展示字段，只是多选不生效(数字框就一个，选包含也拆分不了)，
// 时间：不展示在...中，不在...中，包含，不包含
// 字符：不展示在...之间和包含大于，小于的字典
// 应用类型：不展示以...结尾，在...之间，以...开始，和包含大于，小于的字典

// 1. 定义全量操作符集合
const selectTwoNofilter = setOptions('determine_term').map((item) => item.code)
// 2. 定义剔除规则（黑名单）
const EXCLUDE_RULES = {
  // 字符：不展示 在...之间 和 包含大于，小于的字典
  String: [
    'BETWEEN',
    'GREATER_THAN',
    'GREATER_THAN_OR_EQUAL_TO',
    'LESS_THAN',
    'LESS_THAN_OR_EQUAL_TO',
  ],
  // 时间：不展示 在...中, 不在...中, 包含, 不包含
  LocalDate: ['IN', 'NOT_IN', 'ALL_LIKE', 'NOT_LIKE'],
  // 应用类型：不展示 以...结尾, 在...之间, 以...开始, 和包含大于，小于的字典
  referType: [
    'LEFT_LIKE',
    'BETWEEN',
    'RIGHT_LIKE',
    'GREATER_THAN',
    'GREATER_THAN_OR_EQUAL_TO',
    'LESS_THAN',
    'LESS_THAN_OR_EQUAL_TO',
  ],
}
// 3. 动态获取可用操作符的函数
function getAvailableOperators(fieldType) {
  // 1. 数字类型：展示全部字段
  if (
    fieldType === 'Integer' ||
    fieldType === 'BigDecimal' ||
    fieldType === 'Long'
  ) {
    return [...selectTwoNofilter]
  }
  // 2. 其他类型：在全量数组中剔除不需要的字段
  const excludeList = EXCLUDE_RULES[fieldType] || EXCLUDE_RULES['referType']
  return selectTwoNofilter.filter((it) => !excludeList.includes(it))
}
const assValueName = ref('')
const assValueCode = ref('id')
let _index = ref(null)

const formInfo = ref({
  ref: null,
  data: {
    accbookName: '',
    subjectTableName: '',
    accasoaName: '',
    dimId: '',
    status: '1',
    remark: '',
  },
  fieldList: [
    {
      label: '核算账簿',
      value: 'accbookName',
      type: 'slot',
      required: true,
    },
    {
      label: '科目表',
      value: 'accchartName',
      type: 'input',
      disabled: true,
    },
    {
      label: '会计科目',
      value: 'accasoaName',
      type: 'slot',
      required: true,
    },
    {
      label: '控制维度',
      value: 'dimId',
      type: 'select',
      // required: true,
      width: '25%',
      list: 'accList',
      disabled: computed(() => {
        return !formInfo.value.data.accasoaOriginalId
      }),
      event: 'changeAccass',
    },
    {
      label: '启用状态',
      value: 'status',
      type: 'select-model',
      code: 'enabled_type',
      width: '25%',
      disabled: true,
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
    accbookName: [
      { required: true, message: '请选择核算账簿', trigger: 'blur' },
    ],
    accasoaName: [
      { required: true, message: '请选择会计科目', trigger: 'blur' },
    ],
    dimId: [{ required: true, message: '请选择控制维度', trigger: 'change' }],
  },
  labelWidth: '130px',
})
const filterInfo = ref({
  btnList: [
    {
      type: 'button',
      label: '新增行',
      show: true,
      event: addRow,
      disabled: computed(() => {
        return !formInfo.value.data.dimId
      }),
    },
    {
      type: 'button',
      label: '删除行',
      show: true,
      event: removeRow,
      disabled: computed(() => {
        return !(
          formInfo.value.data.dimId && tableInfo.value.selections.length > 0
        )
      }),
    },
  ],
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  selections: [],
  fieldList: [
    {
      label: '左括号',
      value: 'leftBracket',
      type: 'select-model',
      code: 'left_bracket',
      clearable: true,
      checkDefault: false,
    },
    {
      label: '名称',
      value: 'fieldCode',
      type: 'slot',
    },

    {
      label: '逻辑运算符',
      value: 'operator',
      type: 'slot',
      clearable: true,
    },
    {
      label: '条件值',
      value: 'fieldValueName',
      type: 'slot',
    },
    {
      label: '右括号',
      value: 'rightBracket',
      type: 'select-model',
      code: 'right_bracket',
      clearable: true,
      checkDefault: false,
    },
    {
      label: '满足',
      value: 'logicalOperator',
      type: 'slot',
      checkDefault: false,
    },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: true,
        event: delRow,
      },
    ],
  },
})
function handleEventTable(event, data, item) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}

function selectOneChange(row, index) {
  console.log('llll', row, index)
  if (row.checkBox) {
    tableInfo.value.data[index].fieldValueName = []
    tableInfo.value.data[index].fieldValue = []
  } else {
    tableInfo.value.data[index].fieldValueName = ''
    tableInfo.value.data[index].fieldValue = ''
  }
  // 点击row,遍历出
  addRowItem(row, index)
}
async function addRowItem(row, index) {
  console.log()

  const needMulti = ['ALL_LIKE', 'NOT_LIKE', 'IN', 'NOT_IN'].includes(
    row.operator,
  )
  const needRange = row.operator === 'BETWEEN'
  // 给row赋值
  let arr = fieldPropertiesList.value.filter(
    (item) => item.value === row.fieldCode,
  )
  if (arr.length > 0) {
    row['isRelation'] = arr[0].isRelation
    row['refType'] = arr[0].refType
    row['classType'] = arr[0].classType
    row['fieldType'] = arr[0].fieldType
    row['fieldName'] = arr[0].label
    row['id'] = arr[0].id
    row['onlyShowOption'] = getAvailableOperators(arr[0].fieldType) || ['']
    // 字段属性为'下拉引用'，
    if (arr[0].classType === '1') {
      await searchSelect(row)
      if (needMulti) {
        row.checkBox = needMulti
        row['fieldValue'] = row['fieldValue']?.split(',')
        row['fieldValueName'] = row['fieldValueName']?.split(',')
      }
    }

    if (needRange) {
      row.fieldValueName = row.fieldValueName?.split(',') || []
    }
    // checkChange(row,index)
    console.log('行数据最终', row)
  }

  console.log('赋值行', row)
}
function checkChange(row, index) {
  const needMulti = ['ALL_LIKE', 'NOT_LIKE', 'IN', 'NOT_IN'].includes(
    row.operator,
  )
  const needRange = row.operator === 'BETWEEN'
  const wasMulti = !!row.checkBox
  row.checkBox = needMulti
  // 1. BETWEEN：值必须是数组（与 RangeInput 协议一致）
  if (needRange) {
    if (!Array.isArray(row.fieldValueName)) {
      const v = row.fieldValueName
      row.fieldValueName = v != null && v !== '' ? [v, ''] : ['', '']
    }
    if (!Array.isArray(row.fieldValue)) {
      const v = row.fieldValue
      row.fieldValue = v != null && v !== '' ? [v, ''] : ['', '']
    }
    return
  }

  // 2. 切换离开 BETWEEN：数组转回字符串
  if (Array.isArray(row.fieldValueName)) {
    row.fieldValueName =
      row.fieldValueName.filter((v) => v !== '').join(',') || null
  }
  if (Array.isArray(row.fieldValue)) {
    row.fieldValue = row.fieldValue.filter((v) => v !== '').join(',') || null
  }
  console.log('单选多选走哪里', row)
  if (needMulti && !wasMulti) {
    // 单选 → 多选：原始值（string/number）转数组；空值置空数组，保证 el-select 类型正确
    const name = row.fieldValueName
    const value = row.fieldValue
    row.fieldValueName = name ? [name] : []
    row.fieldValue = value ? [value] : []
    row.fieldValueName = ''
    selectChange(row)
  } else if (!needMulti && wasMulti) {
    // 多选 → 单选：数组取首项转字符串；空数组置 null
    const names = Array.isArray(row.fieldValueName) ? row.fieldValueName : []
    const values = Array.isArray(row.fieldValue) ? row.fieldValue : []
    row.fieldValueName = names.length ? names[0] : null
    row.fieldValue = values.length ? values[0] : null
    row.fieldValueName = ''
    selectChange(row)
  }
}
function rangeInputChange(val, rangeArr, item) {
  console.log('val', val)
  console.log('rangeArr', rangeArr)
  console.log('item', item)
  // item.fieldValueName=val.join(',')
  item.fieldValueName = Array.isArray(val) ? [...val] : val
  item.fieldValue = Array.isArray(val) ? [...val] : val
}
async function rowSelectChange(params) {
  await assPropertyList(params).then((res) => {
    console.log('ssss', res)
    let arr = []
    let arr2 = []
    res.data.forEach((item) => {
      arr.push({
        label: item.name,
        value: item.code,
        id: item.id,
      })
      arr2.push({
        label: item.name,
        value: item.code,
        id: item.id,
        fieldType: item.fieldType,
        classType: item.fieldClassType,
        refType: item.fieldRefType,
        isRelation: item.isRelation,
      })
    })
    selectOne.value = arr
    fieldPropertiesList.value = [...arr2]
  })
}
function handleEvent(event, data, item) {
  console.log('llll', event, data)
  switch (event) {
    case 'changeAccass':
      tableInfo.value.data = []
      let params = {
        accassitemId: formInfo.value.data.dimId,
      }
      rowSelectChange(params)
      break
    // case 'changeSelectModel':
    //   conditionalEcho(data.$index,data.row[item.value])
    //   break
  }
}

function addRow() {
  tableInfo.value.data.push({
    leftBracket: '',
    fieldCode: '',
    operator: '',
    value: '',
    rightBracket: '',
    logicalOperator: '',
  })
}

function removeRow() {
  tableInfo.value.data = tableInfo.value.data.filter(
    (row) => !tableInfo.value.selections.includes(row),
  )
  // 3. 判断是否删除了最后一行：
  if (tableInfo.value.data.length > 0) {
    const newLastRow = tableInfo.value.data[tableInfo.value.data.length - 1]
    if (newLastRow.logicalOperator) {
      newLastRow.logicalOperator = ''
    }
  }
}
function delRow(row, index) {
  tableInfo.value.data = tableInfo.value.data.filter((item) => item !== row)
  // 3. 判断是否删除了最后一行：
  if (tableInfo.value.data.length > 0) {
    const newLastRow = tableInfo.value.data[tableInfo.value.data.length - 1]
    if (newLastRow.logicalOperator) {
      newLastRow.logicalOperator = ''
    }
  }
}
onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    if (userInfo) {
      formInfo.value.data.accbookId = userInfo.accbookId
      formInfo.value.data.accbookName = userInfo.accbookName
      formInfo.value.data.accchartId = userInfo.accchartId
      formInfo.value.data.accchartName = userInfo.accchartName
    }
  }
})
watch(
  () => tableInfo.value.data,
  (val) => {
    console.log('‘表格展示', val)
  },
  { immediate: true, deep: true },
)
function SelectSupAccount(row, index) {
  _index.value = index
  console.log('拿到行数据', row)
  let params = {
    accbookId: formInfo.value.data.accbookId || '',
    classId: row.fieldType,
  }
  accountQueryServlet(params).then((res) => {
    console.log('==2', res)
    res.data.queryFieldVOs.forEach((it) => {
      if (it.isName == '1') {
        assValueName.value = it.code
      }
      // if (it.isCode == '1') {
      //   assValueCode.value = it.code
      // }
    })
    let data = {
      component: 'tree',
      title: '表头',
    }
    if (res && res.success) {
      if (res.data.refType === '1') {
        data.component = 'tree'
        data.title = res.data.title
        data.defaultDate = res.data.resultData
        data.showCheckbox = row.checkBox
        if (row['fieldValue'] != null) {
          // 兼容 string（逗号分隔）和 array 两种类型
          const raw = row['fieldValue']
          data.defaultSelected = Array.isArray(raw)
            ? raw
            : raw
              ? raw.split(',')
              : []
        }
        // data.callback=treeBack
      } else if (res.data.refType === '2') {
        data.component = 'table'
        data.title = res.data.title
        data.defaultDate = res.data.resultData
        data.checkBox = row.checkBox
        let arr = []
        res.data.queryFieldVOs.filter((it) => {
          if (it.isShow == '1') {
            arr.push({
              label: it.name,
              value: it.code,
            })
          }
        })
        data.fieldList = arr
        data.queryFieldVOs = res.data.queryFieldVOs
        data.total = res.total
        data.curPage = res.curPage
        data.pageSize = res.pageSize
        data.isSup = true
        data.query = {
          ...params,
        }
        data.api = accountQueryServlet
        if (row['fieldValue'] != null) {
          const raw = row['fieldValue']
          data.defaultSelected = Array.isArray(raw)
            ? raw
            : raw
              ? raw.split(',')
              : []
        }
        // data.callback=tableBack
        // data.pager=false
      } else if (res.data.refType === '3') {
        //左树右表，在点击树节点时，传入accbookId,reFieldValue,id，邮编表头取点击shu
        data.component = 'supTreeTable'
        data.title = res.data.title
        data.rootName = res.data.title
        let arr = []
        data.defaultDate = res.data.resultData
        data.checkBox = row.checkBox
        data.query = {
          ...params,
          refFieldCode: res.data.refFieldCode,
        }
        data.clickParams = 'refFieldValue'
        data.code = 'id'
        data.tableDataName = 'resultData'
        data.apiList = accountQueryServlet
        // data.callback=treeTableBack
        if (row['fieldValue'] != null) {
          const raw = row['fieldValue']
          data.defaultSelected = Array.isArray(raw)
            ? raw
            : raw
              ? raw.split(',')
              : []
        }
      }
    }
    data.callback = tableBack
    selectorRef.value.show(data)
    // tableInfo.value.data = res.data.list
    // tableInfo.value.refresh = Math.random()
  })
}
function tableBack(row) {
  console.log('tableBack', row)
  const target = tableInfo.value.data[_index.value]

  if (Array.isArray(row)) {
    // 多选：row 是数组，逗号拼接存字符串（与后端约定一致）
    const names = row.map((item) => item[assValueName.value])
    const ids = row.map((item) => item[assValueCode.value])
    target.fieldValueName = names.join(',')
    target.fieldValue = ids.join(',')
    target.fieldValueName = names.join(',')
  } else if (row && typeof row === 'object') {
    // 单选：row 是对象
    target.fieldValueName = row[assValueName.value]
    target.fieldValue = row[assValueCode.value]
    target.fieldValueName = row[assValueName.value] || ''
  }
  // if (tableInfo.value.data[_index.value]) {
  //   tableInfo.value.data[_index.value] = {
  //     ...tableInfo.value.data[_index.value],
  //     fieldValueName: row[assValueName.value],
  //     fieldValue: row[assValueCode.value],
  //   }
  // }
  // if(row.length>0 && tableInfo.value.data[_index.value]){
  //   const newData = [...tableInfo.value.data]
  //   let str=[]
  //   let ids=[]
  //   row.forEach((item) => {
  //     str.push(item.codeAndName)
  //     ids.push(item.id)
  //   })
  //   newData[_index.value] = {
  //     ...newData[_index.value],
  //     [slotField.value]: str.join(','),
  //     ['fieldValue']: ids.join(','),
  //   }
  //   tableInfo.value.data = newData

  // }
}
async function searchSelect(row) {
  console.log('引用类型为下拉是，查询数据', row)
  if (row._refLoading) return
  row._refLoading = true
  let params = {
    accbookId: formInfo.value.data.accbookId || '',
    classId: row.fieldType,
  }
  await accountQueryServlet(params)
    .then((res) => {
      console.log('下拉查询', res)
      row._refLoading = false
      // 根据queryFieldVOs里面的isCode和isName确定value和label
      if (res && res.success) {
        let code = res.data.queryFieldVOs.find((item) => item.isCode == '1')
        let name = res.data.queryFieldVOs.find((item) => item.isName == '1')
        let arr = []
        res.data.resultData.forEach((item) => {
          arr.push({
            label: item[name.code],
            value: item[code.code],
            key: item[code.code],
          })
        })
        row._refOptions = arr
      }
    })
    .finally(() => {
      // 无论成功失败都重置，避免接口异常后下拉永远加载不出
      row._refLoading = false
    })
}
function selectChange(row) {
  console.log('kkj', row)
  row.fieldValueName = ''
  if (!row._refOptions) return

  if (row.checkBox) {
    // 多选：fieldValue / fieldValue 都是数组
    const selectedNames = Array.isArray(row.fieldValue) ? row.fieldValue : []
    const matched = row._refOptions.filter((it) =>
      selectedNames.includes(it.value),
    )
    row.fieldValueName = matched.map((it) => it.label).join(',')
    // 保持 fieldValue 与 fieldValueName 同步同类型（都是数组，元素一一对应）
    row.fieldValue = matched.map((it) => it.value)
  } else {
    // 单选
    const matched = row._refOptions.find((it) => it.value == row.fieldValue)
    row.fieldValueName = matched?.label ?? ''
    if (matched) row.fieldValue = matched.value
  }
}
function getMain() {
  auxiliaryAccountingScopeGetbyId(
    props.id,
    'auxiliaryAccountingScope:detail',
  ).then(async (res) => {
    if (res && res.success) {
      const detailVOList = res.data.detailVOList || []
      await accasoaById(res.data.accasoaOriginalId).then(async (resp) => {
        if (resp && resp.success) {
          resp.data.accassList.forEach((item) => {
            listTypeInfo.value.accList.push({
              key: item.accassitemName,
              label: item.accassitemCode,
              value: item.accassitemId,
            })
          })
          let params = {
            accassitemId: res.data.dimId,
          }
          await rowSelectChange(params)
          console.log('==1')
        }
      })
      console.log('==2')
      formInfo.value.data = res.data
      if (res.data.detailVOList.length > 0) {
        for (let i = 0; i < res.data.detailVOList.length; i++) {
          await addRowItem(res.data.detailVOList[i], i)
        }
        tableInfo.value.data = res.data.detailVOList
      }
    }
  })
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
    formInfo.value.data.accbookName = row.name
    formInfo.value.data.accchartId = row.accchartId
    formInfo.value.data.accchartName = row.accchartName
  } else {
    formInfo.value.data.accbookId = ''
    formInfo.value.data.accbookName = ''
    formInfo.value.data.accchartId = ''
    formInfo.value.data.accchartName = ''
  }
  formInfo.value.data.accasoaName = ''
  formInfo.value.data.accasoaCode = ''
  tableInfo.value.data = []
}

function selectSubject() {
  if (!formInfo.value.data.accbookId) return
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
  tableInfo.value.data = []
  if (row.originalId) {
    formInfo.value.data['accasoaOriginalId'] = row.originalId
    formInfo.value.data.accasoaName = row.code + ' ' + row.name
    formInfo.value.data['accasoaCode'] = row.code
    listTypeInfo.value.accList = []
    accasoaById(row.originalId).then((res) => {
      if (res && res.success) {
        res.data.accassList.forEach((item) => {
          listTypeInfo.value.accList.push({
            key: item.accassitemName,
            label: item.accassitemCode,
            value: item.accassitemId,
          })
        })
      }
    })
  } else {
    formInfo.value.data.accasoaOriginalId = ''
    formInfo.value.data.accasoaName = ''
    formInfo.value.data.accasoaCode = ''
    tableInfo.value.data = []
  }
}

function handleReturn() {
  showDialog.value = false
  emit('returnModify', false)
}
const resultStr = computed(() => {
  console.log('翻页翻页')

  // 1. 安全检查，防止 data 为空报错
  if (!tableInfo.value?.data) return ''
  const parts = tableInfo.value.data.map((row) => {
    const left = row.leftBracket
      ? getOptionsValue('left_bracket', row.leftBracket)
      : ''
    const factor = row.fieldName || ''
    // 逻辑运算符，出现在...之间这种带有3个省略号的，需要将省略号替换成条件值
    const operator = row.operator
      ? getOptionsValue('determine_term', row.operator)
      : ''
    let isEllip = operator.includes('...')
    // 下拉引用的翻译值存在fieldValueName中；多选数组兜底用顿号拼接
    let condVal = row.fieldValueName || ''
    if (Array.isArray(condVal)) condVal = condVal.join(',')
    //   // BETWEEN 场景用 - 拼接两个值；多选场景用、拼接
    //   const sep = row.operator === 'BETWEEN' ? '-' : '、'
    //   condVal = condVal.join(sep)
    // } else if (typeof condVal === 'string' && condVal.includes(',')) {
    //   // 回显的逗号字符串也归一化显示
    //   const sep = row.operator === 'BETWEEN' ? '-' : '、'
    //   condVal = condVal.split(',').join(sep)
    // }

    let finalOperator = ''
    if (isEllip) {
      finalOperator = operator.replace(/\.+/g, condVal)
    }
    const right = row.rightBracket
      ? getOptionsValue('right_bracket', row.rightBracket)
      : ''
    const query = row.logicalOperator
      ? getOptionsValue('logical_operator', row.logicalOperator)
      : ''
    // 3. 拼接 (去掉了多余的 + 号字符串，直接用空格分隔可能更美观，看你需求)
    if (isEllip) {
      return `${left}${factor}${finalOperator}${right}${query}`
    } else {
      return `${left}${factor}${operator}${condVal}${right}${query}`
    }
  })

  // 4. 过滤掉空字符串，避免产生多余的空格
  return parts.filter((item) => item.trim() !== '').join('')
})
function save() {
  formInfo.value.ref.validate((valid) => {
    if (valid) {
      if (tableInfo.value.data.length === 0) {
        proxy.$message.warning('请添加控制规则')
        return
      }
      let _tableInfo=tableInfo.value.data
      for (let i = 0; i < _tableInfo.length; i++) {
        const item = _tableInfo[i]
        const rowNo = `第${i + 1}行`
        if (!item.fieldCode) {
          proxy.$message.warning(`${rowNo}：名称不能为空`)
          return
        }
        if (!item.operator) {
          proxy.$message.warning(`${rowNo}：逻辑运算符不能为空`)
          return
        }
        // 条件值：数组时取 join 后判断；字符串时取 trim 后判断；同时考虑 BETWEEN 的两值情况、多选的数组情况
        let condVal = item.fieldValueName
        if (Array.isArray(condVal)) {
          // 过滤掉空元素后再 join，避免 BETWEEN 场景 ["", ""] 或 ["123", ""] 误判
          const validEls = condVal.filter(
            (v) => v != null && String(v).trim() !== '',
          )
          if (validEls.length === 0) {
            proxy.$message.warning(`${rowNo}：条件值不能为空`)
            return
          }
          // BETWEEN：两值都要填
          if (item.operator === 'BETWEEN' && validEls.length < 2) {
            proxy.$message.warning(`${rowNo}：起止两个条件值不能为空`)
            return
          }
        } else {
          if (condVal == null || String(condVal).trim() === '') {
            proxy.$message.warning(`${rowNo}：条件值不能为空`)
            return
          }
        }
      }
      if (!validateFormulaRows(_tableInfo)) {
        proxy.$message.error('括号不合法，请检查！')
        return
      }

      // 保存前归一化：多选数组转逗号字符串，保持与后端约定一致
      const detailVOList = tableInfo.value.data.map((row) => {
        const next = { ...row }
        next.fieldValueName = Array.isArray(next.fieldValueName)
          ? next.fieldValueName.join(',')
          : (next.fieldValueName ?? null)
        next.fieldValue = Array.isArray(next.fieldValue)
          ? next.fieldValue.join(',')
          : (next.fieldValue ?? null)
        delete next._refLoading
        delete next._refOptions
        return next
      })

      const params = {
        ...formInfo.value.data,
        detailVOList,
      }

      console.log('结果', params)

      let api = props.id
        ? auxiliaryAccountingScopeUpdate
        : auxiliaryAccountingScopeCreate
      const btnCode = props.id
        ? 'auxiliaryAccountingScope:update'
        : 'auxiliaryAccountingScope:add'
      api(params, btnCode).then((resp) => {
        if (resp?.success) {
          proxy.$message.success('保存成功')
          showDialog.value = false
          emit('returnModify', false)
        }
      })
    }
  })
}
function validateFormulaRows(rows) {
  // 提取所有非空括号 token，按顺序
  //  /xc 查字典查出来
  const leftBracketMap = { 1: '(', 2: '((', 2: '(((' }
  const rightBracketMap = { 1: ')', 2: '))', 2: ')))' }
  const tokens = []
  for (const row of rows) {
    if (row.leftBracket) tokens.push(leftBracketMap[row.leftBracket.trim()])
    if (row.rightBracket) tokens.push(rightBracketMap[row.rightBracket.trim()])
  }

  // 定义合法的括号对
  const openToClose = {
    '(': ')',
    '((': '))',
    '(((': ')))',
  }

  const closeToOpen = {
    ')': '(',
    '))': '((',
    ')))': '(((',
  }

  const stack = []

  for (const token of tokens) {
    if (token in openToClose) {
      // 左括号入栈
      stack.push(token)
    } else if (token in closeToOpen) {
      // 右括号：检查是否匹配栈顶
      if (stack.length === 0) {
        return false // 多余的右括号
      }
      const lastOpen = stack.pop()
      if (openToClose[lastOpen] !== token) {
        return false // 类型不匹配，例如 (( 配 )
      }
    } else {
      // 非法括号值（比如 "[","(" 但多输了一个空格等）
      return false
    }
  }

  return stack.length === 0 // 所有括号必须闭合
}
defineExpose({ save })
</script>

<style scoped lang="scss"></style>
