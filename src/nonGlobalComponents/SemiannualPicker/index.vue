<template>
  <div style="width: 100%; position: relative" id="semi-card">
    <!-- 自定义输入框 -->
    <el-input
      v-model="displayValue"
      placeholder="请选择半年"
      @focus="focusEvent"
      readonly
    >
      <template #prefix>
        <el-icon>
          <calendar />
        </el-icon>
      </template>
    </el-input>

    <!-- 半年选择面板 -->
    <el-card v-show="showPanel" class="semi-panel" body-style="padding: 10px">
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

      <div class="semi-buttons">
        <el-button
          v-for="(q, index) in semis"
          :key="index"
          type="text"
          :class="
            value.includes(q) ? 'semi-buttons_selected' : 'semi-buttons_default'
          "
          @click="selectSemi(index + 1)"
        >
          {{ q }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="semiannualPicker">
const emit = defineEmits(["update:value", "change"]);
const props = defineProps({
  // 半年值
  value: {
    type: String,
    default: "",
  },
});
const showPanel = ref(false); // 半年面板显隐
const currentYear = ref(new Date().getFullYear()); // 当前年份
const semis = ref(["H1", "H2"]); // 半年面板选项
const displayValue = ref(""); // 输入框显示值
// 监听页面点击事件，显隐panel
function focusEvent() {
  showPanel.value = true;
  document.body.addEventListener("click", handleClick);
}
function handleClick(e) {
  if (!e.target.closest("#semi-card")) {
    showPanel.value = false;
    document.body.removeEventListener("click", handleClick);
  }
}
onUnmounted(() => {
  document.body.removeEventListener("click", handleClick);
});
// 监听半年初始值
watch(
  () => props.value,
  (val) => {
    if (val) {
      // 设置输入框值
      const [year, semi] = val.split("-");
      currentYear.value = parseInt(year);
      displayValue.value = `${year}-${semi}`;
    }
  },
  {
    immediate: true,
  }
);
// 选择年份
function changeYear(offset) {
  currentYear.value += offset;
}
// 选择半年
function selectSemi(semi) {
  const value = `${currentYear.value}-H${semi}`;
  displayValue.value = `${currentYear.value}-H${semi}`;
  showPanel.value = false;
  emit("change");
  emit("update:value", value);
}
</script>

<style scoped>
.semi-panel {
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
.semi-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 按钮选中样式 */
.semi-buttons_selected {
  background-color: #0000ff;
  color: #fff;
}
.semi-buttons_default {
  background-color: #fff;
  color: #000;
}
</style>