<template>
  <el-form
    ref="form"
    :class="className"
    :model="data"
    class="padding pageForm"
    v-auto-error-position
    :rules="rules"
    :disabled="disabled"
    :label-width="labelWidth"
    :validate-on-rule-change="false"
    inline
  >
    <el-row style="width: 100%">
      <el-col
        :span="imageField && Object.keys(imageField).length ? 18 : 24"
        class="flex_wrap_start_start"
      >
        <el-form-item
          v-for="(item, index) in getConfigList()"
          :key="item.value"
          :prop="item.value"
          :label="item.labelTip ? '' : item.label + '：'"
          :class="getItemClass(item)"
          :error="item.error"
          :label-width="item.labelWidth"
          :style="{ width: getItemWidth(item), ...item.style }"
        >
          <!--label气泡-->
          <template v-if="item.labelTip" #label>
            <el-tooltip
              v-if="
                diffData[item.diffValue || item.value] ||
                diffData[item.diffValue || item.value] === 0 ||
                diffData[item.diffValue || item.value] === ''
              "
              :placement="item.placement || 'top'"
              effect="light"
              :content="'改动前：' + diffData[item.diffValue || item.value]"
            >
              <span :style="{ color: '#ec808d' }">
                <el-icon><View /></el-icon>{{ item.label + "" }}</span
              >
            </el-tooltip>
            <span v-else>{{ item.label + "" }}</span>
            <el-tooltip :placement="item.placement || 'top'" effect="light">
              <template #content>
                <span v-html="item.labelTip"></span>
              </template>
              <el-icon><QuestionFilled /></el-icon> </el-tooltip
            >：
          </template>
          <!-- 审核时标记颜色且鼠标经过需要看到更改之前的值，涉及页面：平台对接 -->
          <template
            v-else-if="
              diffData[item.diffValue || item.value] ||
              diffData[item.diffValue || item.value] === 0 ||
              diffData[item.diffValue || item.value] === ''
            "
            #label
          >
            <el-tooltip
              placement="top"
              effect="light"
              :content="'改动前：' + diffData[item.diffValue || item.value]"
            >
              <span :style="{ color: '#ec808d' }">
                <el-icon><View /></el-icon>{{ item.label + "：" }}</span
              >
            </el-tooltip>
          </template>
          <!-- solt -->
          <template v-if="item.type === 'slot' && !disabled">
            <slot :name="'form-' + item.value" />
          </template>
          <span v-if="disabled" class="printTxt">{{
            item.asValue ? data[item.asValue] : data[item.value]
          }}</span>
          <!-- 普通输入框 -->
          <el-input
            v-if="
              (item.type === 'input' || item.type === 'password') && !disabled
            "
            v-model="data[item.value]"
            :type="item.type"
            :minlength="item.minlength || 0"
            :maxlength="item.maxlength || 50"
            :class="item.className"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :placeholder="item.placeholder || getPlaceholder(item)"
            @focus="handleEvent(item.event)"
            @blur="data[item.value] = $event.target.value.trim()"
            @input="(e) => (data[item.value] = item.inputRule ? item.inputRule(e) : validSe(e))"
          />
          <!-- 文本输入框 -->
          <el-input
            v-if="item.type === 'textarea' && !disabled && !item.isSpecialInput"
            v-model.trim="data[item.value]"
            :type="item.type"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :maxlength="item.maxlength || 200"
            :placeholder="getPlaceholder(item)"
            :autosize="item.autosize || { minRows: 2, maxRows: 3 }"
            :style="{ width: item.inputWidth || '100%' }"
            @focus="handleEvent(item.event)"
            @input="(e) => (data[item.value] = validSe(e))"
          />
          <el-input
            v-if="item.type === 'textarea' && !disabled && item.isSpecialInput"
            v-model.trim="data[item.value]"
            :type="item.type"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :maxlength="item.maxlength || 200"
            :placeholder="getPlaceholder(item)"
            :autosize="item.autosize || { minRows: 2, maxRows: 10 }"
            :style="{ width: item.inputWidth || '100%' }"
            @focus="handleEvent(item.event)"
          />
          <!-- 计数器 -->
          <el-input
            v-if="item.type === 'input_number' && !disabled"
            v-model.number.trim="data[item.value]"
            v-enterNumber
            type="number"
            :placeholder="getPlaceholder(item)"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :precision="item.precision ? item.precision : 0"
            :min="item.min || 0"
            :step="1"
            :max="item.max || 99999999"
            @input="(e) => (data[item.value] = validSe(e))"
          />
          <el-input-number
            v-if="item.type === 'number' && !disabled"
            v-model.number="data[item.value]"
            controls-position="right"
            style="width: 100%"
            :placeholder="getPlaceholder(item)"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :precision="item.precision ? item.precision : 0"
            :min="item.min ? item.min : 0"
            :max="item.max ? item.max : 99999999"
            @change="handleEvent(item.event, data[item.value])"
            @input.native="changeValidate($event, item.value)"
          />
          <!--金额-->
          <el-input
            v-if="item.type === 'money' && !disabled"
            v-model.number.trim="data[item.value]"
            class="input-money"
            type="number"
            :precision="0"
            :min="item.min || 0"
            :step="1"
            :placeholder="getPlaceholder(item)"
            :max="item.max || 999999999999"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            @input="(e) => (data[item.value] = validSe(e))"
          >
            <template #append v-if="item.unit">
              <span>{{ item.unit }}</span>
            </template>
          </el-input>
          <!-- 选择框 -->
          <el-select
            v-if="item.type === 'select' && !disabled"
            :key="item.value"
            v-model="data[item.value]"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :clearable="item.clearable"
            :filterable="item.filterable"
            @visible-change="visibleChange($event, item.list)"
            :multiple="item.multiple"
            :collapse-tags="item.collapseTags"
            :placeholder="getPlaceholder(item)"
            :filterMethod="filterMethod"
            @change="handleEvent(item.event, data[item.value])"
          >
            <el-option
              v-for="(childItem, childIndex) in listTypeOptionsInfo[item.list]"
              :key="childItem.key"
              :label="
                childItem.key?.length > (item.selectLen ? item.selectLen : 15)
                  ? childItem.key.substring(
                      0,
                      item.selectLen ? item.selectLen : 15
                    ) + '...'
                  : childItem.key
              "
              :value="childItem.value"
            />
          </el-select>
          <!--字典选择框-->
          <select-model
            v-if="item.type === 'select-model' && !disabled"
            :key="index + item.value"
            v-model:modelValue="data[item.value]"
            :type-code="item.code"
            :check-default="item.checkDefault"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :clearable="item.clearable"
            :multiple="item.multiple"
            :width="item.width || ''"
            :only-show-option="item.onlyShowOption"
            :option-disabled="item.optionDisabled"
            :placeholder="getPlaceholder(item)"
            @change="handleEvent(item.event, data[item.value])"
          />
          <!--字典单选框-->
          <radio-model
            v-if="item.type === 'radio-model' && !disabled"
            v-model:modelValue="data[item.value]"
            :type-code="item.code"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :check-default="item.checkDefault"
            @change="handleEvent(item.event, data[item.value])"
          />
          <!-- 复选框单选 -->
          <ModelCheckbox v-if="item.type === 'checkbox-model' && !disabled" v-model:modelValue="data[item.value]" :disabled="item.disabled" @change="handleEvent(item.event, data[item.value])" />
          <!-- 日期选择框 -->
          <el-date-picker
            v-if="item.type === 'date' && !disabled"
            :model-value="toDateVal(data[item.value])"
            @update:model-value="data[item.value] = fmtDateVal($event, data[item.value], item)"
            :type="item.dateType"
            :format="item.format || 'YYYY-MM-DD'"
            :disabled-date="
              item.TimePickerOptions && item.TimePickerOptions.disabledDate
            "
            :clearable="item.clearable"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :placeholder="getPlaceholder(item)"
            @focus="handleEvent(item.event)"
          />
          <!-- 月份选择器 -->
          <el-date-picker
            v-if="item.type === 'month' && !disabled"
            :model-value="toDateVal(data[item.value])"
            @update:model-value="data[item.value] = fmtMonthVal($event, data[item.value])"
            type="month"
            format="YYYY-MM"
            :disabled-date="
              item.TimePickerOptions && item.TimePickerOptions.disabledDate
            "
            :clearable="item.clearable"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :placeholder="getPlaceholder(item)"
            @focus="handleEvent(item.event)"
          />
          <!-- 季度选择器 -->
          <QuarterPicker
            v-if="item.type === 'quarter'"
            v-model:value="data[item.value]"
          />
          <!-- 半年选择器 -->
          <SemiannualPicker
            v-if="item.type === 'semi'"
            v-model:value="data[item.value]"
          />
          <!-- 年份选择器 -->
          <el-date-picker
            v-if="item.type === 'year' && !disabled"
            :model-value="toDateVal(data[item.value])"
            @update:model-value="data[item.value] = fmtYearVal($event, data[item.value])"
            type="year"
            format="YYYY"
            :disabled-date="
              item.TimePickerOptions && item.TimePickerOptions.disabledDate
            "
            :clearable="item.clearable"
            :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
            :placeholder="getPlaceholder(item)"
            @focus="handleEvent(item.event)"
          />
          <!-- 信息展示框 -->
          <el-tag v-if="item.type === 'tag'">
            {{
              $fn.getDataName({
                dataList: listTypeOptionsInfo[item.list],
                value: "value",
                label: "key",
                data: data[item.value],
              }) || "-"
            }}
          </el-tag>
          <!-- 通用自定义 SelectData 弹窗 -->
          <el-input
            v-if="item.type === 'select-data-custom'"
            :model-value="customSelectDisplay[item.value] || data[item.value] || ''"
            type="input"
            class="not-mongolia"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="openSelectDataCustom(item)"><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col
        v-if="imageField && Object.keys(imageField).length"
        :span="6"
        class="flex_wrap_start_start"
      >
        <el-form-item style="width: 100% !important">
          <NewUpload
            :image-value="data[imageField.value]"
            :action="imageField.action"
            :label="imageField.label"
            :multiple-sheets="imageField.multipleSheets"
            :file-type="imageField.fileType"
            :limit="imageField.limit"
            :show-tip="imageField.showTip"
            :multiple="imageField.multiple"
            :btnDisabled="imageField.btnDisabled"
            @upDateUpload="upDateUpload"
          ></NewUpload>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
  <SelectData ref="customSelectorRef" />
</template>

<script setup name="PageForm">
import SelectModel from "@/components/SelectModel";
import RadioModel from "@/components/ModelRadio";
import NewUpload from "@/components/NewUpload/index";
import SelectData from "@/components/SelectData/index";
import { useSelectData } from "@/hooks/useSelectData";
// 季度和半年日期选择器
const QuarterPicker = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/QuarterPicker/index")
);
const SemiannualPicker = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/SemiannualPicker/index")
);
import pinyin from "js-pinyin";
const { proxy } = getCurrentInstance();
// select-data-custom 弹窗相关
const { selectorInfo: customSelectorInfo, selectorRef: customSelectorRef } = useSelectData();
const customSelectDisplay = ref({});

const props = defineProps({
  // 自定义类名
  className: {
    type: String,
    default: "",
  },
  imageField: {
    type: Object,
    default: function () {
      return {};
    },
  },
  // 表单数据
  data: {
    type: Object,
    default: function () {
      return {};
    },
  },
  // 相关字段
  fieldList: {
    type: Array,
    default: function () {
      return [];
    },
  },
  // 验证规则
  rules: {
    type: Object,
    default: function () {
      return {};
    },
  },
  // 相关的列表
  listTypeInfo: {
    type: Object,
    default: function () {
      return {};
    },
  },
  // label宽度
  labelWidth: {
    type: String,
    default: "120px",
  },
  refObj: {
    type: Object,
    default: function () {
      return {};
    },
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  diffData: {
    //差异数据
    type: Object,
    default: function () {
      return {};
    },
  },
  isMaterialDrug: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  "update",
  "handleEvent",
  "handleClick",
  "update:refObj",
]);
const list = ref("");
const listTypeOptionsInfo = ref({});
const copyListTypeInfo = ref({});
watch(
  () => props.data,
  () => {
    emit("update:refObj", proxy.$refs.form);
    proxy.$refs.form?.clearValidate();
  },
  {
    deep: true,
  }
);
watch(
  () => props.listTypeInfo,
  (val) => {
    listTypeOptionsInfo.value = proxy.$fn.deepClone(val);
    copyListTypeInfo.value = proxy.$fn.deepClone(val);
  },
  {
    immediate: true,
    deep: true,
  }
);
onMounted(() => {
  emit("update:refObj", proxy.$refs.form);
});
function resetFormFields() {
  proxy.$refs.form?.resetFields();
}
function clearValidates() {
  proxy.$nextTick(() => {
    proxy.$refs.form?.clearValidate();
  });
}
function validate(callback) {
  return proxy.$refs.form?.validate(callback);
}
function changeValidate(value, str) {
  proxy.$nextTick(() => {
    props.refObj.clearValidate(str);
  });
}
function visibleChange(val, _list) {
  //下拉框出现/隐藏时触发
  list.value = _list;
  if (!val) {
    listTypeOptionsInfo.value[_list] = copyListTypeInfo.value[_list];
  }
}
function filterMethod(value) {
  // //	自定义查询方法
  if (value && list.value) {
    let result = [];
    copyListTypeInfo.value[list.value].forEach((item) => {
      pinyin.setOptions({ checkPolyphone: false, charCase: 1 });
      const resultEng = pinyin.getCamelChars(item.key).toUpperCase();
      const matchResult =
        item.key.indexOf(value) !== -1 ||
        resultEng.indexOf(value.toUpperCase()) !== -1;
      // let matchResult = PinYinMatch.match(item.key, value)
      if (matchResult) {
        result.push(item);
      }
    });
    listTypeOptionsInfo.value[list.value] = result;
  } else {
    listTypeOptionsInfo.value[list.value] = copyListTypeInfo.value[list.value];
  }
}

const upDateUpload = (fileList) => {
  props.data[props.imageField.value] = fileList;
};
// 获取字段列表
const getConfigList = () => {
  let fieldList = props.fieldList.filter(
    (item) =>
      !item.hasOwnProperty("show") || (item.hasOwnProperty("show") && item.show)
  );
  if (!props.disabled) {
    return fieldList.filter((item) => {
      return !item.showDetail;
    });
  } else {
    fieldList.forEach((item) => {
      item.value = item.detailValue ? item.detailValue : item.value;
    });
  }
  setTimeout(() => {
    proxy.$store.dispatch("app/togglePageTable");
  }, 0);
  return fieldList;
};
// 得到placeholder的显示
const getPlaceholder = (row) => {
  if (row.placeholder === false) {
    return "";
  }
  let placeholder;
  if (
    row.type === "input" ||
    row.type === "textarea" ||
    row.type === "number"
  ) {
    placeholder = "请输入" + row.label;
  } else if (
    row.type === "select" ||
    row.type === "time" ||
    row.type === "date" ||
    row.type === "select-model"
  ) {
    placeholder = "请选择" + row.label;
  } else {
    placeholder = row.label;
  }
  return placeholder;
};
// 绑定的相关事件
const handleEvent = (event, data) => {
  emit("handleEvent", event, data);
};
// 派发按钮点击事件
const handleClick = (event, data) => {
  emit("handleClick", event, data);
};
function getItemWidth(item) {
  if (item.width) {
    return item.width + "!important";
  }
  if (item.type === "textarea") {
    return "100%!important";
  }
  if (
    item.type === "slot" &&
    (item.label.includes("附件") || item.value.includes("file"))
  ) {
    return "100%!important";
  }
  return "25%";
}
function getItemClass(item) {
  let _className = item.className;
  // if(item.width === '100%' || item.type === 'textarea') {
  //   _className =  item.className + ' pr0'
  // }
  return _className;
}
// 打开 select-data-custom 弹窗
function openSelectDataCustom(item) {
  const valueKey = item.asValue || item.value;
  const valueField = item.valueField || "id";
  const labelField = item.labelField || "name";
  const codeField = item.codeField || "code";
  const currentValue = props.data[valueKey];
  const ids = currentValue ? String(currentValue).split(",").filter(Boolean) : [];

  customSelectorInfo.type = item.selectDataType;
  customSelectorInfo.query = item.query || {};
  if (ids.length) {
    customSelectorInfo.defaultSelected = ids.length === 1 ? ids[0] : ids;
  }
  customSelectorInfo.callback = (row) => {
    const rows = Array.isArray(row)
      ? row
      : row && typeof row === "object" && Object.keys(row).length
        ? [row]
        : [];
    if (rows.length) {
      const buildLabel = (r) => r[codeField] ? `${r[codeField]} ${r[labelField]}` : r[labelField];
      props.data[item.value] = rows.map(buildLabel).join(",");
      if (item.asValue && item.asValue !== item.value) {
        props.data[item.asValue] = rows.map((r) => r[valueField]).join(",");
      }
      customSelectDisplay.value[item.value] = rows.map(buildLabel).join(",");
    } else {
      props.data[item.value] = "";
      if (item.asValue && item.asValue !== item.value) {
        props.data[item.asValue] = "";
      }
      customSelectDisplay.value[item.value] = "";
    }
    handleEvent(item.event, {
      value: props.data[item.value],
      asValue: props.data[item.asValue],
    })
  };
  customSelectorInfo.visible = true;
}

// ---- 日期组件辅助：绕过 JS new Date(y,m,d) 的 1900 年偏移 ----
// new Date(1, 0, 1) → 1901 年，而 new Date('0001-01-01') 和 setFullYear(1) 正确

/** 字符串 → Date（setFullYear 正确构造公元 1 年） */
function toDateVal(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  const m = String(val).match(/(\d+)-(\d+)-(\d+)/);
  if (m) {
    const d = new Date(2000, 0, 1);
    d.setFullYear(+m[1]);
    d.setMonth(+m[2] - 1);
    d.setDate(+m[3]);
    return d;
  }
  return new Date(val);
}

/** Date → YYYY-MM-DD，用旧值年份判断是否需要修正 1900 偏移 */
function fmtDateVal(newVal, oldVal, item) {
  if (!newVal) return "";
  if (typeof newVal === "string") return newVal;
  let y = newVal.getFullYear();
  if (isOldYearLT100(oldVal) && y >= 1900 && y < 2000) y -= 1900;
  const pad = (n, w) => String(n).padStart(w, "0");
  const fmt = item.valueFormat || "YYYY-MM-DD";
  return fmt
    .replace("YYYY", pad(y, 4)).replace("MM", pad(newVal.getMonth() + 1, 2))
    .replace("DD", pad(newVal.getDate(), 2)).replace("HH", pad(newVal.getHours(), 2))
    .replace("mm", pad(newVal.getMinutes(), 2)).replace("ss", pad(newVal.getSeconds(), 2));
}

function fmtMonthVal(newVal, oldVal) {
  if (!newVal) return "";
  if (typeof newVal === "string") return newVal;
  let y = newVal.getFullYear();
  if (isOldYearLT100(oldVal) && y >= 1900 && y < 2000) y -= 1900;
  return `${String(y).padStart(4, "0")}-${String(newVal.getMonth() + 1).padStart(2, "0")}`;
}

function fmtYearVal(newVal, oldVal) {
  if (!newVal) return "";
  if (typeof newVal === "string") return newVal;
  let y = newVal.getFullYear();
  if (isOldYearLT100(oldVal) && y >= 1900 && y < 2000) y -= 1900;
  return String(y).padStart(4, "0");
}

function isOldYearLT100(val) {
  if (!val) return false;
  const m = String(val).match(/^(\d+)/);
  return m && +m[1] < 100;
}

defineExpose({
  resetFormFields,
  clearValidates,
  validate,
});
</script>

<style lang="scss" scoped>
.printTxt {
  margin-left: -12px;
}
.el-input-number--small {
  width: 100%;
}
.padding {
  padding: 0 !important;
}
</style>
