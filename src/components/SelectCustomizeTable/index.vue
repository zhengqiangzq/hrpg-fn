<template>
  <PageDialog
    :title="dialogInfo.title"
    v-model:visible="showDialog"
    :width="dialogInfo.width"
    :bt-list="dialogInfo.btList"
  >
    <div class="filter-wrapper">
      <!-- 条件栏 -->
      <NewPageFilter
        v-model:query="filterInfo.query.queryMap"
        :query-more-json="true"
        :isFromDialog="true"
        :filter-list="filterInfo.searchList"
        :filter-btn="filterInfo.searchBtn"
        :slip-select-request="slipSelectRequest"
      >
      </NewPageFilter>
      <div v-if="showSetPreference" class="display-flex">
        <el-button @click="preferenceInfo.visible = true">偏好设置</el-button>
      </div>
    </div>
    <el-form ref="tableForm" :model="tableInfo" style="width: 100%">
      <DialogTable
        ref="resourceTable"
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurpage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        v-model:query="filterInfo.query"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        :rowKey="rowKey"
        :highlight-row="highlightRow"
        :checkedList="checkedList"
        :reserve-selection="true"
        :check-box="checkBox"
        :checkedRowList="checkedRowList"
        @handleEvent="handleEvent"
      >
      <template v-for="item in slotArr" #[`col-${item}`]="scope">
          <span class="slip-edit" @click="slotHandle(item,scope.row)">{{
            scope.row[item]
          }}</span>
        </template>
      </DialogTable>
    </el-form>
  </PageDialog>
  <SetPreference
    v-if="preferenceInfo.visible"
    v-model:visible="preferenceInfo.visible"
    :search-list="filterInfo.searchList"
    :field-list="tableInfo.fieldList"
    :customize-user-v-o="filterInfo.query.customizeUserVO"
    @callback="setPreferenceCallback"
  />
</template>
<script setup name="selectCustomizeTable">
import SetPreference from '@/components/SetPreference/defaultSetPreference'
import PageDialog from '@/components/PageDialog'
import DialogTable from '@/components/DialogTable'
import NewPageFilter from '@/components/NewPageFilter'
import { getCustomizeSetting, updateUserCustomize } from '@/api/base'

const { proxy } = getCurrentInstance()
const emits = defineEmits(['callback', 'visible', 'reset', 'slotHandle'])
const props = defineProps({
  highlightRow: {
    type: Boolean,
    default: false,
  },
  checkBox: {
    type: Boolean,
    default: true,
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  title: {
    type: String,
    default: '选择产品',
  },
  api: {
    type: Function,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  showPrice: {
    type: Boolean,
    default: true,
  },
  query: {
    type: Object,
    default: function () {
      return {}
    },
  },
  queryParams: {
    type: Object,
    default: function () {
      return {}
    },
  },
  tableKey: {
    type: String,
    default: '',
  },
  checkedList: {
    type: Array,
    default: () => {
      return []
    },
  },
  checkedRowList: {
    type: Array,
    default: () => {
      return []
    },
  },
  saveEmpty: {
    type: Boolean,
    default: false,
  },
  showSetPreference: {
    type: Boolean,
    default: false,
  },
  defaultObj: {
    type: Object,
    default: () => {
      return {}
    },
  },
  // 不需要展示的筛选条件
  notShowListArr: {
    type: Array,
    default: () => {
      return []
    },
  },
  slotArr: {
    type: Array,
    default: () => {
      return []
    },
  },
})
const preferenceInfo = ref({
  visible: false,
})
// 过滤相关配置
const filterInfo = ref({
  query: {
    customizeUserVO: {},
    queryMap: props.query,
    queryParams: {},
  },
  data: {},
  searchList: [],
  searchBtn: [{ type: 'button', label: '查询', event: search }],
})
const slipSelectRequest = ref(true)
// 表格相关
const tableInfo = ref({
  refresh: 1,
  selection: [],
  initCurpage: 1,
  data: [],
  api: undefined,
  fieldList: [],
})
// 弹窗相关
const dialogInfo = ref({
  title: props.title,
  width: '1200px',
  btLoading: false,
  btList: [
    {
      label: '确定',
      type: 'primary',
      disabled: !props.saveEmpty,
      event: save,
      show: true,
    },
    { label: '取消', event: handleClose, show: true },
  ],
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件shows
  },
})
setData()
function setData() {
  tableInfo.value.fieldList = Object.values({
    ...proxy.$fn.deepClone(proxy.$fieldfList.FieldList),
    ...proxy.$fn.deepClone(props.defaultObj),
  })
  filterInfo.value.searchList = Object.values({
    ...proxy.$fn.deepClone(proxy.$fieldfList.FieldList),
    ...proxy.$fn.deepClone(props.defaultObj),
  })
  getCustomize()
}
// 获取列表
function getList() {
  tableInfo.value.refresh = Math.random()
}
function search() {
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}
function slotHandle(code, row) {
  emits('slotHandle', code, row)
}
function save() {
  handleClose()
  emits('callback', tableInfo.value.selection)
}
function handleEvent(event, data) {
  switch (event) {
    case 'tableClickRow':
      tableInfo.value.selection = data
      if (!props.saveEmpty) {
        dialogInfo.value.btList[0].disabled = !tableInfo.value.selection
      }
      break
    case 'tableCheck':
      tableInfo.value.selection = data
      if (!props.saveEmpty) {
        dialogInfo.value.btList[0].disabled = !tableInfo.value.selection
      }
      break
  }
}
// 关闭弹窗前的回调
function handleClose() {
  showDialog.value = false
  emits('reset')
}
function setPreferenceCallback(obj) {
  updateUserCustomize(obj.customizeUserVO).then((res) => {
    if (res && res.success) {
      getCustomize(!slipSelectRequest.value)
    }
  })
}
function getCustomize(_slipSelectRequest = true) {
  let param = { tableKey: props.tableKey }
  getCustomizeSetting(param).then((res) => {
    if (res && res.success) {
      let data = res.data
      tableInfo.value.fieldList = proxy.$fn.setFieldList(
        tableInfo.value.fieldList,
        data.detail
      )
      let searchInfo = proxy.$fn.setSearchList(
        filterInfo.value.searchList,
        data.detail
      )
      filterInfo.value.searchList = searchInfo.searchList
      filterInfo.value.searchList.forEach((item) => {
        if (props.notShowListArr.includes(item.value)) {
          item.show = false
        }
        item.event = search
      })
      filterInfo.value.query.customizeUserVO = data
      if (props.showSetPreference) {
        filterInfo.value.query.queryMap = {
          ...props.query,
          ...filterInfo.value.query.queryMap,
          ...searchInfo.queryMap,
        }
      } else {
        filterInfo.value.query.queryMap = {
          ...searchInfo.queryMap,
          ...props.query,
          ...filterInfo.value.query.queryMap,
        }
      }
      filterInfo.value.query.queryParams = {
        ...filterInfo.value.query.queryParams,
        ...props.queryParams,
      }
      slipSelectRequest.value = _slipSelectRequest
      tableInfo.value.api = props.api
      getList()
    }
  })
}
</script>

<style scoped lang="scss"></style>
