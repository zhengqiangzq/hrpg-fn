<template>
  <div style="width: 100%; position: relative" id="quarter-card">
    <!-- 自定义输入框 -->
    <el-input
      v-model="displayValue"
      placeholder="请选择季度"
      @focus="focusEvent"
      readonly
    >
      <template #prefix>
        <el-icon>
          <calendar />
        </el-icon>
      </template>
    </el-input>

    <!-- 季度选择面板 -->
    <el-card
      v-show="showPanel"
      class="quarter-panel"
      body-style="padding: 10px"
    >
      <div class="panel-header">
        <el-button
          type="text"
          icon="arrow-left"
          @click="changeYear(-1)"
        ></el-button>
        <span class="year-label">{{ currentYear }}</span>
        <el-button
          type="text"
          icon="arrow-right"
          @click="changeYear(1)"
        ></el-button>
      </div>

      <div class="quarter-buttons">
        <el-button
          style="padding: 0 8px"
          v-for="(q, index) in quarters"
          :key="index"
          type="text"
          :class="
            value.includes(q)
              ? 'quarter-buttons_selected'
              : 'quarter-buttons_default'
          "
          @click="selectQuarter(index + 1)"
        >
          {{ q }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="quarterPicker">
const emit = defineEmits(["update:value", "change"]);
const props = defineProps({
  // 季度值
  value: {
    type: String,
    default: "",
  },
});
const showPanel = ref(false); // 季度面板显隐
const currentYear = ref(new Date().getFullYear()); // 当前年份
const quarters = ref(["Q1", "Q2", "Q3", "Q4"]); // 季度面板选项
const displayValue = ref(""); // 输入框显示值
// 监听页面点击事件，显隐panel
function focusEvent() {
  showPanel.value = true;
  document.body.addEventListener("click", handleClick);
}
function handleClick(e) {
  if (!e.target.closest("#quarter-card")) {
    showPanel.value = false;
    document.body.removeEventListener("click", handleClick);
  }
}
onUnmounted(() => {
  document.body.removeEventListener("click", handleClick);
});
// 监听季度初始值
watch(
  () => props.value,
  (val) => {
    if (val) {
      // 设置输入框值
      const [year, quarter] = val.split("-");
      currentYear.value = parseInt(year);
      displayValue.value = `${year}-${quarter}`;
    }
  },
  {
    immediate: true,
  }
);
// 选择年份
function changeYear(offset) {
  currentYear.value += offset;
  // checkCurrentDate();
}
// 选择季度
function selectQuarter(quarter) {
  const value = `${currentYear.value}-Q${quarter}`;
  displayValue.value = `${currentYear.value}-Q${quarter}`;
  showPanel.value = false;
  emit("change");
  emit("update:value", value);
}
// 设置禁用条件
function isDisabled(quarter) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (currentYear.value > currentYear) return true;
  if (currentYear.value === currentYear) {
    return quarter > Math.floor((currentMonth - 1) / 3);
  }
  return false;
}
// 年份校验
function checkCurrentDate() {
  const now = new Date();
  if (currentYear.value > now.getFullYear()) {
    currentYear.value = now.getFullYear();
  }
}
</script>

<style scoped>
.quarter-panel {
  position: absolute;
  margin-top: 5px;
  width: 100%;
  z-index: 2000;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.year-label {
  font-size: 0.8rem;
}
.quarter-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

/* 按钮选中样式 */
.quarter-buttons_selected {
  background-color: #0000ff;
  color: #fff;
}
.quarter-buttons_default {
  background-color: #fff;
  color: #000;
}
</style>