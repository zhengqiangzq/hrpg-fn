<template>
  <page-dialog
    :title="'新增常用凭证'"
    :visible="visible"
    width="800px"
    :bt-list="btList"
    @reset="handleClose"
  >
    <div class="add-common-voucher">
      <!-- 左侧树 -->
      <div class="tree-panel">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="defaultProps"
          node-key="id"
          highlight-current
          default-expand-all
          @node-click="handleNodeClick"
        />
      </div>
      <!-- 右侧表单 -->
      <div class="form-panel">
        <page-form
          ref="formRefObj"
          :data="formData"
          :field-list="fieldList"
          :rules="rules"
          label-width="120px"
        />
      </div>
    </div>
  </page-dialog>
</template>

<script setup name="AddCommonVoucherDialog">
const emits = defineEmits(["update:visible", "confirm"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const formRefObj = ref(null);
const treeRef = ref(null);
const currentTreeNode = ref(null);

// 树形数据（待接口联调）
const treeData = ref([
  {
    id: "root",
    name: "常用凭证",
    children: [
      { id: "1", name: "个人-001劳务派遣" },
      { id: "2", name: "个人-002支付电话费" },
      { id: "3", name: "公共-001支付水电费" },
      { id: "4", name: "公共-003薪酬发放" },
    ],
  },
]);

const defaultProps = ref({
  children: "children",
  label: "name",
});

const formData = ref({
  code: "",
  name: "",
  voucherAttribute: "个人",
});

const fieldList = ref([
  {
    label: "常用凭证编码",
    value: "code",
    type: "input",
    required: true,
    width: "100%",
  },
  {
    label: "常用凭证名称",
    value: "name",
    type: "input",
    required: true,
    width: "100%",
  },
  {
    label: "常用凭证属性",
    value: "voucherAttribute",
    type: "select-model",
    code: "voucher_attribute",
    default: "个人",
    required: true,
    width: "100%",
  },
]);

const rules = ref({
  code: [{ required: true, message: "请输入常用凭证编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入常用凭证名称", trigger: "blur" }],
  voucherAttribute: [
    { required: true, message: "请选择常用凭证属性", trigger: "change" },
  ],
});

const btList = ref([
  { label: "确认(Y)", type: "primary", event: handleConfirm },
  { label: "取消(Q)", type: "default", event: handleClose },
]);

// 弹窗打开时重置表单
watch(
  () => props.visible,
  (val) => {
    if (val) {
      formData.value = {
        code: "",
        name: "",
        voucherAttribute: "个人",
      };
      currentTreeNode.value = null;
      nextTick(() => {
        formRefObj.value?.clearValidate?.();
        treeRef.value?.setCurrentKey?.(null);
      });
    }
  }
);

function handleNodeClick(data) {
  currentTreeNode.value = data;
}

function handleConfirm() {
  formRefObj.value?.validate((valid) => {
    if (!valid) return;
    emits("confirm", {
      ...formData.value,
      treeData: currentTreeNode.value,
    });
    emits("update:visible", false);
  });
}

function handleClose() {
  emits("update:visible", false);
}
</script>

<style lang="scss" scoped>
.add-common-voucher {
  display: flex;
  height: 400px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;

  .tree-panel {
    width: 300px;
    border-right: 1px solid #e4e7ed;
    overflow-y: auto;
    padding: 10px;
    box-sizing: border-box;
  }

  .form-panel {
    flex: 1;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
  }
}
</style>
