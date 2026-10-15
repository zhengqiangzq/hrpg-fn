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
      <div class="model-panel">
        <div class="model-panel-title">
          <p>默认信息</p>
        </div>
        <div class="model-panel-body">
          <NewPageFilter :filter-btn="filterInfo.btnList"> </NewPageFilter>
          <div class="flex_full_item" v-show="showList">
            <el-form :model="tableInfo" ref="tableForm" style="width: 100%">
              <page-table
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :api="tableInfo.api"
                :pager="false"
                :tabIndex="true"
                :check-box="true"
                :field-list="tableInfo.fieldList"
                :handle="tableInfo.handle"
                @handleEvent="handleEvent"
              >
                <template
                  v-for="(field, colIndex) in slotFields"
                  :key="field.value"
                  #[`col-${field.value}`]="scope"
                >
                  <el-form-item
                    v-if="scope.$index >= 0"
                    :prop="`${scope.$index}['${field.value}']'`"
                    :rules="[
                      {
                        required: true,
                        message: `请选择${field.label}`,
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <el-input
                      class="not-mongolia"
                      :disabled="true"
                      v-model="scope.row[field.value]"
                    >
                      <template #append>
                        <el-icon
                          @click="
                            selectAcc(scope.row, scope.$index, colIndex, field)
                          "
                        >
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

<script setup name="defaultAuxiliarySettingModify">
import { useSelectData } from '@/hooks/useSelectData'
import { accasoaById, accountQueryServlet } from '@/api/base'
import {
  defaultAuxiliarySettingCreate,
  defaultAuxiliarySettingUpdate,
  defaultAuxiliarySettingGetbyId,
} from '@/api/rulesAndInitial/defaultAuxiliarySetting'
const { selectorInfo, selectorRef } = useSelectData()
const { proxy } = getCurrentInstance()
const emit = defineEmits()

const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const slotFieldId = ref('assValue')
const formRefs = ref([])
const showList = computed(() => {
  return tableInfo.value.fieldList.length > 0
})
const rowObj = ref({})
const _rowIndex = ref(null)
const _colIndex = ref(null)
// 列code
const _colCode = ref('')
// 列表头
const _colLabel = ref('')
// 辅助核算项的值Name
const assValueName = ref('')
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '修改辅助核算默认',
  },
  id: {
    type: [Number, String],
  },
  flowFormType: {
    type: String,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
})
const formInfo = ref({
  ref: null,
  disabled: false,
  data: {
    status: '1',
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
      maxlength: 200,
    },
  ],
  rules: {
    accbookName: [
      { required: true, message: '请选择核算账簿', trigger: 'change' },
    ],
    accasoaName: [
      { required: true, message: '请选择会计科目', trigger: 'blur' },
    ],
  },
  labelWidth: '120px',
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  selections: [],
  fieldList: [],
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
      label: '新增行',
      event: addRow,
      disabled: computed(() => {
        return tableInfo.value.fieldList.length === 0
      }),
    },
    {
      type: 'button',
      label: '删除行',
      event: removeRows,
      disabled: computed(() => {
        return !(
          tableInfo.value.fieldList.length > 0 &&
          tableInfo.value.selections.length > 0
        )
      }),
    },
  ],
})
// 动态插槽字段列表：从 fieldList 中提取 type='slot' 的字段
const slotFields = computed(() =>
  tableInfo.value.fieldList.filter((item) => item.type === 'slot'),
)
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
      formInfo.value.data.accchartId = userInfo.accchartId
      formInfo.value.data.accchartName = userInfo.accchartName
    }
  }
})

function getMain() {
  // 先调详情接口，在调查会计科目所带的辅助核算项目接口用于获取表头。
  defaultAuxiliarySettingGetbyId(
    props.id,
    'defaultAuxiliarySetting:detail',
  ).then((res) => {
    if (res && res.success) {
      formInfo.value.data = res.data
      if (res.data.detailVOList.length > 0) {
        // 1.直接取反参里面取表头 不调接口查，先这样写，有问题再改成接口查
        res.data.detailVOList[0].assVOs.forEach((item, index) => {
          tableInfo.value.fieldList.push({
            type: 'slot',
            label: item.accassitemName,
            value: index + 1 + ':' + item.accassitemId,
            accassitemId: item.accassitemId,
          })
        })
      }
      res.data.detailVOList.forEach((item) => {
        // 获取每一行的数据
        tableInfo.value.data.push({
          ...objToArr(item.assVOs),
        })
      })
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
    ...rowObj.value,
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
  tableInfo.value.fieldList = []
  if (row.originalId) {
    formInfo.value.data['accasoaOriginalId'] = row.originalId
    formInfo.value.data.accasoaName = row.code + ' ' + row.name
    formInfo.value.data['accasoaCode'] = row.code
    accasoaById(row.originalId).then((res) => {
      if (res && res.success) {
        res.data.accassList.forEach((item, index) => {
          tableInfo.value.fieldList.push({
            type: 'slot',
            label: item.accassitemName,
            value: index + 1 + ':' + item.accassitemId,
            accassitemId: item.accassitemId,
          })
          rowObj.value[index + 1 + ':' + item.accassitemId] = ''
          rowObj.value[index + 1 + ':' + item.accassitemId + 'Value'] = ''
        })
      }
    })
  } else {
    formInfo.value.data.accasoaOriginalId = ''
    formInfo.value.data.accasoaName = ''
    formInfo.value.data.accasoaCode = ''
    tableInfo.value.data = []
    tableInfo.value.fieldList = []
  }
}

function selectAcc(row, rowIndex, colIndex, field) {
  _rowIndex.value = rowIndex
  _colIndex.value = colIndex
  // 列的code取field.value（也就是辅助核算项的accassitemId）,例：编码：code，这里是仓库档案：'1'
  _colCode.value = field.value
  _colLabel.value = field.label
  let params = {
    accbookId: formInfo.value.data.accbookId || '',
    accassitemId: field.accassitemId,
  }
  accountQueryServlet(params).then((res) => {
    let data = {
      component: 'tree',
      title: '表头',
    }
    if (res && res.success) {
      res.data.queryFieldVOs.forEach((it) => {
        if (it.isName == '1') {
          assValueName.value = it.code
        }
      })
      if (res.data.refType === '1') {
        data.component = 'tree'
        data.title = res.data.title
        data.defaultDate = res.data.resultData
        data.showCheckbox = true
        if (row[slotFieldId.value]) {
          data.defaultCheckedKeys = row[slotFieldId.value].split(',')
        }
      } else if (res.data.refType === '2') {
        data.component = 'table'
        data.title = res.data.title
        data.defaultDate = res.data.resultData
        data.checkBox = true
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
        if (row[slotFieldId.value]) {
          data.defaultSelected = row[slotFieldId.value].split(',')
        }
      } else if (res.data.refType === '3') {
        data.component = 'supTreeTable'
        data.title = res.data.title
        data.rootName = res.data.title
        data.defaultDate = res.data.resultData
        data.checkBox = true
        data.query = {
          ...params,
          refFieldCode: res.data.refFieldCode,
        }
        data.clickParams = 'refFieldValue'
        data.code = 'id'
        data.tableDataName = 'resultData'
        data.apiList = accountQueryServlet
        if (row[slotFieldId.value]) {
          data.defaultSelected = row[slotFieldId.value].split(',')
        }
      }
    }
    data.callback = tableBack
    selectorRef.value.show(data)
  })
}
function tableBack(row) {
  // 点击的第几行
  if (row.length > 0) {
    let arr = []
    // 多选
    row.forEach((item, index) => {
      let _colValue = _colCode.value + 'Value'
      arr.push({
        ...tableInfo.value.data[_rowIndex.value],
        [_colValue]: item.id,
        [_colCode.value]: `【${_colLabel.value}:${item[assValueName.value]}】`,
      })
    })
    // 插入
    tableInfo.value.data.splice(_rowIndex.value, 1, ...arr)
  }
}
function arrToObj(rawData) {
  return (
    Object.entries(rawData)
      // 1. 过滤：只保留基础键（不以 'Value' 结尾的键），无论其值是否为空
      .filter(([key]) => !key.endsWith('Value'))
      .map(([key, nameStr]) => {
        // 提取冒号后的数字作为 ID
        const accassitemId = key.split(':')[1] || ''
        // 提取名称：如果值为空，则赋值为 ""；否则按正则提取冒号后的文本
        let assValueName = ''
        if (nameStr && nameStr.includes(':')) {
          assValueName = nameStr.replace(/【.*?:/, '').replace('】', '')
        }
        const assValue = rawData[`${key}Value`] || ''
        return {
          assValueName,
          assValue,
          accassitemId,
        }
      })
  )
}
function objToArr(rowArr) {
  let obj = {}
  rowArr.forEach((item, index) => {
    obj[`${index + 1}:${item.accassitemId}`] = item.assValueName
      ? `【${item.accassitemName}:${item.assValueName}】`
      : ''
    obj[`${index + 1}:${item.accassitemId}Value`] = item.assValue
      ? item.assValue
      : ''
  })
  return obj
}
function save() {
  formRefs.value = [proxy.$refs['modifyForm'].$refs['form']]
  proxy.$fn.checkForm(formRefs.value).then(() => {
    if (tableInfo.value.data.length === 0) {
      proxy.$message.warning('请添加默认信息')
      return
    }
    // 将tableInfo.value.data处理成后端需要的数据
    let arr = tableInfo.value.data.map((item) => ({
      assVOs: arrToObj(item),
    }))
    const hasEmptyRow = arr.some((item, index) => {
      // 兼容空字符串、null、undefined 和纯空格
      const isEmpty = item.assVOs.every(
        (ass) => !ass.assValue || !ass.assValue.trim(),
      )
      if (isEmpty) {
        proxy.$message.warning(`第 ${index + 1} 行至少填写一列数据`)
        return true // some 遇到 true 会立即停止遍历，避免连续弹窗
      }
      return false
    })

    // 4. 如果校验不通过，直接 return 阻止后续请求
    if (hasEmptyRow) return
    let params = {
      ...formInfo.value.data,
      detailVOList: arr,
    }
    // console.log('结果', params)
    let api = props.id
      ? defaultAuxiliarySettingUpdate
      : defaultAuxiliarySettingCreate
    let btnCode = props.id
      ? 'defaultAuxiliarySetting:update'
      : 'defaultAuxiliarySetting:add'
    api(params, btnCode).then((resp) => {
      if (resp && resp.success) {
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
