<template>
  <div :class="props.multipleSheets ? 'up-img' : 'uploadwrapper'">
    <p v-if="label" style="text-align: center; font-size: 16px; color: #606266">
      {{ label }}
    </p>
    <el-carousel
      v-if="props.multipleSheets"
      class="carousel-wrapper"
      :class="state.fileList.length ? 'bgimg' : ''"
      :autoplay="false"
      height="150px"
    >
      <template v-if="state.fileList && state.fileList.length">
        <el-carousel-item
          v-for="(item, index) in state.fileList"
          :key="index"
          class="carousel-item"
          @click="handleCarousel"
        >
          <img :src="item.url" class="image-style" />
        </el-carousel-item>
      </template>
    </el-carousel>
    <el-upload
      :class="{ hide: state.hideUpload }"
      class="uploadImg"
      :action="props.action"
      :headers="state.myHeaders"
      :list-type="!props.multipleSheets ? 'picture-card' : 'text'"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :limit="props.limit"
      :show-file-list="!props.multipleSheets"
      :before-upload="handleBeforeUpload"
      :multiple="props.multiple"
      :file-list="state.fileList"
      :on-change="onChange"
      :on-success="handleUploadSuccess"
      :disabled="props.btnDisabled"
    >
      <el-icon v-if="!multipleSheets" class="up-img-plus"><Plus /></el-icon>
      <el-button
        v-if="props.multipleSheets"
        type="primary"
        style="width: 100%"
        :disabled="props.btnDisabled"
        >点击上传</el-button
      >
      <template #tip>
        <div v-if="props.showTip" class="el-upload__tip">
          上传
          <b style="color: #f56c6c">{{
            props.fileType ? props.fileType.join(' / ') : '图片'
          }}</b>
          格式文件，最大上传
          <b style="color: #f56c6c">{{ fileSize }}Mb</b>
        </div>
      </template>
    </el-upload>
    <EleGallery
      v-if="state.dialogInfo.visible"
      v-model:show-dialog="state.dialogInfo.visible"
      :file-list="state.fileList"
      :title="props.label"
      :multiple-sheets="props.multipleSheets"
      :show-delete="!props.btnDisabled"
      @callbackEle="callbackEle"
    />
  </div>
</template>
<script setup name="NewUpload">
import axios from 'axios'
import EleGallery from '@/components/NewUpload/eleGallery'
import { mapState } from 'vuex'

const { proxy } = getCurrentInstance()
const props = defineProps({
  //标题
  label: {
    type: String,
    default: '',
  },
  //上传张数
  limit: {
    type: Number,
    default: 2,
  },
  //是否上传多张
  multipleSheets: {
    type: Boolean,
    default: false,
  },
  //地址
  action: {
    type: String,
    default: axios.defaults.baseURL + '/file/minio/upload/basic',
  },
  // 支持上传的文件类型
  fileType: {
    type: Array,
    default() {
      return ['png', 'jpg', 'jpeg']
    },
  },
  //回显图片列表
  imageValue: {
    type: Array,
    default() {
      return []
    },
  },
  //显示提示
  showTip: {
    type: Boolean,
    default: true,
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
  btnDisabled: {
    type: Boolean,
    default: false,
  },
})
const fileSize = ref(proxy.$store.state.permission.systemConfig.max_file_size)
const emit = defineEmits(['upDateUpload'])
const state = reactive({
  hideUpload: false,
  dialogInfo: {
    visible: false,
    title: '查看图片',
  },
  myHeaders: {
    Authorization: '',
  },
  fileList: [],
  newFileList: [],
})
const token = computed(() => {
  return proxy.$store.state.user.token
})
onMounted(() => {
  state.myHeaders.Authorization = token.value
  state.myHeaders['x-auth-token'] = token.value
})
// watch(
//   () => props.imageValue,
//   (val) => {
//     state.fileList = val
//   },
//   {
//     immediate: true,
//     deep: true,
//   }
// )
watch(
  () => props.imageValue,
  (val) => {
    if (!props.multipleSheets) {
      state.hideUpload = val.length >= 1
    }
    if (val.length) {
      state.fileList = val.map((item) => {
        if (typeof item === 'string') {
          item = {
            name: item,
            url: import.meta.env.VITE_APP_FILE_URL + item,
          }
        }
        item.uid = item.uid || new Date().getTime() + (1 + Math.random())
        return item
      })
      state.newFileList = val
    } else {
      state.fileList = []
      state.newFileList = []
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

const handleCarousel = () => {
  state.dialogInfo.visible = true
}
const handleBeforeUpload = (file) => {
  if (props.imageValue.length >= props.limit && props.multipleSheets) {
    proxy.$message.error({
      message: `最多上传${props.limit}个文件`,
      showClose: true,
      duration: 3500,
    })
    return
  } else {
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
        message: `文件格式不正确, 请上传 ${props.fileType.join(
          ' / '
        )} 格式文件!`,
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
}
const handleUploadSuccess = (res) => {
  if (!props.multipleSheets) {
    emit('upDateUpload', res.data)
  } else {
    state.newFileList = state.newFileList.concat(res.data)
    let arr = res.data.map((item) => {
      if (typeof item === 'string') {
        item = {
          name: item,
          url: import.meta.env.VITE_APP_FILE_URL + item,
        }
      }
      item.uid = item.uid || new Date().getTime() + (1 + Math.random())
      return item
    })
    state.fileList = state.fileList.concat(arr)
    emit('upDateUpload', state.newFileList)
  }
}
const onChange = (file, fileList) => {
  if (!props.multipleSheets) {
    state.hideUpload = fileList.length >= 1
  }
}
const handleRemove = (file, fileList) => {
  if (!props.multipleSheets) {
    state.hideUpload = fileList.length >= 1
  }
  let arr = []
  if (fileList.length) {
    arr = fileList.map((item) => item.name)
  }
  emit('upDateUpload', arr)
}
const handlePictureCardPreview = (file) => {
  proxy.$nextTick(() => {
    state.fileList = [
      {
        name: file.url,
        url: file.url,
        uid: new Date().getTime() + (1 + Math.random()),
      },
    ]
    state.dialogInfo.visible = true
  }, 1200)
}
const callbackEle = (list) => {
  state.fileList = list
  state.newFileList = list.map((item) => item.name)
  emit('upDateUpload', state.newFileList)
}
</script>
<style scoped lang="scss">
.up-img {
  max-width: 225px;
  min-width: 200px;
}
.uploadwrapper {
  width: 148px;
}
:deep(.hide .el-upload--picture-card) {
  display: none !important;
}
:deep(.el-upload__tip) {
  line-height: 1.4;
}
:deep(.el-upload) {
  width: 100%;
}
:deep(.el-upload-list) {
  width: 100% !important;
}
.carousel-wrapper {
  margin-bottom: 10px;
  background-color: #ebeef5;
}
.carousel-item {
  display: flex;
  align-items: center;
  justify-content: center;

  .image-style {
    background: #ffffff;
    max-height: 150px;
    max-width: 100%;
  }
}
.bgimg {
  background-image: url(../../assets/image/no-img.png);
  background-repeat: no-repeat;
  background-size: 40px 40px;
  background-position: 50% 50%;
}
.up-img-plus {
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
