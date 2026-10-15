<template>
  <el-select
    v-model="selectValue"
    :class="randomId"
    :id="randomId"
    :multiple="$attrs.multiple"
    :key="isMultiple"
    style="width: 100%"
    collapse-tags
    placeholder=""
    :filterMethod="filterMethod"
    @change="changeSelectValue"
    @visible-change="visibleChange"
    @input="inputSelect"
  >
    <el-option
      v-for="(item, index) in options"
      :key="item.value || index"
      :label="
        getLen(item.key) > 20 ? item.key.substring(0, 20) + '...' : item.key
      "
      :value="item.value"
    />
  </el-select>
</template>

<script setup name="slipSelect">
import pinyin from 'js-pinyin'
const { proxy } = getCurrentInstance()
const emits = defineEmits()
const props = defineProps({
  modelValue: {
    type: [Number, String, Array],
  },
  api: {
    type: Function,
  },
  query: {
    type: Object,
  },
  keyField: {
    type: String,
    default: 'name',
  },
  valueField: {
    type: String,
    default: 'id',
  },
  defaultValue: {
    type: Boolean,
    default: false,
  },
  divisionName: {
    //作为查询条件时区分是哪一个下拉选
    type: String,
    default: '',
  },
  clearType: {
    type: Boolean,
    default: true,
  },
  slipSelectRequest: {
    type: Boolean,
    default: false,
  },
  isMultiple: {
    type: String,
  },
  isMaterialDrug: {
    //是否同时支持物资药品
    type: Boolean,
    default: false,
  },
})
const filterInfo = ref({
  query: props.query,
})
const randomId = ref('class' + Math.random().toString(8).substring(2))
const selectValue = ref(proxy.$attrs.multiple ? [] : '')
const options = ref([])
const copyOptions = ref([])
// 单选多选数据类型为字符串和数组
function setSelectValue() {
  return proxy.$attrs.multiple ? [] : ''
}
watch(
  () => props.modelValue,
  (val) => {
    console.log('selectValue', val)
    if (val) {
      if (proxy.$attrs.multiple) {
        //转整型
        selectValue.value = proxy.$fn.splitArr(val).map((item) => {
          return item.toString()
        })
      } else {
        selectValue.value = val.toString()
      }
    } else {
      selectValue.value = setSelectValue()
    }
  }
)
watch(
  () => props.clearType,
  (val) => {
    // selectValue.value = setSelectValue()
  }
)
watch(
  () => props.slipSelectRequest,
  (val) => {
    const _str = props.api?.toString() + JSON.stringify(filterInfo.value.query)
    initData(proxy.$store.state.app.repeatApi[_str])
  }
)
watch(
  () => selectValue.value,
  (val) => {
    if (Array.isArray(val)) {
      setTimeout(() => {
        options.value = copyOptions.value
      }, 0)
      emits('update:modelValue', val.toString())
    }
  }
)
const unsubscribe = watch(
  () => proxy.$store.state.app.repeatApi,
  (val) => {
    const _str = props.api?.toString() + JSON.stringify(filterInfo.value.query)
    if (val.hasOwnProperty(_str) && val[_str].length) {
      initData(val[_str])
    } else if(!val.hasOwnProperty(_str)) {
      proxy.$store.dispatch('app/setRepeatApi', {  key: _str,  value: [] })
      init()
    }
  },
  {
    immediate: true,
    deep: true
  }
)

onMounted(() => {
  
})
onBeforeUnmount(() => {
  // 组件卸载时取消监听
  unsubscribe()
})
onDeactivated(() => {
  // 组件卸载时取消监听
  unsubscribe()
})

function inputSelect() {
  if (proxy.$attrs.multiple && proxy.$attrs.filterable) {
    const filterValue = document
      .getElementsByClassName(randomId.value)[0]
      .getElementsByClassName('el-select__input')[0].value
    filterMethod(filterValue, true)
  }
}
function visibleChange(val) {
  //下拉框出现/隐藏时触发
  if (!val) {
    options.value = copyOptions.value
  }
}
function filterMethod(value, isMultAndFilter) {
  if (proxy.$attrs.multiple && proxy.$attrs.filterable && !isMultAndFilter) {
    return
  }
  // 自定义查询方法
  if (value) {
    let result = []
    copyOptions.value.forEach((item) => {
      pinyin.setOptions({ checkPolyphone: false, charCase: 1 })
      const resultEng = pinyin.getCamelChars(item.key).toUpperCase()
      const matchResult =
        item.key.indexOf(value) !== -1 ||
        resultEng.indexOf(value.toUpperCase()) !== -1
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
function initData(data) {
  options.value = data
  copyOptions.value = proxy.$fn.deepClone(data)
  let _modelValue =
    typeof props.modelValue === 'number'
      ? props.modelValue.toString()
      : props.modelValue
  if (_modelValue) {
    if (proxy.$attrs.multiple) {
      if (_modelValue.length) {
        selectValue.value = proxy.$fn
          .splitArr(_modelValue)
          .map((item) => item.toString())
      }
    } else {
      selectValue.value = _modelValue
    }
  } else {
    selectValue.value = _modelValue
  }
  if (props.defaultValue && data.length) {
    selectValue.value = options.value[0].value
    emits('update:modelValue', options.value[0].value)
    emits('changeValue')
  }
}
function getLen(str = '') {
  if (str) {
    return Array.from(str).length
  } else {
    return 0
  }
}
function changeSelectValue(val) {
  if (proxy.$attrs.multiple) {
    emits('update:modelValue', val.toString())
  } else {
    emits('update:modelValue', val)
  }
  emits('changeValue', val)
}
function init() {
  const api = props.api
  if (api) {
    const _str = props.api.toString() + JSON.stringify(filterInfo.value.query)
    api(filterInfo.value.query).then((resp) => {
      if (resp && resp.success) {
        const _data = resp.data.map((item) => {
          return {
            key: item[props.keyField],
            value: item[props.valueField].toString(),
          }
        })
        proxy.$store.dispatch('app/setRepeatApi', {  key: _str,  value: _data })
      }
    })
  }
}
</script>

<style scoped></style>
