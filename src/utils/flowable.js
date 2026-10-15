import { defineAsyncComponent } from 'vue'
// 要异步导入的全局组件
const asyncComponentPathArr = [
]

function installFlow(app) {
  asyncComponentPathArr.forEach((item) => {
    app.component(item.name, defineAsyncComponent(item.path))
  })
}
export { installFlow }
