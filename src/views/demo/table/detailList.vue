<template>
  <div class="view-fill width100">
    <div class="layui-card width100">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab otherTab" @click="showDialog = false">列表页</div>
          <div class="tab currentTab">明细页</div>
        </div>
        <div>
          <!-- 条件栏 -->
          <div class="filter-wrapper">
            <NewPageFilter
                ref="pageFilterRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.list"
                :filter-btn="filterInfo.filterbtn"
                :listTypeInfo="filterInfo.listTypeInfo"
            >
              <template #filter-sourceDeptName>
                <el-input
                    v-model="filterInfo.query.sourceDeptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择源科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openCostItemSelector"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
            </NewPageFilter>
          </div>
          <div class="filter-wrapper">
            <!-- 条件栏 -->
            <NewPageFilter :filter-btn="filterInfo.btnList">
            </NewPageFilter>
          </div>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
        </table-container>
      </div>
    </div>
    <select-data ref="selectorRef" />
  </div>
</template>
<style scoped lang="scss">
</style>

<script setup>
import {onMounted, getCurrentInstance, computed, ref} from "vue";
import {useSelectData} from "@/hooks/useSelectData";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
const API = {
  list: null,
  export: null,
}
const { selectorInfo, selectorRef } = useSelectData();

const filterInfo = ref({
  query: {
  },
  listTypeInfo: {
    dataType: [{ key: '人工', value: '2' }, { key: '采集', value: '1' }],
  },
  list: [
    { label: '会计期间', value: 'accountingPeriodName', componentType: 'date' },
    { label: '源科室', value: 'sourceDeptName', showLabel: true, slot: true },
    { label: '拆分方法', value: 'way', componentType: 'select-model', code: 'cost_split_method' },
    { label: '数据来源', value: 'dataSource', componentType: 'select', clearable: true, list: 'dataType' },
    { label: '摘要', value: 'summary', componentType: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出', show: proxy.$permission('costData:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '会计期间', value: 'accountingPeriodValue' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '拆分方法', value: 'wayValue' },
    { label: '备注', value: 'remark' },
    { label: '成本分类编码', value: 'costTypeCode' },
    { label: '成本分类名称', value: 'costTypeName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '承担科室编码', value: 'deptCode' },
    { label: '承担科室名称', value: 'deptName' },
    { label: '参数值来源', value: 'paramSourceValue' },
    { label: '参数', value: 'apportionmentParamName' },
    { label: '参数值', value: 'value', align: 'center' },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: null,
})
const pageFilterRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.value.api = API.list
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {}
  getList()
}

function exportData() {
  API.export(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openCostItemSelector() {
  selectorInfo.type = "voucherType";
  selectorInfo.query = {};
  selectorInfo.callback = (data) => {
    filterInfo.value.query.sourceDeptId = data.id;
    filterInfo.value.query.sourceDeptName = data.name;
  };
  selectorInfo.visible = true;
}
</script>
