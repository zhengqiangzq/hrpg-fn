<template>
  <div class="range-input-wrapper">
    <el-select v-model="startYear" @change="handleYearChange('start')">
      <el-option
          v-for="item in stYearOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <el-select v-model="startMonth" @change="handleMonthChange('start')">
      <el-option
          v-for="item in stMonthOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <span class="range-separator">-</span>
    <el-select v-model="endYear" @change="handleYearChange('end')">
      <el-option
          v-for="item in endYearOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <el-select v-model="endMonth" @change="handleMonthChange('end')">
      <el-option
          v-for="item in endMonthOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
  </div>
</template>

<script setup name="RangePeriod">
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ['', ''],
  },
  // 期间范围边界，如 ['2025-03', '2026-07']
  computeValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const startYear = ref('');
const startMonth = ref('');
const endYear = ref('');
const endMonth = ref('');

const stYearOptions = ref([]);
const stMonthOptions = ref([]);
const endYearOptions = ref([]);
const endMonthOptions = ref([]);

let isInternalUpdate = false;

watch(
    () => props.modelValue,
    () => {
      // 🔑 跳过自身 emit 触发的回环
      if (isInternalUpdate) return;
      syncFromModel();
      updateStartMonthOptions();
      updateEndMonthOptions();
      updateEndYearConstraints();
    },
);

watch(
    () => props.computeValue,
    (val) => {
      if (val && val.length) {
        handlePeriod(val);
        emit('change', val);
      }
    },
    { immediate: true },
);

/** 解析数字 */
function getBoundary() {
  const [start, end] = props.computeValue || ['', ''];
  const [sy, sm] = String(start).split('-');
  const [ey, em] = String(end).split('-');
  return {
    startYear: Number(sy) || 0,
    startMonth: Number(sm) || 1,
    endYear: Number(ey) || 0,
    endMonth: Number(em) || 12,
  };
}

/** 解析 modelValue */
function parseValue(val) {
  if (Array.isArray(val) && val.length >= 2) return [val[0] || '', val[1] || ''];
  return ['', ''];
}

/** 生成月份选项 */
function getMonths(minMonth, maxMonth) {
  const months = [];
  for (let i = minMonth; i <= maxMonth; i++) {
    const val = String(i).padStart(2, '0');
    months.push({ label: val, value: val });
  }
  return months;
}

/** 生成年份选项 */
function getYears(minYear, maxYear) {
  const years = [];
  for (let i = minYear; i <= maxYear; i++) {
    const val = String(i);
    years.push({ label: val, value: val });
  }
  return years;
}

/** 将年月转换为数字用于比较 YYYYMM */
function toMonthNumber(year, month) {
  return Number(year) * 100 + Number(month);
}

/** 检查开始时间是否大于结束时间 */
function isStartGreaterThanEnd() {
  const startNum = toMonthNumber(startYear.value, startMonth.value);
  const endNum = toMonthNumber(endYear.value, endMonth.value);
  return startNum > endNum;
}

// ==================== 核心逻辑 ====================

/** 初始化/刷新所有下拉选项 */
function handlePeriod(val) {
  const boundary = getBoundary();
  if (!boundary.startYear || !boundary.endYear) return;

  // 年份选项：开始年份和结束年份均来自边界范围
  stYearOptions.value = getYears(boundary.startYear, boundary.endYear);
  endYearOptions.value = getYears(boundary.startYear, boundary.endYear);

  // 将外部 modelValue 同步到内部 ref
  syncFromModel();

  // 根据当前选中年份生成月份选项
  updateStartMonthOptions();
  updateEndMonthOptions();
  updateEndYearConstraints();
}

/** 外部 modelValue → 内部 4 个 ref */
function syncFromModel() {
  const boundary = getBoundary();
  const [start, end] = parseValue(props.modelValue);

  if (start) {
    const [sy, sm] = start.split('-');
    startYear.value = sy || String(boundary.startYear);
    startMonth.value = sm || '';
  } else {
    startYear.value = String(boundary.startYear);
    startMonth.value = '';
  }

  if (end) {
    const [ey, em] = end.split('-');
    endYear.value = ey || String(boundary.endYear);
    endMonth.value = em || '';
  } else {
    endYear.value = String(boundary.endYear);
    endMonth.value = '';
  }
}

/** 根据选中的 startYear 刷新开始月份选项 */
function updateStartMonthOptions() {
  const boundary = getBoundary();
  const sy = Number(startYear.value);
  const ey = Number(endYear.value);

  let minMonth = 1;
  let maxMonth = 12;

  if (sy === boundary.startYear) {
    minMonth = boundary.startMonth;
  }
  if (sy === boundary.endYear) {
    maxMonth = boundary.endMonth;
  }
  if (sy === ey) {
    maxMonth = Math.min(maxMonth, Number(endMonth.value) || maxMonth);
  }

  stMonthOptions.value = getMonths(minMonth, maxMonth);

  const sm = Number(startMonth.value);
  if (!startMonth.value || sm < minMonth || sm > maxMonth) {
    startMonth.value = String(minMonth).padStart(2, '0');
  }
}

/** 根据选中的 endYear 刷新结束月份选项 */
function updateEndMonthOptions() {
  const boundary = getBoundary();
  const sy = Number(startYear.value);
  const ey = Number(endYear.value);

  let minMonth = 1;
  let maxMonth = 12;

  if (ey === boundary.endYear) {
    maxMonth = boundary.endMonth;
  }
  if (ey === boundary.startYear) {
    minMonth = boundary.startMonth;
  }
  if (sy === ey) {
    minMonth = Math.max(minMonth, Number(startMonth.value) || minMonth);
  }

  endMonthOptions.value = getMonths(minMonth, maxMonth);

  const em = Number(endMonth.value);
  if (!endMonth.value || em < minMonth || em > maxMonth) {
    endMonth.value = String(maxMonth).padStart(2, '0');
  }
}

/** 约束结束年份 ≥ 开始年份 */
function updateEndYearConstraints() {
  const boundary = getBoundary();
  const sy = Number(startYear.value);
  const minYear = Math.max(sy, boundary.startYear);
  endYearOptions.value = getYears(minYear, boundary.endYear);

  const ey = Number(endYear.value);
  if (!endYear.value || ey < minYear) {
    endYear.value = String(minYear);
    // 结束年份被修正后，月份也要重新计算
    updateEndMonthOptions();
  }
}

// ==================== 事件处理 ====================

/** 年份切换：刷新对应月份 + 联动约束 + emit */
function handleYearChange(type) {
  if (type === 'start') {
    updateStartMonthOptions();
    updateEndYearConstraints();
    // ⭐ 年份变了，两侧月份范围都可能受影响（同年↔不同年切换）
    updateEndMonthOptions();
    if (isStartGreaterThanEnd()) {
      endYear.value = startYear.value;
      endMonth.value = startMonth.value;
      updateEndMonthOptions();
    }
  } else {
    updateEndMonthOptions();
    // ⭐ 结束年份变了，开始月份范围也可能受影响（同年↔不同年切换）
    updateStartMonthOptions();
    if (isStartGreaterThanEnd()) {
      startYear.value = endYear.value;
      startMonth.value = endMonth.value;
      updateStartMonthOptions();
    }
  }
  emitValue();
}

/** 月份切换：约束检查 + 联动刷新 + emit */
function handleMonthChange(type) {
  if (type === 'start') {
    // 同一年：开始月份变了 → 结束月份范围起始值跟着变
    if (startYear.value === endYear.value) {
      updateEndMonthOptions();
    }
    if (isStartGreaterThanEnd()) {
      endYear.value = startYear.value;
      endMonth.value = startMonth.value;
      updateEndMonthOptions();
    }
  } else {
    // 同一年：结束月份变了 → 开始月份范围结束值跟着变
    if (startYear.value === endYear.value) {
      updateStartMonthOptions();
    }
    if (isStartGreaterThanEnd()) {
      startYear.value = endYear.value;
      startMonth.value = endMonth.value;
      updateStartMonthOptions();
    }
  }
  emitValue();
}

/** 将内部 4 个值拼成 ['YYYY-MM', 'YYYY-MM'] 格式抛出 */
function emitValue() {
  const start = startYear.value && startMonth.value
    ? `${startYear.value}-${startMonth.value}`
    : '';
  const end = endYear.value && endMonth.value
    ? `${endYear.value}-${endMonth.value}`
    : '';
  // 🔑 标记内部更新，跳过外部 modelValue 变化触发的 sync
  isInternalUpdate = true;
  emit('update:modelValue', [start, end]);
  emit('change', [start, end]);
  // nextTick 后重置，允许后续外部变更正常同步
  nextTick(() => {
    isInternalUpdate = false;
  });
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
