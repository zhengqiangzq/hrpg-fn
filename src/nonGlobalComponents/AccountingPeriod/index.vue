<template>
  <div class="accounting-period">
    <el-select
      v-model="yearValue"
      placeholder="请选择年"
      style="width: 46%"
    >
      <el-option
        v-for="y in yearOptions"
        :key="y"
        :label="String(y)"
        :value="y"
      />
    </el-select>
    <span class="period-separator">-</span>
    <el-select
      v-model="monthValue"
      placeholder="请选择月"
      style="width: 46%"
    >
      <el-option
        v-for="m in monthOptions"
        :key="m"
        :label="String(m).padStart(2, '0')"
        :value="m"
      />
    </el-select>
  </div>
</template>

<script setup name="AccountingPeriod">
const props = defineProps({
  year: {
    type: Number,
    default: null,
  },
  month: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["update:year", "update:month"]);

const yearValue = computed({
  get: () => props.year,
  set: (val) => emit("update:year", val),
});

const monthValue = computed({
  get: () => props.month,
  set: (val) => emit("update:month", val),
});

const yearOptions = [2025, 2026, 2027, 2028];

const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

<style scoped lang="scss">
.accounting-period {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.period-separator {
  color: #909399;
  font-size: 14px;
  margin: 0 2px;
}
</style>
