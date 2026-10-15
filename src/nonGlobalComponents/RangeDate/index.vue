<template>
  <div class="range-input-wrapper">
    <el-date-picker
      v-model="startValue"
      type="date"
      :placeholder="startPlaceholder"
      :disabled="disabled"
      :clearable="clearable"
      value-format="YYYY-MM-DD"
      @change="handleChange"
    />
    <span class="range-separator">-</span>
    <el-date-picker
      v-model="endValue"
      type="date"
      :placeholder="endPlaceholder"
      :disabled="disabled"
      :clearable="clearable"
      value-format="YYYY-MM-DD"
      @change="handleChange"
    />
  </div>
</template>

<script setup name="RangeDate">
import { ref, watch } from 'vue'; // 补充 ref, watch 引入

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ['', ''],
  },
  startPlaceholder: {
    type: String,
    default: "开始日期",
  },
  endPlaceholder: {
    type: String,
    default: "结束日期",
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
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
  }
);

// 将外部传入的值转为内部数组状态
function parseValue(val) {
  if (Array.isArray(val)) return [val[0], val[1]];
  return [undefined, undefined];
}

// 格式化日期输出，保证空值为空字符串
function formatToDate(val) {
  return val || '';
}

// 触发更新，将内部数组抛出
function handleChange() {
  const start = formatToDate(startValue.value);
  const end = formatToDate(endValue.value);
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
    margin: 0 8px;
    color: #909399;
    font-size: 14px;
  }
}
</style>
