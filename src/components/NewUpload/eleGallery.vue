<template>
  <el-dialog draggable
    :title="props.title"
    width="800px"
    modal-append-to-body
    append-to-body
    :close-on-click-modal="state.closeOnClickModal"
    v-model="shows"
    class="ele-dialog"
    :before-close="handleClose"
  >
    <template #header>
      <div v-if="props.multipleSheets" class="title-wrapper">
        <span>{{ props.title }} / {{ state.list.length }}</span>
        <div v-if="props.showDelete" class="title-handle">
           <Search
            style="width: 16px; height: 16px; margin-left: 20px;"
            @click.self.stop="handlePreviewWin"
          />
          <Delete
            style="width: 16px; height: 16px"
            @click.self.stop="handelsDel"
          />
        </div>
        <div v-else class="title-handle">
           <Search
            style="width: 16px; height: 16px; margin-left: 20px;"
            @click.self.stop="handlePreviewWin"
          />
        </div>
      </div>
      <div v-else class="title-wrapper">
        <span>{{ props.title }} / {{ state.list.length }}</span>
        <div  class="title-handle">
          <Search
            style="width: 16px; height: 16px;"
            @click.self.stop="handlePreviewWin"
          />
        </div>
      </div>
    </template>

    <el-carousel
      class="carousel-wrapper"
      :autoplay="false"
      @change="carouselChange"
    >
      <template v-if="state.list && state.list.length">
        <el-carousel-item
          v-for="(item, index) in state.list"
          :key="index"
          class="carousel-item"
        >
          <img :src="item.url" class="image-style" />
        </el-carousel-item>
      </template>
    </el-carousel>
  </el-dialog>
</template>
<script setup name="NewUploadEleGallery">
import {api as viewerApi} from "v-viewer"
import "viewerjs/dist/viewer.css"
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  multipleSheets: {
    //控制是否显示删除按钮
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '查看图片',
  },
  //图片列表，格式[{name:'',url: url, uid: new Date().getTime() + (1 + Math.random())}]
  fileList: {
    type: Array,
    default: function () {
      return []
    },
  },
  showDelete: {
    //是否显示删除按钮
    type: Boolean,
    default: true,
  },
})
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update', 'callbackEle'])

const state = reactive({
  list: [],
  initialIndex: 0,
  closeOnClickModal: false,
})

const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emit('update:showDialog', newValue) // 更新父组件shows
  },
})

watch(
  () => props.fileList,
  (val) => {
    if (val.length) {
      state.list = val
    } else {
      state.list = []
    }
  },
  {
    immediate: true,
  }
)

function handleClose() {
  shows.value = false
}
function carouselChange(val) {
  state.initialIndex = val
}
function handelsDel(done) {
  proxy
    .$confirm('删除后将改变数据,是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      let initialIndex = state.initialIndex
      state.list = state.list.filter((item, index) => initialIndex !== index)
      emit('callbackEle', state.list)
      if (state.list.length === 0) {
        handleClose()
      }
    })
}
function handlePreviewWin(){
  let initialIndex = state.initialIndex
  let arr = state.list.map(item => item.url)
  viewerApi({
    options: {
      initialViewIndex: initialIndex,
      zIndex: 999999999
    },
    images: arr
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
