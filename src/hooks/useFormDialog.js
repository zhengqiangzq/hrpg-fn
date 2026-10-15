import { formDialogTemplate } from './formDialogTemplate'
import cloneDeep from 'lodash/cloneDeep'

export function useFormDialog() {
  const formDialogInfo = reactive({})
  const formDialogRef = ref()

  function show() {
    const info = cloneDeep(formDialogTemplate[formDialogInfo.type] || {})
    const raw = toRaw(formDialogInfo)
    formDialogRef.value.show({
      ...info,
      ...raw,
      onClose: () => (formDialogInfo.visible = false),
    })
  }

  function hide() {
    formDialogRef.value?.hide()
    const raw = toRaw(formDialogInfo)
    Object.keys(raw).forEach((key) => delete raw[key])
  }

  watch(
    () => formDialogInfo.visible,
    (visible) => {
      if (visible) {
        show()
      } else {
        hide()
      }
    }
  )

  return {
    formDialogInfo: formDialogInfo,
    formDialogRef,
  }
}
