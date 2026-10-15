<template>
  <div>
    <el-dialog draggable
      :append-to-body="true"
      title="选择打印机"
      v-model="showDialog"
      class="dialogBox"
      width="400px"
      :close-on-click-modal="false"
      :modal="true"
      top="25vh"
      @close="cancel"
    >
      <div style="text-align: center">
        <el-select
          v-model="printer"
          placeholder="请选择打印机"
          filterable
          style="width: 100%;margin: 20px 0"
          :filterMethod="filterMethod"
          @visible-change="visibleChange"
        >
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button
          type="primary"
          :disabled="printer === ''"
          @click="confirm"
          >{{ $t('btn_confirm') }}</el-button
          >
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="chosePrinter">
import pinyin from 'js-pinyin'
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
const options = ref([])
const copyOptions = ref([])
const printer = ref('')

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件shows
  },
})

watch(
  () => printer.value,
  (val) => {
    window.localStorage.setItem('printerIndex', val)
  }
)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      options.value = proxy.$fn.getLocalPrinterList()
      copyOptions.value = proxy.$fn.deepClone(options.value)
    }
  }
)
function visibleChange(val) {
  //下拉框出现/隐藏时触发
  if (!val) {
    options.value = copyOptions.value
  }
}
function filterMethod(value) {
  //	自定义查询方法
  if (value) {
    let result = []
    copyOptions.value.forEach((item) => {
      pinyin.setOptions({ checkPolyphone: false, charCase: 1 })
      const resultEng = pinyin.getCamelChars(item.key).toUpperCase()
      const matchResult = item.key.indexOf(value) !== -1 || resultEng.indexOf(value.toUpperCase()) !== -1
      // let matchResult = PinYinMatch.match(item.key, value)
      if (matchResult) {
        result.push(item)
      }
    })
    options.value = result
  } else {
    options.value = copyOptions.value
  }
}
function cancel() {
  emits('callBack', false)
}
function confirm() {
  emits('callBack', printer.value)
}

onMounted(() => {
  if (
    window.localStorage.getItem('printerIndex') !== undefined &&
    window.localStorage.getItem('printerIndex') !== null
  ) {
    printer.value = parseInt(window.localStorage.getItem('printerIndex'))
  }
})
</script>
