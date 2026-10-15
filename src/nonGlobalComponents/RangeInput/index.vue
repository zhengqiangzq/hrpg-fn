<template>
  <div class="range-input-wrapper">
    <el-input
      v-model="startValue"
      :placeholder="startPlaceholder"
      :disabled="disabled"
      :clearable="clearable"
      @input="(val) => handleInput(val, 'start')"
    />
    <span class="range-separator">-</span>
    <el-input
      v-model="endValue"
      :placeholder="endPlaceholder"
      :disabled="disabled"
      :clearable="clearable"
      @input="(val) => handleInput(val, 'end')"
    />
  </div>
</template>

<script setup name="RangeInput">
import { verifyNumberIntegerAndFloat } from "@/utils/index";
const props = defineProps({
  modelValue: {
    // 数组
    type: Array,
    default: () => ['', ''],
  },
  startPlaceholder: {
    type: String,
    default: "最小值",
  },
  endPlaceholder: {
    type: String,
    default: "最大值",
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "input",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);
const startValue = ref(parseValue(props.modelValue)?.[0]);
const endValue = ref(parseValue(props.modelValue)?.[1]);

// 监听外部值变化，同步到内部
watch(
  () => props.modelValue,
  (val) => {
    const parsed = parseValue(val);
    startValue.value = parsed[0];
    endValue.value = parsed[1];
  },
);
// 格式化为数字类型，空值保持为空字符串
function formatToNumber(val) {
  if (val === '' || val === null || val === undefined) return '';
  const num = Number(val);
  return isNaN(num) ? '' : num;
};
// 将外部传入的值转为内部数组状态
function parseValue(val) {
  if (Array.isArray(val)) return [val[0], val[1]];
  return [undefined, undefined];
}
// 触发更新，将内部数组抛出
function handleInput(val, position) {
  let currentVal = val;
  // 当 type 为 number 时，执行校验并强制修正输入值
  if (props.type === 'number') {
    currentVal = verifyNumberIntegerAndFloat(val);
    if (position === 'start') {
      startValue.value = currentVal;
    } else {
      endValue.value = currentVal;
    }
  }
   // 格式化输出值
  const start = props.type === 'number' ? formatToNumber(startValue.value) : startValue.value;
  const end = props.type === 'number' ? formatToNumber(endValue.value) : endValue.value;
  const newValue = [start, end];
  emit("change", newValue);
}
</script>

<style scoped lang="scss">
.range-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  .range-separator {
    margin: 0 8px; /* 控制线与输入框的间距 */
    color: #909399;
    font-size: 14px;
  }
}
</style>
