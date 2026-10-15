<!-- 登录设置 -->
<template>
  <div class="app-container">
    <div class="app-container-flex systemSetting">
      <NewFullScreen
        v-model="showDialog"
        title="登录设置"
        :btn-list="fullInfo.btnList"
        :need-return="false"
      >
        <div class="model-panel">
          <div class="model-panel-body">
            <page-form
              class="paddingBox order-model-formBox flex_wrap_start_start"
              v-model:ref-obj="formInfo.ref"
              :disabled="formInfo.disabled"
              :data="formInfo.data"
              :field-list="formInfo.fieldList"
              :rules="formInfo.rules"
              :label-width="formInfo.labelWidth"
            >
            </page-form>
          </div>
        </div>
      </NewFullScreen>
    </div>
  </div>
</template>

<script setup name="loginSetting">
import { getUserLoginConfig, createUserLoginConfig, updateUserLoginConfig } from "@/api/base.js";
const PERMISSION_CODE = "loginSetting";
const { proxy } = getCurrentInstance();
const formRefs = ref(null);
const showDialog = ref(true);
const fullInfo = ref({
  btnList: [{ label: "保存", event: save, show: proxy.$permission(`${PERMISSION_CODE}:save`) }],
});
onMounted(() => {
  formRefs.value = [formInfo.value.ref];
  getValueList();
});
const formInfo = ref({
  ref: null,
  data: {
  },
  fieldList: [],
  labelWidth: 140,
  fieldList: [
    {
      label: "默认账簿",
      value: "accbookName",
      asValue: "accbookId",
      type: 'select-data-custom',
      selectDataType: 'accountingBook',
    },
    {
      label: "凭证界面字体",
      value: "fontSize",
      type: "select-model",
      code: "font_size",
    },
    {
      label: "凭证界面摘要宽度",
      value: "width",
      type: "number",
      labelTip: "宽度最小400",
      min: 400,
    },
  ],
  rules: {
    fontSize: [
      { required: true, message: "请选择凭证界面字体", trigger: "change" },
    ],
    width: [
      { required: true, message: "请输入凭证界面摘要宽度", trigger: "blur" },
      { validator: validateMin, trigger: "blur" },
    ],
  },
});
function validateMin(rule, value, callback) {
  if (value !== "" && value !== null && Number(value) < 400) {
    callback(new Error("宽度最小为400"));
  } else {
    callback();
  }
}
function getValueList() {
  getUserLoginConfig('', PERMISSION_CODE + ":list").then((resp) => {
    if (resp && resp.success) {
      formInfo.value.data = resp.data || {};
      console.log(resp.data);
    }
  });
}
function save() {
  proxy.$fn.checkForm(formRefs.value).then(() => {
    const api = formInfo.value.data.id ? updateUserLoginConfig : createUserLoginConfig;
    api(formInfo.value.data, PERMISSION_CODE + ":save").then(
      (resp) => {
        if (resp.success) {
          proxy.$message.success("操作成功");
          getValueList();
        }
      },
    );
  });
}
</script>

<style scoped lang="scss"></style>
