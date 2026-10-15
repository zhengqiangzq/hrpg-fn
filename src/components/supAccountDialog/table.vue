<template>
  <page-table
    :refresh="tableInfo.refresh"
    v-model:data="innerData"
    :api="tableInfo.api"
    :pager="tableInfo.pager ?? false"
    :query="tableInfo.query"
    :field-list="computedFieldList"
    :handle="tableInfo.handle"
    :check-box="tableInfo.checkBox ?? false"
    :tabIndex="tableInfo.tabIndex ?? false"
    @handleEvent="handleTableEvent"
  >
    <template
      v-for="slotName in colSlotNames"
      :key="slotName"
      #[slotName]="scope"
    >
      <slot :name="slotName" :row="scope.row" :index="scope.$index">
        <el-input
          v-model="scope.row[slotField]"
          class="not-mongolia"
          style="width: 100%"
          :required="true"
          disabled
        >
          <template #append>
            <el-icon @click="SelectSupAccount(scope.row, scope.$index)">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </slot>
    </template>
  </page-table>
  <SelectData ref="selectorRef" />
</template>

<script setup name="SupAccountDialog">
import { ref, computed, watch } from 'vue'
import { accasoaById, accountQueryServlet } from '@/api/base'
import { useSelectData } from '@/hooks/useSelectData'
const { selectorInfo, selectorRef } = useSelectData()

const { proxy } = getCurrentInstance()
const props = defineProps({
  data: {
    type: Array,
    default: undefined,
  },
  id: {
    type: String,
    default: '',
  },
  accbookId: {
    type: [String, Number],
    default: '',
  },
  fieldList: {
    type: Array,
    default: () => [],
  },
  checkBox: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:data'])

const defaultFieldList = [
  { label: '辅助核算项', value: 'accassitemName' },
  { label: '辅助核算内容', value: 'assName', asValue: 'assValue', type: 'slot' },
]

const computedFieldList = computed(() =>
  props.fieldList.length > 0 ? props.fieldList : defaultFieldList,
)

const slotField = computed(() => {
  const slotItem = computedFieldList.value.find((item) => item.type === 'slot')
  return slotItem ? slotItem.value : 'supAccText'
})
const slotFieldId = computed(() => {
  const slotItem = computedFieldList.value.find((item) => item.type === 'slot')
  return slotItem ? slotItem.asValue : 'supAccId'
})
const colSlotNames = computed(() =>
  computedFieldList.value
    .filter((item) => item.type === 'slot')
    .map((item) => `col-${item.value}`),
)
const assValueName = ref('')
const assValueCode = ref('')
const isControlled = computed(
  () => Array.isArray(props.data)&&props.data.length>0,
)
const internalData = ref([])
const innerData = computed({
  get: () => (isControlled.value ? props.data : internalData.value),
  set: (val) => {
    if (isControlled.value) {
      emit('update:data', val)
    } else {
      internalData.value = val
    }
  },
})

const tableInfo = ref({
  refresh: 1,
  api: undefined,
  query: {},
  handle: undefined,
  pager: false,
  checkBox: false,
  tabIndex: false,
})
let callback = null
let onClose = null
let _index = ref(null)
function SelectSupAccount(row, index) {
  _index.value = index
  console.log('拿到行数据', row)
  let params = {
    accbookId: props.accbookId || '',
    accassitemId: row.accassitemId,
  }
  accountQueryServlet(params).then((res) => {
    console.log('==2', res)
    res.data.queryFieldVOs.forEach((it) => {
        if (it.isName == '1') {
          assValueName.value = it.code
        }
        if(it.isCode == '1'){
          assValueCode.value = it.code
        }
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
        data.showCheckbox = props.checkBox
        if(row[slotFieldId.value]){
          data.defaultCheckedKeys=row[slotFieldId.value].split(',')
        }
        // data.callback=treeBack
      } else if (res.data.refType === '2') {
        data.component = 'table'
        data.title = res.data.title
        data.defaultDate = res.data.resultData
        data.checkBox = props.checkBox
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
        if(row[slotFieldId.value]){
          data.defaultSelected=row[slotFieldId.value].split(',')
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
        data.checkBox = props.checkBox
        data.query = {
          ...params,
          refFieldCode: res.data.refFieldCode,
        }
        data.clickParams = 'refFieldValue'
        data.code = 'id'
        data.tableDataName = 'resultData'
        data.apiList = accountQueryServlet
        // data.callback=treeTableBack
        if(row[slotFieldId.value]){
          data.defaultSelected=row[slotFieldId.value].split(',')
        }
      }
    }
    data.callback = tableBack
    selectorRef.value.show(data)
    // tableInfo.value.data = res.data.list
    // tableInfo.value.refresh = Math.random()
  })
}
function handleTableEvent(event, data) {
  // 处理表格事件，如选择变化等
  if (tableInfo.value.handleEvent) {
    tableInfo.value.handleEvent(event, data)
  }
}

function tableBack(row) {
  console.log('tableBack', row)

  if (innerData.value[_index.value]) {
    innerData.value[_index.value] = {
      ...innerData.value[_index.value],
      [slotField.value]: row.codeAndName,
      'assValueName': row[assValueName.value],
      'assValueCode': row[assValueCode.value],
      [slotFieldId.value]: row.id,
    }
  }
  if(row.length>0 && innerData.value[_index.value]){
    const newData = [...innerData.value]
    let str=[]
    let ids=[]
    row.forEach((item) => {
      str.push(item.codeAndName)
      ids.push(item.id)
    })
    newData[_index.value] = {
      ...newData[_index.value],
      [slotField.value]: str.join(','),
      [slotFieldId.value]: ids.join(','),
    }
    innerData.value = newData

  }
}
onMounted(() => {
  if (props.id) {
    accasoaById(props.id).then((res) => {
      if (res && res.success) {
        innerData.value = res.data.accassList || []
      }
    })
  }
})

defineExpose({
  getTableData: () => innerData.value,
})
</script>

<style scoped></style>
