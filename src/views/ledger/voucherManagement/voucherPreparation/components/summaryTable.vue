<template>
  <div class="voucher-tabs">
    <page-table
        ref="summaryTableRef"
        :data="finTatolData"
        :field-list="summaryFieldList"
        :pager="false"
        :tab-index="false"
        :check-box="false"
    />
  </div>
</template>
<script setup name="summaryTable">
import { watch, ref } from 'vue';
const { proxy } = getCurrentInstance();
const props = defineProps({
  data: { type: Array, default: () => [] },
});

const finTatolData = ref([])

const summaryFieldList = ref([
  { label: "分录号", value: "entryNo", width: "70" },
  { label: "摘要", value: "explanation" },
  { label: "会计科目", value: "accasoaName" },
  { label: "借方", value: "commonDebitAmount", align: "right", width: "180" },
  { label: "贷方", value: "commonCreditAmount", align: "right", width: "180" },
]);
// const financialData = computed({
//   get: () => props.financialData,
// });

watch(
    () => props.data,
    (val) => {
      handleData(val)
    },
    { immediate: true, deep: true },
);

function handleData(data) {
  const map = new Map();
  data.forEach((row) => {
    // 以「摘要 + 科目」作为分组键
    const key = `${row.explanation}__${row.accasoaName}`;
    if (!map.has(key)) {
      map.set(key, {
        explanation: row.explanation,
        accasoaName: row.accasoaName,
        commonDebitAmount: 0,
        commonCreditAmount: 0,
      });
    }
    const target = map.get(key);
    target.commonDebitAmount += Number(row.commonDebitAmount) || 0;
    target.commonCreditAmount += Number(row.commonCreditAmount) || 0;
  });

  finTatolData.value = Array.from(map.values()).map((row, index) => ({
    entryNo: index + 1,
    ...row,
  }));
}

</script>
