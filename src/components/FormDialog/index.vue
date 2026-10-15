<template>
  <PageDialog
    v-if="visible"
    :title="dialogInfo.title"
    :visible="visible"
    :width="dialogInfo.width"
    :bt-loading="dialogInfo.btLoading"
    :bt-list="dialogInfo.btList"
    @reset="handleClose"
  >
    <page-form
      ref="formRef"
      v-model:ref-obj="formRefObj"
      :data="formData"
      :field-list="dialogInfo.fieldList"
      :rules="dialogInfo.rules"
      :label-width="dialogInfo.labelWidth"
    />
  </PageDialog>
</template>

<script setup name="FormDialog">
const visible = ref(false)
const formRef = ref(null)
const formRefObj = ref(null)
const formData = ref({})
const dialogInfo = ref({
  title: '',
  width: '800px',
  btLoading: false,
  fieldList: [],
  rules: {},
  labelWidth: '140px',
  btList: [
    { label: '确定', type: 'primary', event: handleConfirm, show: true },
    { label: '取消', event: handleClose, show: true },
  ],
})

let callback = null
let onClose = null

function handleClose() {
  visible.value = false
  onClose && onClose()
}

function handleConfirm() {
  if (!formRefObj.value) {
    handleClose()
    callback && callback(formData.value)
    return
  }
  formRefObj.value.validate((valid) => {
    if (valid) {
      handleClose()
      callback && callback({ ...formData.value })
    }
  })
}

function show(info) {
  dialogInfo.value.title = info.title || ''
  dialogInfo.value.width = info.width || '800px'
  dialogInfo.value.fieldList = info.fieldList || []
  dialogInfo.value.rules = info.rules || {}
  dialogInfo.value.labelWidth = info.labelWidth || '140px'
  callback = info.callback
  onClose = info.onClose
  // 清空并重新赋值表单数据
  Object.keys(formData.value).forEach((k) => delete formData.value[k])
  Object.assign(formData.value, info.formData || {})
  visible.value = true
}

function hide() {
  visible.value = false
}

defineExpose({ show, hide })
</script>

<style scoped></style>
