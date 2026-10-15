<template>
  <div class="filter-row">
    <div class="filter-item filter-item-equal">
      <label class="filter-label required">核算账簿</label>
      <span>：</span>
      <el-input
          v-model="formData.accbookName"
          class="not-mongolia"
          disabled
          placeholder="请选择核算账簿"
      >
        <template #append>
          <el-icon @click="openBookSelector"><Search /></el-icon>
        </template>
      </el-input>
    </div>
    <div class="filter-item filter-item-equal">
      <label class="filter-label required">凭证号</label>
      <span>：</span>
      <div class="voucher-no-group">
        <el-select v-model="formData.voucherTypeId" style="width: 60px">
          <el-option
              v-for="it in voucherTypeList"
              :key="it.value"
              :label="it.label"
              :value="it.value"
          />
        </el-select>
        <el-input-number
            v-model="formData.num"
            style="width: 80px"
            :min="0"
            :precision="0"
            controls-position="right"
            placeholder="凭证号"
        />
      </div>
    </div>
    <div class="filter-item filter-item-equal">
      <label class="filter-label">附件张数</label>
      <span>：</span>
      <el-input-number
          v-model="formData.attachment"
          :min="0"
          :precision="0"
          controls-position="right"
          style="width: 100%"
      />
    </div>
    <div class="filter-item filter-item-equal">
      <label class="filter-label required">凭证日期</label>
      <span>：</span>
      <el-date-picker
          v-model="formData.preparedDate"
          type="date"
          value-format="YYYY-MM-DD"
          format="YYYY/MM/DD"
          placeholder="选择日期"
          style="width: 100%"
      />
    </div>
    <div class="filter-item filter-item-check">
      <el-checkbox v-model="formData.isParallel"
      >是否校验平行记账</el-checkbox
      >
    </div>
    <div class="filter-item filter-item-check">
      <el-checkbox v-model="formData.isDiff">是否差异凭证</el-checkbox>
    </div>
    <div class="filter-item filter-item-check">
      <el-checkbox v-model="formData.isTransfer"
      >是否损益结转</el-checkbox
      >
    </div>
    <select-data ref="selectorRef" />
  </div>
</template>

<script setup name="collapseForm">
import {getCurrentInstance, onMounted, watch} from "vue";
import { useSelectData } from "@/hooks/useSelectData";
import {voucherInitrefreshNum, voucherInitVoucher} from "@/api/ledger/voucherManagement";

// ========== 选择器 Hooks ==========
const { selectorInfo, selectorRef } = useSelectData();

const { proxy } = getCurrentInstance();
const emit = defineEmits(["update:formData"]);

const props = defineProps({
  formData: {
    type: Object,
    default: () => {
      return {}
    },
  },
  voucherTypeData: {
    type: Array,
    default: () => {
      return []
    },
  },
  id: {
    type: String,
    default: '',
  },
});

const formData = computed({
  get: () => props.formData,
  set: (val) => emit("update:formData", val),
});

const voucherTypeList = computed({
  get: () => props.voucherTypeData,
  set: (val) => emit("update:voucherTypeData", val),
});

watch(
    [() => formData.value.accbookId, () => formData.value.voucherTypeId, () => formData.value.preparedDate],
    () => {
      changeVoucherNum()
    }
);

// ========== 生命周期 ==========
onMounted(() => {
  console.log('表单初始化')
});

// ========== 核算账簿选择 ==========
function openBookSelector() {
  selectorInfo.type = "accountingBook";
  selectorInfo.saveEmpty = false;
  selectorInfo.defaultSelected = formData.value.bookId;
  selectorInfo.callback = (row) => {
    formData.value.accbookId = row?.id;
    formData.value.accbookName = row?.name;
  };
  selectorInfo.visible = true;
}

async function changeVoucherNum() {
  if(!formData.value.accbookId || !formData.value.voucherTypeId || !formData.value.preparedDate) {
    return
  }
  if(props.id) return
  const { data, code } = await voucherInitrefreshNum({
    accbookId: formData.value.accbookId,
    voucherTypeId: formData.value.voucherTypeId,
    preparedDate: formData.value.preparedDate,
  })
  if(code === 200) {
    formData.value.num = data;
  }
}
proxy.$nextTick(() => {
  changeVoucherNum()
})

</script>

<style lang="scss" scoped>

/* ========== 筛选行 ========== */
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background-color: #fff;
  padding: 0 8px;
  .filter-item {
    display: flex;
    align-items: center;
    white-space: nowrap;
    margin-right: 12px;
    padding: 0 4px;
  }
  .filter-item-equal {
    flex: 0 0 200px;
    max-width: 200px;
    .voucher-no-group {
      display: flex;
      gap: 4px;
    }
  }
  .filter-label.required::before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
  }
}
</style>
