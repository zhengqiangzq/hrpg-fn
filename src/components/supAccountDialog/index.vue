<template>
  <page-dialog
    :title="dialogInfo.title"
    v-model:visible="showDialog"
    :width="dialogInfo.width"
    :bt-loading="dialogInfo.btLoading"
    :bt-list="dialogInfo.btList"
  >
    <SupTable ref="supTableRef" :id="props.id" :data="props.tableData" :checkBox="props.checkBox" :accbookId="props.data.accbookId" />
  </page-dialog>
</template>

<script setup name="SupAccountDialog">
import SupTable from './table.vue'

const emit = defineEmits(['callback', 'update:visible'])
const props = defineProps({
  title: {
    type: String,
    default: '选择辅助核算',
  },
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: '',
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  tableData: {
    type: Object,
    default: () => ([]),
  },
  checkBox: {
    type: Boolean,
    default: false,
  },
})

const supTableRef = ref(null)

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

const dialogInfo = ref({
  title: props.title,
  width: '800px',
  btLoading: false,
  btList: [
    { label: '确定', type: 'primary', event: handleConfirm, show: true },
    { label: '取消', event: handleClose, show: true },
  ],
})

function handleClose() {
  showDialog.value = false
}

function handleConfirm() {
  const tableData = supTableRef.value?.getTableData() || []
  emit('callback', tableData)
  handleClose()
}
</script>

<style scoped></style>
