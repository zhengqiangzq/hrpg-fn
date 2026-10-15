<template>
  <!-- 条件栏 -->
  <NewPageFilter
    v-model:query="query"
    :filter-list="info.hiddenFilter ? [] : searchList"
    :filter-btn="info.hiddenFilter ? [] : searchBtn"
    :clear-type="clearType"
  />
  <!-- 批量操作栏 -->
  <NewPageFilter v-if="batchBtns.length" :filter-btn="batchBtns" />
  <DialogTable
    ref="dialogTableRef"
    :refresh="refreshFlag"
    :init-curpage="initCurpage"
    v-model:data="tableData"
    :api="api"
    :listen-height="false"
    :pager="pager"
    v-model:query="query"
    :field-list="fieldList"
    :handle="handle"
    :highlight-row="true"
    :reserveSelection="true"
    :check-box="isCheckBox"
    :checked-row-list="checkedRowList"
    :checkedList="checkedList"
    @handleEvent="handleEvent"
  />
</template>

<script setup>
import NewPageFilter from '@/components/NewPageFilter/index.vue'
import DialogTable from '@/components/DialogTable/index.vue'

const { proxy } = getCurrentInstance()

const emits = defineEmits(['update:modelValue', 'handleEvent'])
const props = defineProps({
  modelValue: null,
  info: { type: Object, default: () => ({}) },
  checkBox: { type: Boolean, default: false },
})

const selectRow = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val),
})

// ---- 查询相关 ----
const query = ref({})
const initQuery = ref({})
const refreshFlag = ref(1)
const initCurpage = ref(1)
const tableData = ref([])
const clearType = ref(true)

// ---- 表格配置 ----
const api = ref(null)
const pager = ref(true)
const isCheckBox = ref(false)
const fieldList = ref([])
const handle = ref([])
const dialogTableRef = ref(null)
const checkedRowList = ref([])
const checkedList = ref([])
const queryFieldVOsList = ref([])
// 默认选中值
const defaultSelected = ref(null)

// 判断是否使用 queryFieldVOs 模式
const useQueryFieldVOs = computed(() => !!props.info?.queryFieldVOs)

watch(tableData, (val) => {
  if (!val?.length || !defaultSelected.value) return
  if (!isCheckBox.value) {
    // 单选模式：高亮当前行
    nextTick(() => {
      dialogTableRef.value?.setCurrentRow(defaultSelected.value)
    })
  } else {
    if (!props.info.defaultDate) {
      let arr = [...checkedList.value]
      const rowKey = dialogTableRef.value?.rowKey || 'id'
      const matchedRows = val.filter((row) => arr.includes(row[rowKey]))
      checkedRowList.value = matchedRows
    }
  }
})

// 搜索字段列表
const searchList = computed(() => {
  // queryFieldVOs 模式
  if (useQueryFieldVOs.value) {
    const filters = props.info?.queryFieldVOs
    const filterArr = []
    filters.forEach((it) => {
      if (it.isWhere == '1') {
        filterArr.push({
          label: it.name,
          value: it.code,
          componentType: 'input',
          event: search,
        })
        queryFieldVOsList.value.push(it)
      }
    })
    return filterArr
  }
  // filters 模式
  const filters = props.info?.filters
  if (!filters) {
    return [
      {
        componentType: 'input',
        label: '编码',
        clearable: true,
        value: 'code',
        event: search,
      },
      {
        componentType: 'input',
        label: '名称',
        clearable: true,
        value: 'name',
        event: search,
      },
    ]
  }
  return filters.map((it) => {
    const item = { ...it }
    if (item.type && !item.componentType) item.componentType = item.type
    if (!item.event) item.event = search
    return item
  })
})

// 按钮列表（查询 + 重置）
const searchBtn = ref([
  { type: 'button', label: '查询', btType: 'primary', event: search },
  { type: 'button', label: '重置', event: reset },
])
// 批量操作按钮（独立一行）
const batchBtns = ref([])

onMounted(() => {
  const info = props.info || {}
  isCheckBox.value = info.checkBox ?? false
  console.log('info', info)
  query.value = Object.assign({}, info.query)
  initQuery.value = proxy.$fn.deepClone(query.value)
  api.value = info.api ?? null
  pager.value = info.pager ?? true
  fieldList.value = info.fieldList || [
    { label: '编码', value: 'code' },
    { label: '名称', value: 'name' },
  ]
  // 包装 handle.btList 事件，注入 refresh 回调
  const rawHandle = info.handle || {}
  if (rawHandle.btList) {
    handle.value = {
      ...rawHandle,
      btList: rawHandle.btList.map((bt) => ({
        ...bt,
        event:
          typeof bt.event === 'function'
            ? (row, index) => bt.event(row, { refresh: search })
            : bt.event,
      })),
    }
  } else {
    handle.value = rawHandle
  }
  // 支持通过 info.filterBtns 设置批量操作按钮（独立一行，位于搜索栏下方）
  if (info.filterBtns?.length) {
    batchBtns.value = info.filterBtns.map((btn) => ({
      ...btn,
      disabled:
        typeof btn.disabled === 'function'
          ? () => btn.disabled(selectRow.value)
          : btn.disabled,
      event: () => {
        if (typeof btn.event === 'function') {
          btn.event(selectRow.value, { refresh: search })
        }
      },
    }))
  }
  // 默认选中
  if (info.defaultSelected !== undefined && info.defaultSelected !== null) {
    defaultSelected.value = info.defaultSelected
    if (isCheckBox.value) {
      const arr = Array.isArray(info.defaultSelected)
        ? info.defaultSelected
        : [info.defaultSelected]
      selectRow.value = arr
      checkedList.value = arr
      // 如果有 defaultDate（不走 API），从数据中找到行对象传给 checkedRowList
      if (info.defaultDate?.length) {
        const rowKey = dialogTableRef.value?.rowKey || 'id'
        const matchedRows = info.defaultDate.filter((row) =>
          arr.includes(row[rowKey]),
        )
        checkedRowList.value = matchedRows
      } else {
        // 走 API 时，暂存 ID，由 DialogTable getList 加载后匹配
        checkedList.value = arr
      }
    } else {
      selectRow.value = info.defaultSelected
    }
  }
  if (info.defaultDate) {
    tableData.value = info.defaultDate || []
    dialogTableRef.value?.setListInfoTotal(info.total || 0)
    return
  }
  if (api.value) {
    search()
  }
})

function search() {
  // queryFieldVOs 模式：处理 queryFieldVOsList
  if (useQueryFieldVOs.value) {
    queryFieldVOsList.value.forEach((item) => {
      if (query.value[item.code]) {
        item.value = query.value[item.code]
      } else {
        item.value = null
      }
    })
    query.value = {
      ...query.value,
      queryFieldVOs: queryFieldVOsList.value,
    }
  }

  initCurpage.value = Math.random()
  refreshFlag.value = Math.random()
}

function reset() {
  query.value = proxy.$fn.deepClone(initQuery.value)
  clearType.value = !clearType.value
  nextTick(() => search())
}

function handleEvent(event, data) {
  console.log('==2', event, data)
  switch (event) {
    case 'tableClickRow':
      if (isCheckBox.value) return
      selectRow.value = data
      break
    case 'tableCheck':
      selectRow.value = data
      break
  }
}
</script>

<style scoped lang="scss"></style>
