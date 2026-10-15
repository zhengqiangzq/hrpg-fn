<template>
  <div class="app-container-flex">
    <NewFullScreen v-model="showDialog" :title="title">
      <template v-slot:full-button>
        <el-button type="primary" @click="save()">保存</el-button>
      </template>
      <div class="model-panel">
        <div class="model-panel-title">
          <p>科目信息</p>
        </div>
        <div class="model-panel-body">
          <!-- form -->
          <page-form
            ref="modifyForm"
            class="paddingBox order-model-formBox flex_wrap_start_start"
            v-model:ref-obj="formInfo.ref"
            :disabled="formInfo.disabled"
            :data="formInfo.data"
            :field-list="formInfo.fieldList"
            :rules="formInfo.rules"
            :label-width="formInfo.labelWidth"
            :list-type-info="listTypeInfo"
          >
          </page-form>
        </div>
      </div>
      <div class="model-panel">
        <div class="model-panel-title">
          <p>辅助信息</p>
        </div>
        <div class="model-panel-body">
          <!-- form -->
          <page-form
            ref="modifyAuxiliaryForm"
            class="paddingBox order-model-formBox flex_wrap_start_start"
            v-model:ref-obj="formAuxiliaryInfo.ref"
            :disabled="formAuxiliaryInfo.disabled"
            :data="formAuxiliaryInfo.data"
            :field-list="formAuxiliaryInfo.fieldList"
            :rules="formAuxiliaryInfo.rules"
            :label-width="formAuxiliaryInfo.labelWidth"
          >
          </page-form>
        </div>
      </div>
      <div class="model-panel">
        <div class="model-panel-title">
          <Tooltip text="辅助核算信息" />
        </div>
        <div class="model-panel-body">
          <!-- 条件栏 -->
          <new-page-filter
            v-model:query="filterInfo.query"
            :filter-btn="filterInfo.btnList"
          >
          </new-page-filter>
          <div class="flex_full_item">
            <el-form :model="tableInfo" ref="tableForm" style="width: 100%">
              <!-- 表格 -->
              <page-table
                :refresh="tableInfo.refresh"
                :init-curpage="tableInfo.initCurpage"
                v-model:data="tableInfo.data"
                :api="tableInfo.api"
                :pager="false"
                :tabIndex="true"
                :isRowClickSelect="false"
                :query="filterInfo.query"
                :field-list="tableInfo.fieldList"
                :handle="tableInfo.handle"
                :isDynamic="true"
                @handleEvent="handleEvent"
              >
              </page-table>
            </el-form>
          </div>
        </div>
      </div>
    </NewFullScreen>
    <SelectData ref="selectorRef" />
  </div>
</template>

<script setup>
import {
  accasoaAdd,
  accasoaUpdate,
  accasoaVersioning,
  accasoaById,
  acctypeList,
  adjunctAccountItemList,
} from "@/api/base";
import { useSelectData } from "@/hooks/useSelectData";

const { proxy } = getCurrentInstance();
const { selectorInfo, selectorRef } = useSelectData();
const emit = defineEmits();
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "修改会计科目",
  },
  id: {
    type: String,
  },
  node: {
    type: Object,
  },
  type: {
    type: String,
  },
});

const formRefs = ref([]);
// 过滤相关配置
const filterInfo = ref({
  query: {},
  btnList: [
    {
      label: "新增",
      type: "button",
      event: addRow,
    },
    {
      label: "删除",
      type: "button",
      disabled: () => !tableInfo.value.selections.length,
      event: () => removeRow(),
    },
  ],
});
const listTypeInfo = ref({
  accTypeIdList: [],
  innerDimLevelList: [],
});
//表单相关
const formInfo = ref({
  ref: null,
  defaultList: [],
  data: {
    accchartName: props.node.name,
    codeRule: props.node.codeRule,
    accchartId: props.node.id,
    status: "1",
    effectiveDate: "0001-01-01",
  },
  fieldList: [
    {
      label: "科目表",
      value: "accchartName",
      type: "input",
      disabled: true,
    },
    {
      label: "编码规则",
      value: "codeRule",
      type: "input",
      disabled: true,
    },
    {
      label: "科目编码",
      value: "code",
      type: "input",
      disabled: props.type === "update" || props.type === "versioning",
    },
    {
      label: "科目名称",
      value: "name",
      type: "input",
    },
    {
      label: "科目类型",
      value: "accTypeId",
      type: "select",
      list: "accTypeIdList",
      filterable: true,
    },
    {
      label: "科目方向",
      value: "accDirection",
      type: "select-model",
      code: "accounting_account_direction",
    },
    {
      label: "现金分类",
      value: "cashClass",
      type: "select-model",
      code: "accasoa_cash_class",
    },
    {
      label: "科目属性",
      value: "accAttribute",
      type: "select-model",
      code: "acctype_attribute",
      disabled: true,
    },
    {
      label: "科目控制级次",
      value: "ctrlLevel",
      type: "select-model",
      code: "accasoa_ctrl_level",
      labelTip: "科目最高9级，9级代表控制到末级",
    },
    {
      label: "生效日期",
      value: "effectiveDate",
      type: "date",
      disabled: props.type !== "versioning",
    },
    {
      label: "账簿余额双向显示",
      value: "bothDirection",
      type: "checkbox-model",
    },
    {
      label: "余额方向控制",
      value: "isCtrlBalance",
      type: "checkbox-model",
    },
    {
      label: "发生额方向控制",
      value: "isCtrlIncur",
      type: "checkbox-model",
    },
    {
      label: "内部往来科目",
      value: "isCtrlInner",
      type: "checkbox-model",
    },
    // {
    //   label: "内部往来维度",
    //   value: "innerDimLevel",
    //   type: "select-model",
    //   code: "accasoa_inner_dml_level",
    //   show: false,
    // },
    {
      label: "内部往来维度",
      value: "innerDimLevel",
      type: "select",
      list: "innerDimLevelList",
      filterable: true,
      show: false,
    },
    {
      label: "启用状态",
      value: "status",
      type: "select-model",
      code: "enabled_type",
      disabled: true,
    },
    {
      label: "科目说明",
      value: "remark",
      type: "textarea",
    },
  ],
  rules: {
    accchartName: [
      { required: true, message: "请输入科目表", trigger: "blur" },
    ],
    code: [{ required: true, message: "请输入科目编码", trigger: "blur" }],
    name: [{ required: true, message: "请输入科目名称", trigger: "blur" }],
    accTypeId: [
      { required: true, message: "请选择科目类型", trigger: "change" },
    ],
    accDirection: [
      { required: true, message: "请选择科目方向", trigger: "change" },
    ],
    cashClass: [
      { required: true, message: "请选择现金分类", trigger: "change" },
    ],
    accAttribute: [
      { required: true, message: "请选择科目属性", trigger: "change" },
    ],
    ctrlLevel: [
      { required: true, message: "请选择科目控制级次", trigger: "change" },
    ],
    innerDimLevel: [
      { required: true, message: "请选择内部往来维度", trigger: "change" },
    ],
  },
  labelWidth: "120px",
});
//表单相关
const formAuxiliaryInfo = ref({
  ref: null,
  defaultList: [],
  data: {},
  fieldList: [
    {
      label: "票据号",
      value: "isBillNumber",
      type: "checkbox-model",
    },
    {
      label: "票据日期",
      value: "isBillDate",
      type: "checkbox-model",
    },
    {
      label: "结算方式",
      value: "isBalanceType",
      type: "checkbox-model",
    },
  ],
  rules: {},
  labelWidth: "120px",
});
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  data: [],
  selections: [],
  fieldList: [
    { label: "辅助核算编码", value: "accassitemCode" },
    { label: "辅助核算名称", value: "accassitemName" },
    {
      label: "余额方向控制",
      value: "isBalanceDirectionCtrl",
      type: "checkbox-model",
      align: "center",
    },
    {
      label: "是否可为空",
      value: "isEmpty",
      type: "checkbox-model",
      align: "center",
    },
    {
      label: "是否可选非末级",
      value: "isNontail",
      type: "checkbox-model",
      align: "center",
    },
  ],
  handle: {
    fixed: "right",
    label: "操作",
    width: "120",
    btList: [
      {
        label: "删除",
        event: removeRow,
        show: true,
      },
    ],
  },
});
// 标记数据是否已初始化完成，避免加载详情时 watch 误清空 innerDimLevel
const _dimLevelInited = ref(false);
const showDialog = computed({
  get() {
    return props.visible;
  },
  set(newValue) {
    emit("update:visible", newValue); // 更新父组件visible
  },
});
// 监听内部往来科目，控制"内部往来维度"显隐
watch(
  () => formInfo.value.data.isCtrlInner,
  (val) => {
    const field = formInfo.value.fieldList.find(
      (f) => f.value === "innerDimLevel",
    );
    if (_dimLevelInited.value) {
      formInfo.value.data["innerDimLevel"] = "";
    }
    field.show = val === "1";
  },
);
// 监听科目类型，联动科目方向和科目属性
watch(
  () => formInfo.value.data.accTypeId,
  (val) => {
    const item = listTypeInfo.value.accTypeIdList.find(
      (ele) => ele.value === val,
    );
    if (item) {
      formInfo.value.data.accDirection = item.accDirection;
      formInfo.value.data.accAttribute = item.accAttribute;
    }
  },
);
onMounted(() => {
  getAccTypeIdList();
  getInnerDimLevelList();
  if (props.id) {
    getMain();
  } else {
    // 新增时无需加载数据，直接允许 watch 联动清空
    _dimLevelInited.value = true;
  }
  if (props.type === "versioning") {
    // 版本化时禁用科目类型、科目方向、科目控制级次
    const disabledFields = [
      "accTypeId",
      "accDirection",
      "accAttribute",
      "ctrlLevel",
      "cashClass",
    ];
    formInfo.value.fieldList.forEach((f) => {
      if (disabledFields.includes(f.value)) {
        f.disabled = true;
      }
    });
    // 移除禁用字段的必填校验
    disabledFields.forEach((key) => {
      formInfo.value.rules[key] = [];
    });
  }
});
function getMain() {
  accasoaById(props.id, "accountingsSubject:detail").then((res) => {
    if (res && res.success) {
      formInfo.value.data = res.data;
      formAuxiliaryInfo.value.data = res.data;
      tableInfo.value.data = res.data.accassList || [];
      proxy.$nextTick(() => {
        // 数据加载完成，后续 isCtrlInner 变化时 watch 才能清空 innerDimLevel
        _dimLevelInited.value = true;
      });
    }
  });
}
function getAccTypeIdList() {
  acctypeList({ accsystemId: props.node.accsystemId }).then((resp) => {
    if (resp && resp.success) {
      listTypeInfo.value.accTypeIdList = resp.data.map((ele) => {
        return {
          key: ele.name,
          value: ele.id,
          accDirection: ele.balanceDirection,
          accAttribute: ele.accAttribute,
        };
      });
    }
  });
}
function getInnerDimLevelList() {
  adjunctAccountItemList({ innerDimLevel: "1" }).then((resp) => {
    if (resp && resp.success) {
      listTypeInfo.value.innerDimLevelList = (resp.data || []).map((ele) => ({
        key: ele.name,
        value: ele.id,
      }));
    }
  });
}
// 触发事件
function handleEvent(event, data) {
  switch (event) {
    case "tableCheck":
      tableInfo.value.selections = [...data];
      break;
    default:
      break;
  }
}
function save() {
  formRefs.value = [
    proxy.$refs["modifyForm"].$refs["form"],
    proxy.$refs["modifyAuxiliaryForm"].$refs["form"],
  ];
  proxy.$fn.checkForm(formRefs.value).then(() => {
    const data = { ...formInfo.value.data, ...formAuxiliaryInfo.value.data };
    data.accassList = tableInfo.value.data;

    let api, btnCode;
    if (props.type === "copy") {
      api = accasoaAdd;
      btnCode = "accountingsSubject:copy";
      delete data.id;
    } else if (props.type === "versioning") {
      api = accasoaVersioning;
      btnCode = "accountingsSubject:versioning";
    } else {
      api = data.id ? accasoaUpdate : accasoaAdd;
      btnCode = data.id
        ? "accountingsSubject:update"
        : "accountingsSubject:add";
    }

    api(data, btnCode).then((resp) => {
      if (resp && resp.success) {
        showDialog.value = false;
        emit("returnModify", false);
      }
    });
  });
}

//添加
function addRow() {
  selectorInfo.type = "adjunctAccountItem";
  const ids = tableInfo.value.data.map((item) => item.accassitemId);
  selectorInfo.query = {
    idNotIn: ids,
  };
  selectorInfo.callback = (rows) => {
    if (rows && rows.length) {
      rows.forEach((row) => {
        tableInfo.value.data.push({
          accassitemCode: row.code,
          accassitemName: row.name,
          accassitemId: row.id,
        });
      });
    }
  };
  selectorInfo.visible = true;
}
//删除
function removeRow(row) {
  if (row) {
    // 单行删除
    tableInfo.value.data = tableInfo.value.data.filter((item) => item !== row);
  } else {
    // 批量删除选中行
    tableInfo.value.data = tableInfo.value.data.filter(
      (item) => !tableInfo.value.selections.includes(item),
    );
  }
}
</script>

<style scoped></style>
