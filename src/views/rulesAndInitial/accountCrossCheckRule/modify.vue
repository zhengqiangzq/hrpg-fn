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
            :list-type-info="listTypeInfo"
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
                  <el-icon @click="selectAccountBook"><Search /></el-icon>
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
          <p>控制明细</p>
        </div>
        <div class="model-panel-body">
          <SupTable
            ref="supTableRef"
            v-model:data="tableInfo.data"
            :accbookId="formInfo.data.accbookId"
            :field-list="tableInfo.fieldList"
            :checkBox="true"
          />
        </div>
      </div>
    </NewFullScreen>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="accountCrossCheckRuleModify">
import { useSelectData } from '@/hooks/useSelectData'
import { accasoaById } from '@/api/base'
import {
  parallelAccountRuleGetbyId,
  parallelAccountRuleUpdate,
  parallelAccountRuleCreate,
} from '@/api/rulesAndInitial/accountCrossCheckRule'
import SupTable from '@/components/supAccountDialog/table.vue'
import { computed } from 'vue'
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
    default: '修改科目交叉校验规则',
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
const userInfo = proxy.$store.state.systemConfig?.userLoginConfig
const listTypeInfo = ref({
  accList: [],
})
const lastAccassValues = ref([])
const formRefs = ref([])
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
      label: '会计科目',
      value: 'accasoaName',
      type: 'slot',
      required: true,
    },
    {
      label: '辅助核算项',
      value: 'accassItemId',
      multiple: true,
      type: 'select',
      list: 'accList',
      disabled: computed(() => {
        return !formInfo.value.data.accasoaOriginalId
      }),
      required: true,
      event: 'changeAccass',
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
      { required: true, message: '请选择核算账簿', trigger: 'blur' },
    ],
    accasoaName: [
      { required: true, message: '请选择会计科目', trigger: 'blur' },
    ],
    accassItemId: [
      { required: true, message: '请选择辅助核算项', trigger: 'blur' },
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
  fieldList: [
    {
      label: '辅助核算项',
      value: 'accassitemCodeName',
    },
    {
      label: '辅助核算项值',
      value: 'ass',
      asValue: 'accassitemValue',
      type: 'slot',
    },
  ]
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

async function getMain() {
  listTypeInfo.value.accList=[]
  parallelAccountRuleGetbyId(props.id, 'accountCrossCheckRule:detail').then(
    async (res) => {
      if (res && res.success) {
        if (res.data.accasoaOriginalId) {
          await accasoaById(res.data.accasoaOriginalId).then((res) => {
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
        }
        formInfo.value.data = res.data
        formInfo.value.data.accassItemId =
          formInfo.value.data.accassItemId?.split(',')
        lastAccassValues.value = formInfo.value.data.accassItemId
        tableInfo.value.data = res.data.detailList
      }
    },
  )
}

function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
    case 'changeAccass':
      handleChangeAccass(data)
      break
  }
}
function handleChangeAccass(values) {
  const accList = listTypeInfo.value.accList
  const newValues = values || []
  // 只关心新增的那一项（用户当前选中的）
  const added = newValues.find((v) => {
    return !lastAccassValues.value.includes(v)
  })
  const removed = lastAccassValues.value.find((v) => !newValues.includes(v))
  const findItem = (value) => accList.find((item) => item.value === value)
  // 新增的当前选择项
  if (added) {
    const currentItem = findItem(added)
    tableInfo.value.data.push({
      accassitemCodeName: currentItem.label + ' ' + currentItem.key,
      accassitemId: currentItem.value,
      ass: null,
    })
  }

  // 删除的项
  if (removed) {
    const removedItem = findItem(removed)
    tableInfo.value.data = tableInfo.value.data.filter(
      (item) => item.accassitemId !== removedItem.value,
    )
  }

  lastAccassValues.value = [...newValues]
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
  } else {
    formInfo.value.data.accbookId = ''
    formInfo.value.data.accbookName = ''
  }
  formInfo.value.data.accasoaOriginalId = ''
  formInfo.value.data.accasoaName = ''
  formInfo.value.data.accasoaCode = ''
  formInfo.value.data.accassItemId = []
  tableInfo.value.data = []
  lastAccassValues.value = []
}
function selectSubject() {
  if (!formInfo.value.data.accbookId) return
  selectorInfo.type = 'Account'
  selectorInfo.query = {
    accbookId: formInfo.value.data.accbookId,
    isLastVersion: true,
    status: '1',
  }
  selectorInfo.clickParams = 'id'
  selectorInfo.code = 'id'
  selectorInfo.callback = handleAccountSelected
  selectorInfo.visible = true
}
function handleAccountSelected(row) {
  listTypeInfo.value.accList = []
  formInfo.value.data.accassItemId = []
  tableInfo.value.data = []
  lastAccassValues.value = []
  if (row.originalId) {
    formInfo.value.data['accasoaOriginalId'] = row.originalId
    formInfo.value.data.accasoaName = row.code + ' ' + row.name
    formInfo.value.data['accasoaCode'] = row.code

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
  }
}
function save() {
  formRefs.value=[
    proxy.$refs['modifyForm'].$refs['form'],
  ]
  proxy.$fn.checkForm(formRefs.value).then(() => {
    let params = {
      ...formInfo.value.data,
      accassItemId: formInfo.value.data.accassItemId.join(','),
    }
    // 校验辅助核算项值不能为空
    const emptyRow = tableInfo.value.data.find(
      (item) => !item.accassitemValue || item.accassitemValue.trim() === '',
    )
    if (emptyRow) {
      proxy.$message.warning(
        `辅助核算项“${emptyRow.accassitemCodeName}”的值不能为空`,
      )
      return
    }
    let arr = tableInfo.value.data.flatMap((item) => {
      if (!item.accassitemValue || item.accassitemValue.length === 0) {
        return [] // 返回空数组，flatMap 会自动忽略
      }
      const valueArr = item.accassitemValue.split(',')
      const assArr = item.ass ? item.ass.split(',') : []

      return valueArr.map((val, index) => ({
        accassitemCodeName: item.accassitemCodeName,
        accassitemId: item.accassitemId,
        accassitemValue: val.trim(),
        ass: (assArr[index] || '').trim(),
      }))
    })
    params['detailList'] = arr
    const api = props.id ? parallelAccountRuleUpdate : parallelAccountRuleCreate
    const btnCode = props.id
      ? 'accountCrossCheckRule:update'
      : 'accountCrossCheckRule:add'
    // console.log('结果', params)

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
