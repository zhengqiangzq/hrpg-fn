<template>
  <div class="page-filter newFilter" :class="className">
    <div
      v-for="(item, index) in showFilterList"
      v-show="index < hideNum"
      :key="item.value || index"
      class="filter-item filter-search-item"
    >
      <!-- max-width 100  -->
      <!-- solt -->
      <template v-if="item.slot">
        <label
          class="filter-label"
          :class="{
            required: item.required,
            labelClass:
              index === 0 && showFilterList.length < 3
                ? 'labelAuto'
                : item.labelClass,
          }"
          v-if="item.label && item.type != 'button'"
          >{{ item.label }}</label
        >
        <span v-if="item.label && item.type != 'button'">：</span>
        <slot :name="'filter-' + item.value" />
      </template>
      <!-- 输入框 -->
      <template v-else>
        <label
          class="filter-label"
          :class="[
            {
              required: item.required,
              labelAuto: index === 0 && showFilterList.length < 3,
            },
            item.labelClass,
          ]"
          v-if="item.label && item.type != 'button'"
          >{{ item.label }}</label
        >
        <span v-if="item.label && item.type != 'button'">：</span>
        <el-input
          v-if="item.componentType === 'input'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled="item.disabled ? item.disabled : false"
          :clearable="item.clearable === false ? item.clearable : true"
          @keyup.enter="item.event"
          @input="(e) => (searchQuery[item.value] = item.inputRule ? item.inputRule(e) : validSe(e))"
        />
        <el-input
          v-if="item.componentType === 'textarea'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled="item.disabled ? item.disabled : false"
          :clearable="item.clearable === false ? item.clearable : true"
          @keyup.enter="item.event"
          @input="(e) => (searchQuery[item.value] = validSe(e))"
        />
        <!-- 查询框 -->
        <el-input
          v-if="item.componentType === 'search'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled="item.disabled ? item.disabled : false"
          @keyup.enter="item.event"
          @input="(e) => (searchQuery[item.value] = validSe(e))"
        >
          <el-button
            slot="append"
            :icon="Search"
            @click="item.event"
          ></el-button>
        </el-input>
        <!-- 选择框 -->
        <el-select
          v-if="item.componentType === 'select'"
          v-model="searchQuery[item.asValue ? item.asValue : item.value]"
          :class="`filter-${item.componentType}`"
          :disabled="item.disabled"
          :multiple="item.multiple"
          :clearable="item.clearable === false ? item.clearable : true"
          :filterable="item.filterable === false ? item.filterable : true"
          @visible-change="visibleChange($event, item.list)"
          :filterMethod="filterMethod"
          collapse-tags
        >
          <el-option
            v-for="(childItem, childIndex) in listTypeOptionsInfo[item.list]"
            :key="childItem.key"
            :label="
              childItem.key.length > 20
                ? childItem.key.substring(0, 20) + '...'
                : childItem.key
            "
            :value="childItem.value"
          />
        </el-select>
        <!-- 自定义下拉框 -->
        <slip-select
          v-if="item.componentType === 'slip-select'"
          v-model:modelValue="
            searchQuery[item.asValue ? item.asValue : item.value]
          "
          :class="`filter-${item.componentType}`"
          value-key="value"
          :api="item.api"
          :query="item.query"
          :default-value="item.defaultValue"
          :key-field="item.keyField"
          :value-field="item.valueField"
          :divisionName="item.divisionName"
          :clearable="item.clearable === false ? item.clearable : true"
          :filterable="item.filterable === false ? item.filterable : true"
          :disabled="item.disabled"
          :multiple="item.multiple"
          :clear-type="clearType"
          :isMaterialDrug="isMaterialDrug"
          :slip-select-request="slipSelectRequest"
        />
        <!--字典选择框-->
        <select-model
          v-if="item.componentType === 'select-model'"
          v-model:modelValue="
            searchQuery[item.asValue ? item.asValue : item.value]
          "
          :class="`filter-${item.componentType}`"
          :type-code="item.code"
          :disabled="item.disabled"
          :clearable="item.clearable === false ? item.clearable : true"
          :check-default="item.checkDefault ? item.checkDefault : false"
          :only-show-option="item.onlyShowOption"
          :multiple="item.multiple"
          :clear-type="clearType"
        />
        <!-- 时间选择框 -->
        <el-time-select
          v-if="item.componentType === 'time'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled-date="
            item.TimePickerOptions && item.TimePickerOptions.disabledDate
          "
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
        />
        <!-- 日期选择框 -->
        <el-date-picker
          v-if="item.componentType === 'date'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled-date="
            item.datePickerOptions && item.datePickerOptions.disabledDate
          "
          type="date"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-date-picker
          v-if="item.componentType === 'month'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled-date="
            item.datePickerOptions && item.datePickerOptions.disabledDate
          "
          type="month"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          format="YYYY-MM"
          value-format="YYYY-MM"
        />
        <RangeInput
          v-if="item.componentType === 'rangeInput'"
          v-model="item.rangeValue"
          :class="`filter-${item.componentType}`"
          :disabled="item.disabled"
          :clearable="item.clearable"
          :type="item.type"
          @keyup.enter="item.event"
          @change="(val) => rangeInputChange(val, item.rangeArr)"
          :start-placeholder="item.staryPlaceholder"
          :end-placeholder="item.endPlaceholder"
        />
        <RangeDate
          v-if="item.componentType === 'rangeDate'"
          v-model="item.rangeValue"
          :class="`filter-${item.componentType}`"
          :disabled="item.disabled"
          :clearable="item.clearable"
          :type="item.type"
          @keyup.enter="item.event"
          @change="(val) => rangeInputChange(val, item.rangeArr, item)"
          :start-placeholder="item.staryPlaceholder"
          :end-placeholder="item.endPlaceholder"
        />
        <RangePeriod
            v-if="item.componentType === 'rangePeriod'"
            v-model="item.rangeValue"
            :computeValue="item.computeValue"
            :class="`filter-${item.componentType}`"
            @change="(val) => rangeInputChange(val, item.rangeArr, item)"
        />
        <RangeAccount
            v-if="item.componentType === 'rangeAccount'"
            v-model="item.rangeValue"
            :condition="item.condition"
            :class="`filter-${item.componentType}`"
            @change="(val, data = false) => rangeAccountChange(val, data, item.rangeArr)"
        />
        <RangeSelect
            v-if="item.componentType === 'rangeSelect'"
            v-model="item.rangeValue"
            :class="`filter-${item.componentType}`"
            :startOptions="item.startOptions"
            :endOptions="item.endOptions"
            :disabled="item.disabled"
            @change="(val) => rangeInputChange(val, item.rangeArr, item)"
        />
        <!-- 季度选择器 -->
        <QuarterPicker
          v-if="item.componentType === 'quarter'"
          v-model:value="searchQuery[item.value]"
        />
        <!-- 半年选择器 -->
        <SemiannualPicker
          v-if="item.componentType === 'semi'"
          v-model:value="searchQuery[item.value]"
        />
        <!-- 复选框单选 -->
        <ModelCheckbox
          v-if="item.componentType === 'checkbox-model'"
          v-model="searchQuery[item.asValue ? item.asValue : item.value]"
          :class="`filter-${item.componentType}`"
          :disabled="item.disabled"
        />
        <el-date-picker
          v-if="item.componentType === 'year'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled-date="
            item.datePickerOptions && item.datePickerOptions.disabledDate
          "
          type="year"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          format="YYYY"
          value-format="YYYY"
        />
        <el-date-picker
          v-if="item.componentType === 'dateTime'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.componentType}`"
          :disabled-date="
            item.datePickerOptions && item.datePickerOptions.disabledDate
          "
          type="datetime"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="item.defaultTime"
        />
        <!-- 通用自定义 SelectData 弹窗 -->
        <el-input
          v-if="item.componentType === 'select-data-custom'"
          :model-value="customSelectDisplay[item.value] || searchQuery[item.value] || ''"
          class="not-mongolia"
          type="input"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="openSelectDataCustom(item)"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </div>
    <div
      class="filter-btn"
      :class="showFilterList.length ? '' : 'noSearchItem'"
      v-set-btn-primary
    >
      <div
        v-for="(item, index) in getConfigList('btn')"
        :key="index"
        class="filter-item"
      >
        <template v-if="item.type === 'slot'">
          <slot :name="'filter-' + item.value" />
        </template>
        <!-- 按钮 -->
        <el-button
          v-else-if="item.type === 'button'"
          :class="[
            `filter-${item.type}`,
            item.label === '删除' ? 'deleteBtnLight' : '',
          ]"
          :type="getItemType(item)"
          :icon="iconMap[item.label] || item.icon"
          :disabled="setBtnDisabled(item.disabled)"
          @click="item.event"
          >{{ item.label }}</el-button
        >
        <!-- 下拉按钮组 -->
        <el-dropdown
          v-else-if="item.type === 'dropdown'"
          trigger="click"
          @command="item.event"
        >
          <el-button :disabled="setBtnDisabled(item.disabled)">
            {{ item.label }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(child, childIndex) in item.children"
                :key="childIndex"
                v-show="child.show !== false"
                :command="child.command"
                :disabled="setBtnDisabled(child.disabled)"
              >
                {{ child.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <span
        v-if="showFilterList.length > custom_search_box_num"
        class="defaultSize curPointer"
        @click="moreFilterList"
        >更多</span
      >
      <el-icon
        v-if="showFilterList.length > custom_search_box_num"
        class="slip-edit defaultSize"
        @click="moreFilterList"
      >
        <ArrowDown v-if="hideNum === custom_search_box_num" />
        <ArrowUp v-else />
      </el-icon>
    </div>
    <slot name="modelTips" />
    <!-- <el-icon
      v-if="getConfigList('search').length > 7"
      class="slip-edit"
      :class="hideNum === 7 ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
      @click="moreFilterList"
    > -->
    <!-- </el-icon> -->
    <!-- 通用自定义 SelectData 弹窗 -->
    <SelectData ref="customSelectorRef" />
  </div>
  <page-dialog
    v-show="dialogFilterVisible"
    :title="dialogInfo.title"
    v-model:visible="dialogFilterVisible"
    :width="dialogInfo.width"
    :bt-list="dialogInfo.btList"
  >
    <div class="page-filter" :class="className">
      <div
        v-for="(item, index) in showFilterList"
        :key="item.value || index"
        class="filter-item"
        style="width: 50%"
      >
        <!-- max-width 100  -->
        <label
          class="filter-label"
          filter-label
          v-if="item.type !== 'button' && item.label"
          >{{ item.label }}</label
        >
        <span v-if="item.label">：</span>
        <!-- solt -->
        <template v-if="item.slot">
          <slot :name="'filter-' + item.value" />
        </template>
        <!-- 输入框 -->
        <template v-else>
          <el-input
            v-if="item.componentType === 'input'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled ? item.disabled : false"
            :clearable="item.clearable === false ? item.clearable : true"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
          />
          <el-input
            v-if="item.componentType === 'textarea'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled ? item.disabled : false"
            :clearable="item.clearable === false ? item.clearable : true"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
          />
          <!-- 查询框 -->
          <el-input
            v-if="item.componentType === 'search'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled ? item.disabled : false"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
          >
            <el-button slot="append" :icon="Search"></el-button>
          </el-input>
          <!-- 选择框 -->
          <el-select
            v-if="item.componentType === 'select'"
            v-model="searchQuery[item.asValue ? item.asValue : item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled"
            :multiple="item.multiple"
            :clearable="item.clearable === false ? item.clearable : true"
            :filterable="item.filterable === false ? item.filterable : true"
            @visible-change="visibleChange($event, item.list)"
            :filterMethod="filterMethod"
          >
            <el-option
              v-for="(childItem, childIndex) in listTypeOptionsInfo[item.list]"
              :key="childItem.key"
              :label="
                childItem.key.length > 20
                  ? childItem.key.substring(0, 20) + '...'
                  : childItem.key
              "
              :value="childItem.value"
            />
          </el-select>
          <!-- 自定义下拉框 -->
          <slip-select
            v-if="item.componentType === 'slip-select'"
            v-model:modelValue="
              searchQuery[item.asValue ? item.asValue : item.value]
            "
            :class="`filter-${item.componentType}`"
            value-key="value"
            :api="item.api"
            :query="item.query"
            :default-value="item.defaultValue"
            :key-field="item.keyField"
            :value-field="item.valueField"
            :divisionName="item.divisionName"
            :clearable="item.clearable === false ? item.clearable : true"
            :filterable="item.filterable === false ? item.filterable : true"
            :disabled="item.disabled"
            :multiple="item.multiple"
            :isMaterialDrug="isMaterialDrug"
            :clear-type="clearType"
            :slip-select-request="slipSelectRequest"
          />
          <!--字典选择框-->
          <select-model
            v-if="item.componentType === 'select-model'"
            v-model:modelValue="
              searchQuery[item.asValue ? item.asValue : item.value]
            "
            :class="`filter-${item.componentType}`"
            :type-code="item.code"
            :disabled="item.disabled"
            :clearable="item.clearable === false ? item.clearable : true"
            :check-default="item.checkDefault ? item.checkDefault : false"
            :only-show-option="item.onlyShowOption"
            :multiple="item.multiple"
            :clear-type="clearType"
          />
          <!-- 时间选择框 -->
          <el-time-select
            v-if="item.componentType === 'time'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.TimePickerOptions && item.TimePickerOptions.disabledDate
            "
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
          />
          <!-- 日期选择框 -->
          <el-date-picker
            v-if="item.componentType === 'date'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.datePickerOptions && item.datePickerOptions.disabledDate
            "
            type="date"
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
          <el-date-picker
            v-if="item.componentType === 'month'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.datePickerOptions && item.datePickerOptions.disabledDate
            "
            type="month"
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
          <RangeInput
            v-if="item.componentType === 'rangeInput'"
            v-model="item.rangeValue"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled"
            :clearable="item.clearable"
            :type="item.type"
            @keyup.enter="item.event"
            @change="(val) => rangeInputChange(val, item.rangeArr)"
            :start-placeholder="item.staryPlaceholder"
            :end-placeholder="item.endPlaceholder"
          />
          <RangeDate
            v-if="item.componentType === 'rangeDate'"
            v-model="item.rangeValue"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled"
            :clearable="item.clearable"
            @keyup.enter="item.event"
            @change="(val) => rangeInputChange(val, item.rangeArr)"
            :start-placeholder="item.staryPlaceholder"
            :end-placeholder="item.endPlaceholder"
          />
          <!-- 季度选择器 -->
          <QuarterPicker
            v-if="item.componentType === 'quarter'"
            v-model:value="searchQuery[item.value]"
          />
          <!-- 半年选择器 -->
          <SemiannualPicker
            v-if="item.componentType === 'semi'"
            v-model:value="searchQuery[item.value]"
          />
          <!-- 复选框单选 -->
          <ModelCheckbox
            v-if="item.componentType === 'checkbox-model'"
            v-model="searchQuery[item.asValue ? item.asValue : item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled"
          />
          <el-date-picker
            v-if="item.componentType === 'year'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.datePickerOptions && item.datePickerOptions.disabledDate
            "
            type="year"
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
            format="YYYY"
            value-format="YYYY"
          />
          <el-date-picker
            v-if="item.componentType === 'dateTime'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.datePickerOptions && item.datePickerOptions.disabledDate
            "
            type="datetime"
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="item.defaultTime"
          />
          <!-- 通用自定义 SelectData 弹窗（弹窗内） -->
          <el-input
            v-if="item.componentType === 'select-data-custom'"
            :model-value="customSelectDisplay[item.value] || searchQuery[item.value] || ''"
            :class="item.disabled?'':'not-mongolia'"
            type="input"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="openSelectDataCustom(item)"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </div>

    </div>
  </page-dialog>
</template>

<script setup name="NewPageFilter">
import pinyin from "js-pinyin";
import { defineAsyncComponent, watch } from "vue";
import { useSelectData } from "@/hooks/useSelectData";
// 通用自定义 SelectData 弹窗（通过 useSelectData 控制）
const { selectorInfo: customSelectorInfo, selectorRef: customSelectorRef } = useSelectData();
const customSelectDisplay = ref({}); // 已选项的显示名称
const SelectModel = defineAsyncComponent(() => import("../SelectModel/index"));
const SlipSelect = defineAsyncComponent(() => import("../SlipSelect/index"));
// 输入范围选择器
const RangeInput  = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/RangeInput/index")
);
// 输入范围选择器
const RangeDate  = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/RangeDate/index")
);
// 选择期间选择器
const RangePeriod  = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/RangePeriod/index")
);
// 选择科目选择器
const RangeAccount  = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/RangeAccount/index")
);
// 选择下拉选择器
const RangeSelect  = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/RangeSelect/index")
);
// 季度和半年日期选择器
const QuarterPicker = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/QuarterPicker/index")
);
const SemiannualPicker = defineAsyncComponent(() =>
  import("@/nonGlobalComponents/SemiannualPicker/index")
);
const dialogFilterVisible = ref(false);
const dialogInfo = ref({
  title: "查询条件",
  btLoading: false,
  width: "800px",
  btList: [
    {
      label: "重置",
      event: clearSearch,
      show: true,
    },
    {
      label: "确定",
      type: "primary",
      event: save,
      show: true,
    },
  ],
});
function close() {
  dialogFilterVisible.value = false;
}
function clearSearch() {
  dialogFilterVisible.value = false;
  props.filterBtn.find((item) => {
    if (item.label === "重置") {
      item.event();
    }
  });
}
function save() {
  dialogFilterVisible.value = false;
  props.filterBtn.find((item) => {
    if (item.label === "查询") {
      item.event();
    }
  });
}
const { proxy } = getCurrentInstance();
const emits = defineEmits([
  "update:query",
]);
const props = defineProps({
  // 自定义类名
  className: {
    type: String,
    default: "",
  },
  tableRow: {
    type: Object,
    default: () => {
      return {};
    },
  }, // 相关列表
  listTypeInfo: {
    type: Object,
    default: () => {
      return {};
    },
  },
  // 过滤器列表
  filterList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  // 过滤器列表
  filterBtn: {
    type: Array,
    default: () => {
      return [];
    },
  },
  queryMoreJson: {
    type: Boolean,
    default: false,
  },
  clearType: {
    type: Boolean,
    default: true,
  },
  // 是列表还是弹窗打开的查询 如果是弹窗就不打开新弹框 直接下拉展开查询条件 如果是列表就弹框
  isFromDialog: {
    type: Boolean,
    default: false,
  },
  slipSelectRequest: {
    //slip-select重新请求
    type: Boolean,
    default: true,
  },
  // 参数
  query: {
    type: Object,
    default: () => {
      return {};
    },
  },
  isMaterialDrug: {
    //是否物资药品同时支持
    type: Boolean,
    default: false,
  },
  componentTypeDefaultValue: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const list = ref("");
const listTypeOptionsInfo = ref({});
const copyListTypeInfo = ref({});
// 时间相关设置
const datePickerOptions = ref({
  disabledDate(time) {
    // 大于当前的时间都不能选 (+十分钟让点击此刻的时候可以选择到当前时间)
    return time.getTime() > +new Date() + 1000 * 600 * 1;
  },
});
const iconMap = ref({
  // 新增: 'Plus',
  // 编辑: 'Edit',
  // 删除: 'Delete',
  // 查询: 'Search',
  // 返回: 'CircleClose',
  // 保存: 'Document',
});

const searchQuery = ref({});
const flag = ref("inner"); // 内 inner  外outside
const searchObj = ref({});
const oldQuery = ref({});
const hideNum = ref(12);
const inputSectionMin = ref(0);
const inputSectionMax = ref(0);
const showFilterList = ref([]);
const custom_search_box_num = computed(
  () => proxy.$store.state.permission.systemConfig?.custom_search_box_num
);
watch(
  () => searchQuery.value,
  (val) => {
    // 传入参数修改，不派发
    if (flag.value === "outside") {
      flag.value = "inner";
      return;
    }
    if (props.queryMoreJson) {
      for (let key in searchObj.value) {
        searchObj.value[key] ? (searchObj.value[key].value = val[key]) : "";
      }
      let obj = {};
      if (Object.keys(searchObj.value).length) {
        obj = searchObj.value;
      } else {
        obj = props.query;
      }
      // 修改传入进来的参数
      emits("update:query", { ...obj });
    } else {
      emits("update:query", { ...props.query, ...val });
    }
  },
  {
    deep: true, // 深度监听
  }
);
watch(
  () => props.query,
  (val) => {
    flag.value = "outside"; // 标识为传入参数修改
    if (props.queryMoreJson) {
      let obj = {};
      for (let key in val) {
        obj[key] = val[key].value;
      }
      searchObj.value = val;
      searchQuery.value = obj;
    } else {
      searchQuery.value = val;
    }
    // 父组件重置 query 时，同步清空对应的自定义选择显示值，
    // 避免 customSelectDisplay 残留旧值导致 input 无法清空
    for (const key in customSelectDisplay.value) {
      if (!searchQuery.value[key]) {
        delete customSelectDisplay.value[key];
      }
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => props.listTypeInfo,
  (val) => {
    listTypeOptionsInfo.value = proxy.$fn.deepClone(val);
    copyListTypeInfo.value = proxy.$fn.deepClone(listTypeOptionsInfo.value);
  },
  {
    immediate: true,
    deep: true,
  }
);
watch(
  () => props.clearType,
  (val) => {
    console.log("清空查询条件");
    customSelectDisplay.value = {};
    console.log(customSelectDisplay.value);
    console.log(searchQuery.value);
    clearRannge()
  }
);
watch(
  () => props.filterList,
  (val) => {
    echoFun();
    if (val && val.length) {
      showFilterList.value = props.filterList.filter(
        (item) => {
          if(!item.hasOwnProperty("show") || (item.hasOwnProperty("show") && item.show)) {
            clearRannge(item)
            return true
          }
        }
      );
      if (hideNum.value > custom_search_box_num.value) {
        hideNum.value = showFilterList.value.length;
      }
    } else {
      showFilterList.value = [];
    }
  },
  {
    immediate: true,
    deep: false,
  }
);
watch(
  () => props.slipSelectRequest,
  () => {
    echoFun();
  },
  {
    immediate: true,
    deep: true,
  }
);

onMounted(() => {
  hideNum.value = custom_search_box_num.value || 0;
  oldQuery.value = Object.assign(oldQuery.value, props.query);
});
onUnmounted(() => {
  emits("update:query", { ...oldQuery.value });
});

function clearRannge(item) {
  // 统一处理：无参数时遍历列表，有参数时包装为数组统一迭代
  const list = item ? [item] : showFilterList.value;
  list.forEach((filter) => {
    // 确保 rangeArr 存在且长度足够
    if (filter.rangeArr?.length >= 2) {
      const [startKey, endKey] = filter.rangeArr;
      filter.rangeValue = [props.query[startKey] || '', props.query[endKey] || ''];
    }
  });
}

function echoFun() {
  let filterList = proxy.$fn.deepClone(props.filterList);
  if (filterList.length) {
    filterList.forEach((item) => {
      let searchDefaultValue = item.searchDefaultValue;
      if (item.componentType === "checkbox-model") {
        const key = item.asValue || item.value;
        if (searchDefaultValue !== undefined && searchDefaultValue !== null) {
          searchQuery.value[key] = String(searchDefaultValue);
        }
      }
    });
  }
}
function visibleChange(val, _list) {
  //下拉框出现/隐藏时触发
  list.value = _list;
  if (!val) {
    listTypeOptionsInfo.value[_list] = copyListTypeInfo.value[_list];
  }
}
function filterMethod(value) {
  // 自定义查询方法
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
function moreFilterList() {
  let list = props.filterList.filter(
    (item) =>
      !item.hasOwnProperty("show") || (item.hasOwnProperty("show") && item.show)
  );
  if (!props.isFromDialog) {
    dialogFilterVisible.value = true;
  } else {
    if (hideNum.value !== custom_search_box_num.value) {
      hideNum.value = custom_search_box_num.value;
    } else {
      hideNum.value = list.length;
    }
    proxy.$store.dispatch("app/toggleOpenFilter");
  }
}
// 获取列表
function getConfigList(str) {
  if (str === "btn" && props.filterBtn) {
    return props.filterBtn.filter(
      (item) =>
        !item.hasOwnProperty("show") ||
        (item.hasOwnProperty("show") && item.show)
    );
  }
}
function rangeInputChange(val, rangeArr, item) {
  if (val && val.length) {
    if (rangeArr && rangeArr.length > 0) {
      searchQuery.value[rangeArr[0]] = val[0];
      searchQuery.value[rangeArr[1]] = val[1];
    }
  //  会计期间联动凭证日期
    if(item?.componentType === 'rangePeriod') {
      handleDate(val)
    }
    //  凭证日期联动会计期间
    if(item?.componentType === 'rangeDate') {
      handlePeriod(val)
    }
  } else {
    if (rangeArr && rangeArr.length > 0) {
      searchQuery.value[rangeArr[0]] = null;
      searchQuery.value[rangeArr[1]] = null;
    }
  }
}

function rangeAccountChange(val, data, rangeArr) {
  searchQuery.value[rangeArr[0]] = val.startValue || null;
  searchQuery.value[rangeArr[1]] = val.startValueId || null;
  searchQuery.value[rangeArr[2]] = val.endValue || null;
  searchQuery.value[rangeArr[3]] = val.endValueId || null;
  searchQuery.value['accountList'] = data || null;
}

function handleDate(val) {
  const date = showFilterList.value.find(it => it.componentType === 'rangeDate');
  if (!date || !val?.[0] || !val?.[1]) return;
  // 会计期间 → 凭证日期：取期间首月的第一天，末月的最后一天
  const start = `${val[0]}-01`;
  const [ey, em] = val[1].split('-');
  const lastDay = new Date(Number(ey), Number(em), 0).getDate();
  const end = `${val[1]}-${String(lastDay).padStart(2, '0')}`;
  searchQuery.value[date.rangeArr[0]] = start;
  searchQuery.value[date.rangeArr[1]] = end;
  // 同时更新 rangeDate 的 v-model
  date.rangeValue = [start, end];
}

function handlePeriod(val) {
  const date = showFilterList.value.find(it => it.componentType === 'rangePeriod');
  if (!date || !val?.[0] || !val?.[1]) return;
  date.computeValue = val.map(it => it.slice(0, 7))
  // 同时更新 rangeDate 的 v-model
  date.rangeValue = [val[0], val[1]];
}

// 打开自定义 SelectData 弹窗（通用，支持 tree / table / treeTable）
// item 配置项需包含：
//   selectDataType  - dataTemplate 中的 key（决定弹窗内容类型）
//   asValue         - 选中后写入 searchQuery 的字段名（可选，默认取 item.value）
//   valueField      - 从选中行取值用作 asValue 的字段（默认 'id'）
//   labelField      - 从选中行取值用作显示的字段（默认 'name'）
function openSelectDataCustom(item) {
  if (item.disabled) return
  const queryKey = item.asValue || ''
  const queryValue = item.value || ''
  const valueField = item.valueField || 'id'
  const labelField = item.labelField || 'name'
  const codeField = item.codeField || 'code'
  // 从 searchQuery 获取当前值，传给弹窗做默认回显
  const currentValue = searchQuery.value[queryKey]
  const ids = currentValue ? String(currentValue).split(',').filter(Boolean) : []
  customSelectorInfo.type = item.selectDataType
  customSelectorInfo.saveEmpty = item.saveEmpty
  customSelectorInfo.showCheckbox = item.checkBox
  customSelectorInfo.query = item.query || {}
  if (item.selectDataType === 'Account') {
    const accbook = props.filterList.find((it) => it.selectDataType === 'accountingBook')
    const bookName = accbook && searchQuery.value[accbook.value]
    const bookId = accbook && searchQuery.value[accbook.asValue]
    if (!bookName || !bookId) {
      proxy.$message({
        message: '请先选择核算账簿',
        type: 'warning',
        duration: 3000,
        showClose: true,
      })
      return
    }
    customSelectorInfo.query = {
      ...customSelectorInfo.query,
      accbookName: bookName,
      accbookId: bookId,
    }
  }
  if (ids.length) {
    customSelectorInfo.defaultSelected = ids.length === 1 ? ids[0] : ids
  }
  customSelectorInfo.callback = (row) => {
    const rows = Array.isArray(row) ? row : (row && typeof row === 'object' && Object.keys(row).length !== 0 ? [row] : [])
    if (rows.length) {
      searchQuery.value[queryKey] = rows.map(r => r[valueField]).join(',')
      const buildLabel = (r) => r[codeField] ? `${r[codeField]} ${r[labelField]}` : r[labelField]
      searchQuery.value[queryValue] = rows.map(buildLabel).join(',')
      customSelectDisplay.value[item.value] = rows.map(buildLabel).join(',')
    } else {
      searchQuery.value[queryKey] = ''
      searchQuery.value[queryValue] = ''
      customSelectDisplay.value[item.value] = ''
    }
  }
  customSelectorInfo.visible = true
}
function setBtnDisabled(btnDisabled) {
  if (typeof btnDisabled === "string" || typeof btnDisabled === "boolean") {
    return btnDisabled;
  } else if (btnDisabled && typeof btnDisabled === "function") {
    return btnDisabled();
  }
}
function getItemType(item) {
  if (item.btType) {
    return item.btType;
  }
  const primaryArr = ["新增", "查询", "导出", "打印", "新增行"];
  if (
    primaryArr.includes(item.label) ||
    item.label.includes("新增") ||
    item.label.includes("添加")
  ) {
    return "primary";
  }
  return "default";
}
</script>

<style lang="scss" scoped></style>
