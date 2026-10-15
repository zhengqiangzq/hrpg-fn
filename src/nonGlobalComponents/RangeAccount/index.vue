<template>
  <div class="range-input-wrapper">
    <el-input
        :model-value="options.startValue"
        class="not-mongolia"
        type="input"
        :disabled="true"
    >
      <template #append>
        <el-icon @click="openSelectAccount('start')"><Search /></el-icon>
      </template>
    </el-input>
    <span class="range-separator">-</span>
    <el-input
        :model-value="options.endValue"
        class="not-mongolia"
        type="input"
        :disabled="true"
    >
      <template #append>
        <el-icon @click="openSelectAccount('end')"><Search /></el-icon>
      </template>
    </el-input>
    <el-button
        v-if="condition"
        @click="accountRange"
    >条件</el-button>
  </div>
  <select-data ref="selectorRef" />
  <Transfer
      v-if="states.dialogVisible"
      v-model:visible="states.dialogVisible"
      :title="states.title"
      :selectValue="states.selectValue"
      :defaultProps="states.defaultProps"
      :data="states.data"
      @callback="diaLogeCallback"
  />
</template>

<script setup name="RangeAccount">
import { ref, watch } from "vue";
import {useSelectData} from "@/hooks/useSelectData";
import Transfer from "@/components/transfer/transfer.vue";
const props = defineProps({
  modelValue: {
    // 数组
    type: Array,
    default: () => ['', ''],
  },
  condition: {
    // 是否存在条件按钮
    type: Boolean,
    default: false,
  },
});

const { selectorInfo, selectorRef } = useSelectData();

const emit = defineEmits(["update:modelValue", "change"]);
const options = ref({
  startValue: '',
  startValueId: '',
  endValue: '',
  endValueId: '',
});

const states = ref({
  title: '科目范围值',
  dialogVisible: false,
  defaultProps: {
    key: 'id',     //  ID
    code: 'code',     // 编码 用于拼接
    label: 'name',     // 名称 用于拼接
  },
  selectValue: [],     // 穿梭框 右侧数据
  data: []     // 穿梭框数据
})

const accountList = ref([
  { code: '1001', name: '库存现金', id: 1 },
  { code: '1002', name: '银行存款', id: 2 },
  { code: '100201', name: '建设银行', id: 3 },
  { code: '100202', name: '工商银行', id: 4 },
  { code: '1212', name: '应收账款', id: 5 },
  { code: '121201', name: '应收客户款', id: 6 },
  { code: '10017', name: '库存现金库存现金库存现金', id: 7 },
  { code: '10028', name: '银行存款银行存款银行存款', id: 8 },
  { code: '10020177', name: '建设银行建设银行建设银行', id: 9 },
  { code: '10020288', name: '工商银行工商银行工商银行', id: 10 },
  { code: '121299', name: '应收账款应收账款应收账款', id: 11 },
  { code: '19', name: '应收客户款应收客户款', id: 12 },
  { code: '1007', name: '建设银行建设银设银行', id: 13 },
  { code: '1088', name: '工商银商银行工商银行', id: 14 },
  { code: '1299', name: '应收账款应收账账款', id: 15 },
  { code: '12129', name: '应收户款应收客户款', id: 16 },
])

// 监听外部值变化，同步到内部
watch(
  () => props.modelValue,
  (val) => {

  },
);


function openSelectAccount(type) {
  selectorInfo.type = "user";
  selectorInfo.query = {};
  selectorInfo.callback = (data) => {
    if(type === 'start') {
      options.value.startValueId = data.id;
      options.value.startValue = data.name;
    } else {
      options.value.endValueId = data.id;
      options.value.endValue = data.name;
    }
    handleChange()
  };
  selectorInfo.visible = true;
}

// 打开穿梭框
function accountRange() {
  // 获取开始科目 --- 结束科目范围
  const scopeData = handleAccountScope();
  states.value.data = scopeData || [];
  states.value.dialogVisible = true
}

function handleAccountScope() {
  const startId = Number(options.value.startValueId || 3);
  const endId = Number(options.value.endValueId || 12);
  if (!startId || !endId) return [];
  // 在所有科目中查找 startId 和 endId  中间的科目范围
  // 如果是tree行  需先进行扁平化处理
  const allData = accountList.value;

  const startIdx = allData.findIndex(item => item.id === startId);
  const endIdx = allData.findIndex(item => item.id === endId);
  if (startIdx === -1 || endIdx === -1) return [];

  const from = Math.min(startIdx, endIdx);
  const to = Math.max(startIdx, endIdx);
  return allData.slice(from, to + 1) || [];
}

function diaLogeCallback(data) {
  states.value.dialogVisible = false
  if (!data) return
  states.value.selectValue = data;
  console.log('选择的科目范围值', data)
  const newValue = options.value;
  emit("change", newValue, data);
}

// 触发更新，将内部数组抛出
function handleChange() {
  const newValue = options.value;
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
