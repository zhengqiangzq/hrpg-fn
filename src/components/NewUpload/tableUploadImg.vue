<template>
  <el-upload
    :action="props.action"
    :headers="myHeaders"
    :limit="props.limit"
    :show-file-list="false"
    :before-upload="handleBeforeUpload"
    :multiple="props.multiple"
    :on-error="handleErr"
    :on-success="handleUploadSuccess"
  >
    <span class="slip-edit">{{ props.title }}</span>
  </el-upload>
</template>
<script setup name="NewUploadTableUploadImg">
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    default: '上传图片',
  },
  index: {
    type: Number,
    default: undefined,
  },
  //上传张数
  limit: {
    type: Number,
    default: 1,
  },
  //地址
  action: {
    type: String,
    default: import.meta.env.VITE_APP_BASE_API + '/file/minio/upload/basic',
  },
  // 支持上传的文件类型
  fileType: {
    type: Array,
    default() {
      return ['png', 'jpg', 'jpeg']
    },
  },
  // 是否支持多选文件 (同官网)
  multiple: {
    type: Boolean,
    default: false,
  },
  //上传文件大小
  // fileSize: {
  //   type: Number,
  //   default: 5,
  // },
})
const fileSize = ref(proxy.$store.state.permission.systemConfig.max_file_size)
const emit = defineEmits(['upDateUpload'])
const myHeaders = reactive({
  Authorization: '',
})
onMounted(() => {
  myHeaders.Authorization = proxy.$store.state.user.token
  myHeaders['x-auth-token'] = proxy.$store.state.user.token
})

const handleBeforeUpload = (file) => {
  let isImg = false
  if (props.fileType) {
    isImg = props.fileType.some(
      (type) => file.name.split('.')[file.name.split('.').length - 1] === type
    )
  } else {
    isImg = file.type.indexOf('image') > -1
  }
  const isLt = file.size / 1024 / 1024 < fileSize.value

  if (!isImg) {
    proxy.$message.error({
      message: `文件格式不正确, 请上传 ${props.fileType.join(' / ')} 格式文件!`,
      showClose: true,
      duration: 3500,
    })
    return false
  }
  let file_type_list = proxy.$store.state.permission.dict['file_type_list']
  if (file_type_list && file_type_list.length) {
    let uploadType = file.name.split('.')[file.name.split('.').length - 1]
    let file_type_list_arr = []
    file_type_list.forEach((item) => {
      file_type_list_arr.push(item.code)
    })
    if (!String(file_type_list_arr).includes(uploadType)) {
      proxy.$message.error({
        message: `文件格式【${uploadType}】非白名单文件类型格式，不支持上传`,
        showClose: true,
        duration: 3500,
      })
      return false
    }
  }
  if (!isLt) {
    proxy.$message.error({
      message: `上传文件大小不能超过 ${fileSize.value} MB!`,
      showClose: true,
      duration: 3500,
    })
    return false
  }
  return isImg && isLt
}
const handleUploadSuccess = (res) => {
  proxy.$message.success({
    message: `上传成功`,
    showClose: true,
    duration: 3500,
  })
  emit('upDateUpload', {
    index: props.index,
    data: res.data,
  })
}
const handleErr = () => {
  proxy.$message.error({
    message: `上传失败`,
    showClose: true,
    duration: 3500,
  })
}
</script>
<style lang="scss" scoped>
.ele-dialog {
  .el-dialog__body {
    height: 370px !important;
  }
  .title-wrapper {
    width: 100%;
    position: relative;
  }
  .title-handle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    .padding {
      padding: 0 10px;
    }
  }
}
.carousel-wrapper {
  width: 100%;
  height: 100%;
  background-color: #ebeef5;
  margin-bottom: 10px;
}
.carousel-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  .image-style {
    background: #ffffff;
    max-height: 100%;
    max-width: 100%;
  }
}
</style>
