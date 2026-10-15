<template>
  <page-dialog
    title="附件上传"
    :visible="visible"
    width="800px"
    :bt-list="btList"
    @reset="handleClose"
  >
    <!-- 表格 -->
    <dialog-table
      ref="tableRef"
      v-model:data="tableInfo.data"
      :field-list="tableInfo.fieldList"
      :check-box="false"
      :pager="false"
      :tab-index="true"
      :load-data="false"
      :handle="tableInfo.handle"
    />
  </page-dialog>

  <!-- 批量上传 -->
  <UploadImport
    ref="uploadImportRef"
    action="/fnNew/attachment/batchUpload"
    :import-params="uploadParams"
    file-name="file"
    @success="handleUploadSuccess"
  />

  <!-- 预览 -->
  <eleGalleryDialog ref="galleryDialogRef" />
</template>

<script setup name="AttachmentDialog">
import { getCurrentInstance, ref } from "vue";
import UploadImport from "./UploadImport.vue";
import eleGalleryDialog from "@/components/UploadImg/eleGalleryDialog.vue";
import { ElMessageBox, ElMessage } from "element-plus";

const { proxy } = getCurrentInstance();
const emits = defineEmits(["update:visible", "confirm"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

// ========== 表格配置 ==========
const tableInfo = ref({
  data: [{}],
  fieldList: [
    { label: "附件名称", value: "fileName" },
    { label: "存储路径", value: "filePath", hidden: true },
  ],
  handle: {
    label: "操作",
    fixed: "right",
    btList: [
      { label: "下载", event: handleDownload, show: true },
      { label: "预览", event: handlePreview, show: true },
      { label: "删除", event: handleDelete, show: true },
    ],
  },
});

// ========== 底部按钮 ==========
const btList = ref([
  {
    label: "上传",
    type: "primary",
    event: () => {
      uploadImportRef.value?.open();
    },
    show: true,
  },
  { label: "确定", type: "primary", event: handleConfirm, show: true },
  { label: "取消", type: "default", event: handleClose, show: true },
]);

// ========== 引用 ==========
const uploadImportRef = ref(null);
const galleryDialogRef = ref(null);
const uploadParams = ref({});

// ========== 上传成功 ==========
function handleUploadSuccess({ data, fileName }) {
  // data 为后端返回的存储路径
  if (data) {
    const paths = Array.isArray(data) ? data : [data];
    paths.forEach((path) => {
      tableInfo.value.data.push({
        fileName: fileName,
        filePath: path,
      });
    });
  }
}

// ========== 下载 ==========
function handleDownload(row) {
  // TODO: 调用下载接口
  proxy.$message.info("下载接口待联调");
}

// ========== 预览 ==========
function handlePreview(row) {
  const ext = row.filePath?.split(".").pop()?.toLowerCase() || "";
  // thumb 参数：文件访问地址，这里需要拼接基础路径
  const thumb = `${import.meta.env.VITE_APP_FILE_URL || ""}/${row.filePath}`;
  galleryDialogRef.value?.startPreview(thumb, row.fileName, ext, row.filePath);
}

// ========== 删除 ==========
function handleDelete(row) {
  ElMessageBox.confirm(`确定删除附件「${row.fileName}」吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // TODO: 调用删除接口
    proxy.$message.info("删除接口待联调");
  }).catch(() => {});
}

// ========== 确定 ==========
function handleConfirm() {
  emits("confirm", tableInfo.value.data);
  emits("update:visible", false);
}

// ========== 取消 ==========
function handleClose() {
  emits("update:visible", false);
}
</script>

<style lang="scss" scoped>
</style>
