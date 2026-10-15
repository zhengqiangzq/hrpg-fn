<template>
  <page-dialog
      v-if="shows"
      :title="dialogInfo.title"
      v-model:visible="shows"
      :width="dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.hiddenBtn ? [] : dialogInfo.btList"
      @reset="handleClose"
  >
  <!-- {{ selectorInfo.component }} -->
    <select-tree v-if="selectorInfo.component === 'tree'" v-model="selectRow" :info="selectorInfo" />
    <SelectTreeTable v-if="selectorInfo.component === 'treeTable'" v-model="selectRow" :info="selectorInfo" />
    <SupSelectTreeTable v-else-if="selectorInfo.component === 'supTreeTable'" v-model="selectRow" :info="selectorInfo" @titleChange="getTitle" />
    <select-table v-else-if="selectorInfo.fieldList" v-model="selectRow" :info="selectorInfo" />
  </page-dialog>
</template>

<script setup>
import PageDialog from '../PageDialog/index'
import {ref, watch} from "vue";
import SelectTable from "./selectTable.vue";
import SelectTreeTable from "./selectTreeTable.vue";
import SupSelectTreeTable from "./supSelectTreeTable.vue";
import SelectTree from "./selectTree.vue";

const { proxy } = getCurrentInstance()

const shows = ref(false)

// 弹窗相关
const dialogInfo = ref({
  title: '选择数据',
  width: '800px',
  btLoading: false,
  btList: [
    {
      label: '确定',
      type: 'primary',
      disabled: true,
      event: save,
      show: true,
    },
    { label: '取消', event: handleClose, show: true },
  ],
  hiddenBtn: false
})
const selectRow = ref('')
const saveEmpty = ref(true)
const selectorInfo = ref(null)
let callback = null
let onClose = null

watch(() => selectRow.value, (val) => {
  if (!saveEmpty.value && !dialogInfo.value.hiddenBtn) {
    dialogInfo.value.btList[0].disabled = Array.isArray(val) ? !val.length : (!val || Object.keys(val).length === 0)
  }
}, { immediate: true })

function save() {
  console.log('lkjhgf',selectRow.value);
  handleClose()
  callback && callback(selectRow.value)
}
function getTitle(title) {
  dialogInfo.value.title = title
}
// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  onClose && onClose()
}

function show(info) {
  dialogInfo.value.title = info.title || '选择数据'
  dialogInfo.value.width = info.width || info.component === 'tree' ? '800px' : '1000px'
  dialogInfo.value.hiddenBtn = info.hiddenBtn || false
  selectRow.value = info.checkBox ?? false ? [] : {}
  saveEmpty.value = info.saveEmpty ?? true
  if(!dialogInfo.value.hiddenBtn) {
    dialogInfo.value.btList[0].disabled = !saveEmpty.value
  }
  onClose = info.onClose
  callback = info.callback
  selectorInfo.value = info
  shows.value = true
}

function hide() {
  handleClose()
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
:deep(.el-dialog__body) {
  height: 355px;
  display: flex;
  flex-direction: column;
}
</style>
