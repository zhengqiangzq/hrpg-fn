<template>
  <div class="checkBox">
    <PageDialog
        :title="title"
        :visible="showDialog"
        :btList="state.btList"
        @reset="cancel"
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
              placeholder="请选择会计科目"
          >
            <template #append>
              <el-icon @click="selectDebitSubject"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </PageDialog>
    <select-data ref="selectorRef" />
  </div>
</template>
<script setup>
import {computed, getCurrentInstance, ref, watch} from "vue";
import {useStorage} from "@vueuse/core";
import { useSelectData } from "@/hooks/useSelectData";
import PageDialog from "@/components/PageDialog/index.vue";

const setting = useStorage('setting', {}, sessionStorage)
const API = null;
const props = defineProps({
  title: {
    type: String,
    default: '新增汇票类型'
  },
  tableRow: {
    type: Object,
    default: {},
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:visible', 'callback'])

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

const { proxy } = getCurrentInstance()
const { selectorInfo, selectorRef } = useSelectData();
const state = ref({
  ref: null,
  formData: {
    enableStatus: '1',
    orgId: setting.value.hospitalId,
    orgName: setting.value.hospitalName,
  },
  fieldList: [
    { label: '票据类型编码', width: '50%', value: 'code', type: 'input' },
    { label: '票据类型名称', width: '50%', value: 'name', type: 'input' },
    { label: '会计科目', width: '50%', value: 'name', type: 'input' },
    { label: '启用状态', width: '50%', value: 'enableStatus', type: 'select-model', code: 'enabled_type', disabled: true },
    { label: '创建组织', width: '50%', value: 'orgName', type: 'input', disabled: true },
    { label: '备注', width: '100%', value: 'remark', type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请填写票据类型编码' }],
    name: [{ required: true, message: '请填写票据类型名称' }],
  },
  labelWidth: "120px",
  btList: [
    {
      type: 'primary',
      show: true,
      label: '确定',
      event: userUpdate,
    },
    { type: 'button', show: true, label: '取消', event: cancel },
  ],
})

watch(
    () => props.tableRow,
    (val) => {
      state.value.formData = Object.assign(state.value.formData, val)
    },
    {
      immediate: true,
    }
)

function selectDebitSubject() {
  selectorInfo.type = "voucherType";
  selectorInfo.query = {};
  selectorInfo.callback = (data) => {
    state.value.formData.debitSubjectId = data.id;
    state.value.formData.debitSubject = data.name;
  };
  selectorInfo.visible = true;
}

function cancel() {
  showDialog.value = false
  emit('callback', false)
}
function userUpdate() {
  state.value.ref.validate((valid) => {
    if (valid) {
      API(state.value.formData).then((resp) => {
        if (resp.code === 200) {
          showDialog.value = false
          emit('callback', true)
        }
      })
    }
  })
}
</script>
