<template>
  <div class="model-tips-title">
    <div class="model-tips-label">
      <template v-if="brackets"> ( </template>
      <span v-show="title">{{ title }}：</span>
      <div v-for="(item, index) of items" :key="index" class="model-tips-value">
        <span>{{ item.label }}</span>
        <span class="model-tips-nearly" :style="item.style"></span>
      </div>
      <template v-if="brackets">)</template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: function () {
      return []
    },
  },
  title: {
    type: String,
    default: '',
  },
  brackets: {
    //括号
    type: Boolean,
    default: false,
  },
})
</script>

<style lang="scss">
</style>
