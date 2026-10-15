<template>
  <div class="view-fill">
    <div v-if="!modifyInfo.visible" class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        :title="'会计科目详情'"
        :btn-list="fullInfo.btnList"
        @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button v-if="$permission('accountingsSubject:update') && basicInfo.info.data.status === '0'" @click="update">编辑</el-button>
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>科目信息</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information
              :info="basicInfo.info"
              :label-width="basicInfo.labelWidth"
            >
            </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>辅助信息</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information
              :info="formAuxiliaryInfo.info"
              :label-width="formAuxiliaryInfo.labelWidth"
            >
            </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="辅助核算信息" />
          </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <!-- 表格 -->
              <page-table
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :pager="false"
                :field-list="tableInfo.fieldList"
                :check-box="false"
                :tab-index="true"
                :isDynamic="true"
              >
              </page-table>
            </div>
          </div>
        </div>
      </NewFullScreen>
    </div>
    <modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      :node="node"
      @returnModify="returnModify"
    />
  </div>
</template>

<script setup>
import { accasoaById } from "@/api/base";
const modify = defineAsyncComponent(() => import("./modify"));
const { proxy } = getCurrentInstance();
const emit = defineEmits();
const props = defineProps(["visible", "id", "node"]);
const basicInfo = ref({
  info: {
    data: {},
    fieldList: [
      {
        label: "科目表",
        value: "accchartName",
      },
      {
        label: "编码规则",
        value: "codeRule",
      },
      {
        label: "科目编码",
        value: "code",
      },
      {
        label: "科目名称",
        value: "name",
      },
      {
        label: "科目类型",
        value: "accTypeName",
      },
      {
        label: "科目方向",
        value: "accDirectionValue",
      },
      {
        label: "现金分类",
        value: "cashClassValue",
      },
      {
        label: "科目属性",
        value: "accAttributeValue",
      },
      {
        label: "科目控制级次",
        value: "ctrlLevelValue",
      },
      {
        label: "生效日期",
        value: "effectiveDate",
      },
      {
        label: "账簿余额双向显示",
        value: "bothDirectionValue",
      },
      {
        label: "余额方向控制",
        value: "isCtrlBalanceValue",
      },
      {
        label: "发生额方向控制",
        value: "isCtrlIncurValue",
      },
      {
        label: "内部往来科目",
        value: "isCtrlInnerValue",
      },
      {
        label: "内部往来维度",
        value: "innerDimLevelName",
        show: false,
      },
      {
        label: "启用状态",
        value: "statusValue",
      },
      {
        label: "科目说明",
        value: "remark",
        type: "textarea",
      },
    ],
  },
  labelWidth: "130px",
});
const formAuxiliaryInfo = ref({
  info: {
    data: {},
    fieldList: [
      {
        label: "票据号",
        value: "isBillNumberValue",
      },
      {
        label: "票据日期",
        value: "isBillDateValue",
      },
      {
        label: "结算方式",
        value: "isBalanceTypeValue",
      },
    ],
  },
  labelWidth: "120px",
});
const fullInfo = ref({
  btnList: [{ value: "button", type: "slot" }],
});
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: "辅助核算编码", value: "accassitemCode" },
    { label: "辅助核算名称", value: "accassitemName" },
    {
      label: "余额方向控制",
      value: "isBalanceDirectionCtrlValue",
    },
    {
      label: "是否可为空",
      value: "isEmptyValue",
    },
    {
      label: "是否可选非末级",
      value: "isNontailValue",
    },
  ],
});
const modifyInfo = ref({
  visible: false,
  title: "",
  id: "",
});

const showDialog = computed({
  get() {
    return props.visible;
  },
  set(newValue) {
    emit("update:visible", newValue); // 更新父组件visible
  },
});

onMounted(() => {
  if (props.id) {
    getMain();
  }
});
function getMain() {
  accasoaById(props.id, "accountingsSubject:detail").then((resp) => {
    if (resp && resp.success) {
      basicInfo.value.info.data = resp.data;
      formAuxiliaryInfo.value.info.data = resp.data;
      tableInfo.value.data = resp.data.accassList;
      // 内部往来科目为"是"时展示内部往来维度
      const innerDimField = basicInfo.value.info.fieldList.find(
        (f) => f.value === "innerDimLevelName",
      );
      if (innerDimField) {
        innerDimField.show = resp.data.isCtrlInner === "1";
      }
    }
  });
}
function update() {
  modifyInfo.value.title = "修改会计科目";
  modifyInfo.value.id = basicInfo.value.info.data.id;
  modifyInfo.value.visible = true;
}
function returnBack() {
  emit("returnBack", false);
}
function returnModify() {
  getMain();
}
</script>

<style scoped></style>
