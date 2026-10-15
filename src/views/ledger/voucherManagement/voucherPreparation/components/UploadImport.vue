<template>
  <el-upload
    ref="uploadRef"
    :action="uploadInfo.action"
    :headers="uploadInfo.headers"
    :data="uploadInfo.data"
    :name="fileName"
    :accept="fileType"
    :limit="limit || undefined"
    :show-file-list="false"
    :auto-upload="true"
    :before-upload="handleBeforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-exceed="handleExceed"
    multiple
    style="display: none"
  />
</template>

<script setup name="uploadImport">
import { ref } from "vue";
import { getToken } from "@/utils/auth";
import { ElMessage, ElLoading } from "element-plus";
import axios from "axios";

const props = defineProps({
  /** 上传接口地址 */
  action: {
    type: String,
    required: true,
  },
  /** 额外上传参数 */
  importParams: {
    type: Object,
    default: () => ({}),
  },
  /** 文件参数字段名 */
  fileName: {
    type: String,
    default: "file",
  },
  /** 允许的文件类型 */
  fileType: {
    type: String,
    default: ".xlsx,.xls",
  },
  /** 上传文件数量限制，0表示不限制 */
  limit: {
    type: Number,
    default: 0,
  },
});

const emits = defineEmits(["success", "error"]);

const uploadRef = ref(null);
let _loadingInstance = null;
let _fileNames = []; // 记录本次上传的文件名

const uploadInfo = ref({
  action: axios.defaults.baseURL + props.action,
  headers: {
    Authorization: getToken(),
    "x-auth-token": getToken(),
  },
  data: props.importParams,
});

/** 打开文件选择器 */
function open() {
  _fileNames = [];
  const input = uploadRef.value?.$el?.querySelector('input[type="file"]');
  if (input) {
    input.value = "";
    input.click();
  }
}

function handleBeforeUpload(file) {
  _fileNames.push(file.name);
  if (_fileNames.length === 1) {
    _loadingInstance = ElLoading.service({
      lock: true,
      background: "rgba(255, 255, 255, 0.1)",
      text: "请稍候...",
      target: ".loading-area",
    });
  }
}

function handleSuccess(response) {
  if (response.code === 200) {
    // 最后一个文件上传完成后关闭 loading
    if (_fileNames.length > 0) {
      _loadingInstance?.close();
      _loadingInstance = null;
    }
    emits("success", {
      data: response.data,
      fileName: _fileNames.shift() || "",
    });
  } else {
    _loadingInstance?.close();
    _loadingInstance = null;
    ElMessage.error(response.msg || "上传失败");
    emits("error", response);
  }
}

function handleError(err) {
  _loadingInstance?.close();
  _loadingInstance = null;
  ElMessage.error("上传失败，请检查网络");
  emits("error", err);
}

function handleExceed() {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`);
}

defineExpose({ open });
</script>
