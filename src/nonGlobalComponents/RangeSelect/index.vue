<template>
  <div class="range-input-wrapper">
    <el-select v-model="startValue" :disabled="disabled" @change="handleChange('start')">
      <el-option
          v-for="item in startOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <span class="range-separator">-</span>
    <el-select v-model="endValue" :disabled="disabled" @change="handleChange('end')">
      <el-option
          v-for="item in endOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
  </div>
</template>

<script setup name="RangeSelect">
const props = defineProps({
  modelValue: {
    // 数组
    type: Array,
    default: () => ['', ''],
  },
  startOptions: {
    type: Array,
    default: () => [],
  },
  endOptions: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);
const startValue = ref('');
const endValue = ref('');

// 监听外部值变化，同步到内部
watch(
  () => props.modelValue,
  (val) => {
    const parsed = parseValue(val);
    startValue.value = parsed[0];
    endValue.value = parsed[1];
  },
);
// 将外部传入的值转为内部数组状态
function parseValue(val) {
  if (Array.isArray(val)) return [val[0], val[1]];
  return [undefined, undefined];
}
// 触发更新，将内部数组抛出
function handleChange() {
  const newValue = [startValue.value, endValue.value];
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
