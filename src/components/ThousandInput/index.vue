<template>
  <el-input
      type="text"
      :model-value="display"
      @input="handleInput"
      @blur="handleBlur"
      @change="handleChange"
  />
</template>

<script setup>
import { ref, watch } from "vue";
import {commThousandth, verifyNumberComma} from "@/components/ThousandInput/toolsValidate";

defineOptions({ name: "ThousandInput" });

const props = defineProps({
  modelValue: { type: [Number, String], default: null },
});
const emit = defineEmits(["update:modelValue", "change", "ChangeInput", "blur"]);

// 是否处于编辑中（编辑中不响应外部 modelValue 变化，避免覆盖用户正在输入的内容）
const editing = ref(false);
// 输入框实际显示的字符串（编辑中保留小数点等未完成输入）
const display = ref(toThousand(props.modelValue));

watch(
    () => props.modelValue,
    (val) => {
      if (!editing.value) {
        display.value = toThousand(val);
      } else {
        // 编辑中，若外部值与当前显示解析后的值不一致（如通过 = 快捷键计算赋值），强制更新显示
        const currentNum = parseThousand(display.value);
        const newValNum = val === null || val === undefined || val === '' ? null : Number(val);
        if (currentNum !== newValNum) {
          display.value = toThousand(val);
          editing.value = false;
        }
      }
    }
);

function handleInput(val) {
  editing.value = true;
  // 实时千分位显示，抛出数字类型
  display.value = toThousandInput(val);
  emit("ChangeInput", parseThousand(val));
  emit("update:modelValue", parseThousand(val));
}

function handleBlur() {
  editing.value = false;
  // 失焦后保留 2 位小数，规整显示
  const rounded = props.modelValue ? round2(props.modelValue) : null;
  if (rounded !== props.modelValue) {
    emit("update:modelValue", rounded);
  }
  emit("blur", rounded);
  display.value = rounded ? toThousand(rounded) : null;
}

function handleChange() {
  emit("change", props.modelValue);
}
// 保留 2 位小数（金额）
function round2(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Number(num.toFixed(2));
}

// 数字 -> 千分位字符串（2 位小数）
function toThousand(value) {
  return verifyNumberComma(value);
}

// 输入过程实时格式化：整数部分加千分位，保留小数部分与结尾小数点
function toThousandInput(value) {
  return commThousandth(value)
}

// 千分位字符串 -> 数字（空值返回 null）
function parseThousand(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(String(value).replace(/[,=]/g, ""));
  return Number.isNaN(num) ? null : num;
}
</script>
