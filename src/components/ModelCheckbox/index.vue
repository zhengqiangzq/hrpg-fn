<!-- src/components/ModelCheckbox/index.vue -->
<template>
  <el-checkbox v-model="isChecked" :disabled="disabled" @change="handleChange">
    {{ label }}
  </el-checkbox>
</template>

<script setup name="ModelCheckbox">
const { proxy } = getCurrentInstance();

const props = defineProps({
  modelValue: [String, Number],
  disabled: Boolean,
});
const emit = defineEmits(["update:modelValue", "change"]);
const isChecked = ref(false);
const label = ref("");

watch(
  () => props.modelValue,
  (val) => {
    console.log("modelValue", val);
    if (val === undefined || val === null || val === "") {
      emit("update:modelValue", "0");
      isChecked.value = false;
    } else {
      isChecked.value = val === 1 || val === "1";
    }
  },
  { immediate: true },
);
// 状态改变时：将 boolean 转换为 1/0 抛出
function handleChange(val) {
  const emitVal = val ? "1" : "0";
  emit("update:modelValue", emitVal);
  emit("change", emitVal);
}
</script>
