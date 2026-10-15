<template>
  <div class="checkBox">
    <el-dialog
      draggable
      :append-to-body="true"
      :title="title"
      v-model="showDialog"
      custom-class="page-dialog"
      :close-on-click-modal="false"
      :modal="false"
      @close="cancel"
    >
      <page-form
        class="paddingBox order-model-formBox flex_wrap_start_start"
        v-model:ref-obj="state.ref"
        :data="state.formData"
        :field-list="state.fieldList"
        :rules="state.rules"
        :label-width="state.labelWidth"
      >
        <template #form-debitSubject>
          <el-input
            v-model="state.formData.debitSubject"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            placeholder="请选择借方科目"
          >
            <template #append>
              <el-icon @click="selectDebitSubject"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-debitAssName>
          <el-input
            v-model="state.formData.debitAssName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            placeholder="请选择借方辅助核算"
          >
            <template #append>
              <el-icon @click="selectDebitAuxiliary"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-creditSubject>
          <el-input
            v-model="state.formData.creditSubject"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            placeholder="请选择贷方科目"
          >
            <template #append>
              <el-icon @click="selectCreditSubject"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-creditAssName>
          <el-input
            v-model="state.formData.creditAssName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            placeholder="请选择贷方辅助核算"
          >
            <template #append>
              <el-icon @click="selectCreditAuxiliary"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="save">{{ $t('btn_confirm') }}</el-button>
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
    <select-data ref="selectorRef" />
    <SupAccount
        ref="supTableRef"
        v-if="assInfo.visible"
        :title="assInfo.title"
        v-model:visible="assInfo.visible"
        :table-data="assInfo.tableData"
        :id="assInfo.id"
        :data="assInfo"
        @callback="handleAssCallback"
    />
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from "vue";
import { useStorage } from "@vueuse/core";
import { useSelectData } from "@/hooks/useSelectData";
import {cashflowRelationCreate, cashflowRelationUpdate} from "@/api/ledger/relationship";
import SupAccount from "@/components/supAccountDialog/index.vue";
import {accasoagetAccassItemByAccasoaId} from "@/api/base";

const setting = useStorage("setting", {}, sessionStorage);

const props = defineProps({
  title: {
    type: String,
    default: "新增现金流量关系",
  },
  tableRow: {
    type: Object,
    default: {},
  },
  params: {
    type: Object,
    default: {},
  },
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:visible", "callback"]);

const showDialog = computed({
  get() {
    return props.visible;
  },
  set(newValue) {
    emit("update:visible", newValue);
  },
});

const { proxy } = getCurrentInstance();

const { selectorInfo, selectorRef } = useSelectData();

const state = ref({
  ref: null,
  formData: {
    debitSubject: "",
    debitSubjectCode: "",
    debitSubjectId: "",
    debitAssName: "",
    debitAssList: [],

    accDirection: "",

    creditSubject: "",
    creditSubjectCode: "",
    creditSubjectId: "",
    creditAssName: "",
    creditAssList: [],
  },
  fieldList: [
    { label: "借方科目", width: "50%", value: "debitSubject", type: "slot" },
    { label: "借方辅助核算", width: "50%", value: "debitAssName", type: "slot" },
    { label: "贷方科目", width: "50%", value: "creditSubject", type: "slot" },
    { label: "贷方辅助核算", width: "50%", value: "creditAssName", type: "slot" },
  ],
  labelWidth: "120px",
});

const assInfo = ref({
  api: undefined,
  id: null,
  title: null,
  visible: false,
  tableData: [],
  data: {
    accbookId: ''
  },
})

watch(
  () => props.tableRow,
  (val) => {
    handleForm(val)
  },
  {
    immediate: true,
  }
);

function handleForm (val) {
  if(Object.keys(val).length === 0) return;
  val.assList.forEach((it) => {
    it.assName = `${it.assValueCode} ${it.assValueName}`
  })
  state.value.formData = {
    ...val,
    debitSubject: val.accDirection === '1' ? val.accasoaName : '',
    debitSubjectCode: val.accDirection === '1' ? val.accasoaCode : '',
    debitSubjectId: val.accDirection === '1' ? val.accasoaIdStr : '',
    debitAssName: val.accDirection === '1' ? val.assValue : '',
    debitAssList: val.accDirection === '1' ? val.assList : '',

    accDirection: val.accDirection,

    creditSubject: val.accDirection === '0' ? val.accasoaName : '',
    creditSubjectCode: val.accDirection === '0' ? val.accasoaName : '',
    creditSubjectId: val.accDirection === '0' ? val.accasoaName : '',
    creditAssName: val.accDirection === '0' ? val.assValue : '',
    creditAssList: val.accDirection === '0' ? val.assList : '',
  }
}

function cancel() {
  showDialog.value = false;
  emit("callback", false);
}

// 借方
function selectDebitSubject() {
  // 校验 借方贷方同时存在
  if(state.value.formData.creditSubjectId) {
    return proxy.$message.warning("借方科目和贷方科目不可同时存在");
  }
  selectorInfo.defaultSelected = state.value.formData.debitSubjectId ? state.value.formData.debitSubjectId.split(',') : '';
  selectorInfo.type = "Account";
  selectorInfo.showCheckbox = true;
  selectorInfo.query = {
    status: '1',
    isLastVersion: true,
    accbookId: props.params.accbookId,
  };
  selectorInfo.callback = (data) => {
    data = Object.keys(data).length === 0 ? [] : data
    const checkBoxs = data?.filter(it => it.id) || []
    state.value.formData.debitSubjectId = checkBoxs?.map(it => it.id).join(',');
    state.value.formData.debitSubject = checkBoxs?.map(it => `${it?.code} ${it?.name}`).join(',');
    state.value.formData.debitSubjectCode = checkBoxs?.map(it => it.code).join(',');
    state.value.formData.debitAssName = '';
    state.value.formData.debitAssList = [];
  };
  selectorInfo.visible = true;
}

async function selectDebitAuxiliary() {
  if (!state.value.formData.debitSubjectId) return proxy.$message.warning("请选择借方科目");
  assInfo.value.title = '借方辅助核算';
  if(state.value.formData.debitAssName) {
    assInfo.value.tableData = state.value.formData.debitAssList;
    assInfo.value.visible = true;
    return;
  }
  const { data, code } = await accasoagetAccassItemByAccasoaId({ids: state.value.formData.debitSubjectId})
  if(code === 200) {
    assInfo.value.tableData = data.map(it => {
      return {
        accassitemCode: it.code,
        accassitemId: it.id,
        accassitemName: it.name,
      }
    })
  }
  assInfo.value.visible = true;
}

// 贷方
function selectCreditSubject() {
  // 校验 借方贷方同时存在
  if(state.value.formData.debitSubjectId) {
    return proxy.$message.warning("借方科目和贷方科目不可同时存在");
  }
  selectorInfo.type = "Account";
  selectorInfo.showCheckbox = true;
  selectorInfo.defaultSelected = state.value.formData.creditSubjectId ? state.value.formData.creditSubjectId.split(',') : '';
  selectorInfo.query = {
    status: '1',
    isLastVersion: true,
    accbookId: props.params.accbookId,
  };
  selectorInfo.callback = (data) => {
    data = Object.keys(data).length === 0 ? [] : data
    const checkBoxs = data?.filter(it => it.id) || []
    state.value.formData.creditSubjectId = checkBoxs?.map(it => it.id).join(',');
    state.value.formData.creditSubject = checkBoxs?.map(it => `${it?.code} ${it?.name}`).join(',');
    state.value.formData.creditSubjectCode = checkBoxs?.map(it => it.code).join(',');
    state.value.formData.creditAssName = '';
    state.value.formData.creditAssList = [];
  };
  selectorInfo.visible = true;
}

async function selectCreditAuxiliary() {
  if (!state.value.formData.creditSubjectId) return proxy.$message.warning("请选择贷方科目");
  assInfo.value.title = '贷方辅助核算';
  if(state.value.formData.creditAssName) {
    assInfo.value.tableData = state.value.formData.creditAssList;
    assInfo.value.visible = true;
    return;
  }
  const { data, code } = await accasoagetAccassItemByAccasoaId({ids: state.value.formData.creditSubjectId})
  if(code === 200) {
    assInfo.value.tableData = data.map(it => {
      return {
        accassitemCode: it.code,
        accassitemId: it.id,
        accassitemName: it.name,
      }
    })
  }
  assInfo.value.visible = true;
}
// 辅助核算返回
function handleAssCallback(data) {
  console.log('123123会计科目 辅助核算数据，123123', data)
  const { name, assList } = handleAssName(data)
  if (assInfo.value.title === '借方辅助核算') {
    state.value.formData.debitAssList = assList;
    state.value.formData.debitAssName = name;
  } else {
    state.value.formData.creditAssList = assList;
    state.value.formData.creditAssName = name;
  }
  assInfo.value.visible = false;
}

function handleAssName(data) {
  if(data.length === 0) return { name: '', assList: [] }
  let name = []
  data.forEach(it => {
    let ass = `[${it.accassitemName}:${it.assName || '~'}]`
    name.push(ass)
  })
  return {
    name: name.join(','),
    assList: data,
  }
}

function save() {
  // 校验 借方贷方同时存在
  if(state.value.formData.debitSubjectId && state.value.formData.creditSubjectId) {
    return proxy.$message.warning("借方科目和贷方科目不可同时存在");
  }
  // 方向 借方 1   贷方 0
  const rection = state.value.formData.debitSubjectId ? '1' : '0';
  const fromData = {
    ...props.params,
    ...state.value.formData,
    accbookId: props.params.accbookId,
    accasoaOriginalId: state.value.formData.accasoaOriginalId,

    accasoaIdStr: rection === '1' ? state.value.formData.debitSubjectId : state.value.formData.creditSubjectId,
    accasoaName: rection === '1' ? state.value.formData.debitSubject : state.value.formData.creditSubject,
    accasoaCode: rection === '1' ? state.value.formData.debitSubjectCode : state.value.formData.creditSubjectCode,
    assValue: rection === '1' ? state.value.formData.debitAssName : state.value.formData.creditAssName,
    assList: rection === '1' ? state.value.formData.debitAssList : state.value.formData.creditAssList,
    accDirection: rection,
  }
  state.value.ref.validate((valid) => {
    if (valid) {
      const api = props.id ? cashflowRelationUpdate : cashflowRelationCreate
      const btnCode = props.id ? 'relationship:update' : 'relationship:add'
      api(fromData, btnCode).then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success("保存成功");
          showDialog.value = false;
          emit("callback", true);
        }
      })
    }
  });
}



</script>
