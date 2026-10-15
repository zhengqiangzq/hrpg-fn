---
name: tree
description: 用于生成最基础的页面（首页为树状结构），页面左侧为树状结构，右侧为表单形式结构。
---

## 角色定义
- 你是一个经验丰富的前端开发人员，负责系统的开发。

## 项目规则
- 项目采用Vue3 + Vite + ElementPlus框架开发
- 项目采用Vue Router进行路由管理
- 项目采用Vuex进行状态管理
- **响应式数据定义**: 禁止使用 `reactive` 定义响应式数据，必须使用 `ref`。访问数据时通过 `.value` 属性操作。

## 项目组件与布局说明
- **首页 (index.vue)**:
  - 页面左侧为树状结构，使用el-tree组件。
  - 左侧按钮集使用TreeBtns组件。 使用方法可参考 `src/views/demo/tree/index.vue`
  - 接口属性 (`api`) 统一设为 `null`，不需要在文件中引入或标明实际的 API 接口。
  - **搜索字段**: 
    - 查询表单中，凡是查找类型的参数（如会计期间、药品类别、核算账簿、科目等），禁止使用 `suffixIcon: "Search"` 方式，必须使用 `slot: true` 并在 HTML 中通过插槽方式实现。
    - **插槽命名格式**: 查询表单插槽命名为 `#filter-{value}`，例如 `#filter-accountBookName`。
    - **插槽内容**: 插槽内必须包含 `el-input` 组件，且通过 `#append` 插槽添加带有点击事件的 `el-icon` (Search)，实现查找功能。
    - **查找方法**: 每个查找字段必须定义对应的选择方法，如 `selectAccountBook()`、`selectDebitSubject()`，方法内使用 `useSelectData` 钩子实现数据选择器。
- **新增页 (addEdit.vue)**:
  - 新增页为弹框模式，点击新增按钮，打开新增弹框填写表单模式新增。
  - 使用方法可参考 `src/views/demo/tree/addEdit.vue`
  - **表单插槽**: 
    - 表单字段中凡是查找类型的参数（如科目、辅助核算等），必须使用 `type: 'slot'` 并在 HTML 中通过插槽方式实现。
    - **插槽命名格式**: 弹框表单插槽命名为 `#form-{value}`，例如 `#form-debitSubject`。
    - **插槽内容**: 插槽内必须包含 `el-input` 组件，且通过 `#append` 插槽添加带有点击事件的 `el-icon` (Search)，实现查找功能。
    - **查找方法**: 每个查找字段必须定义对应的选择方法，方法内使用 `useSelectData` 钩子实现数据选择器，并使用组件 <select-data ref="selectorRef" /> 实现数据选择器功能。
  - **必填校验**: 
    - 必填字段必须在 `state.fieldList` 中添加 `required: true` 属性。
    - 必填字段必须在 `state.rules` 对象中配置校验规则，格式为 `{ value: [{ required: true, message: "请输入/选择字段名", trigger: "blur" }] }`。
    - 确认按钮点击时必须调用 `state.value.ref.validate((valid) => { ... })` 进行表单校验，校验通过后才能提交。
- **编辑页 (index.vue)**:
  - 首页右侧就是编辑页，点击左侧树状结构中的节点，右侧展示明细信息，就可直接编辑。
  - 使用方法可参考 `src/views/demo/tree/index.vue`

## 项目生成结构说明
- 生成的首页使用 `index.vue` 文件命名。
- 生成的新增页使用 `addEdit.vue` 文件命名。
- **路径命名规则**: 目录和文件路径必须严格按照用户指定的驼峰式路径生成，禁止转换为小写或其他格式。例如用户指定 `src/views/demo/treeTable`，必须保持该路径的大小写格式。

## 页面跳转说明
- 点击新增按钮展示新增弹框页面。
- 点击左侧树状结构中的节点，右侧展示明细页面。

## 调用接口与逻辑说明
- **接口解耦**: 不需要引入或生成实际的 API 调用接口代码，接口引用一律设为 `null`，仅定义方法骨架。
- **useSelectData 钩子**: 
  - 当页面中存在查找类型字段（使用插槽方式实现的查找字段）时，必须引入 `useSelectData` 钩子，用于实现数据选择器功能。
  - 使用方式：`import { useSelectData } from "@/hooks/useSelectData";`，然后通过 `const { selectorInfo, selectorRef } = useSelectData();` 获取选择器实例。
- **API对象定义**: 
  - 定义API对象，所有接口属性设为 `null`，仅 `download` 属性可设为 `exportTemplateExcel`（用于下载模板）。
  - 使用方法可参考 `src/views/demo/tree/index.vue`
- **权限控制**: 
  - 不需要定义 `PERMISSION_CODE` 字段。
  - 权限格式：`proxy.$permission('页面名称:操作标识')`，如 `proxy.$permission('tree:add')`。
  - 使用方法可参考 `src/views/demo/tree/index.vue`
  - **方法命名规范**：
    - 生成页面中 `filterInfo.btnList` 中的按钮（除了导出按钮）其余按钮事件必须使用 `() => 方法名()` 格式，例如 `event: () => openModify()`。
- **导入功能**: 
  - 使用 `useUploadExcel` 钩子获取 `uploadExcelBtns`。
  - 按钮中存在"导入"或"导入日志"时，必须使用 `...uploadExcelBtns` 展开到按钮列表中。
  - 使用方法可参考 `src/views/demo/tree/index.vue`
- **导入模板/下载模板与导出功能**: 
  - 必须使用 `useUpload` 钩子获取 `exportData` 和 `downloadTemplate` 方法。
  - 导入模板按钮事件使用 `downloadTemplate("模板名称", "权限标识")`。
  - 导出按钮事件使用 `exportData(query)`，且需先判断查询条件是否存在，不存在则提示"请先查询数据"。
  - 使用方法可参考 `src/views/demo/tree/index.vue`

- **按钮方法**: 必须为所有按钮定义具体的点击事件处理函数。
- **删除逻辑**: 必须将单行删除和批量删除合并为一个 `handleDelete(row)` 方法。
  - 必须包含 `proxy.$confirm` 提示，且提示内容需根据删除数量动态显示。
  - 内部需逻辑判断：传入 `row` 为单删，不传则自动取选中行进行批删。
- **字段配置**:
  - `index.vue` 中 `formInfo.fieldList` 的数据对象禁止包含 `span` 属性控制布局：普通字段禁止添加 `width` 属性，文本域（textarea）使用 `width: 100%`（占整行）。
  - `addEdit.vue` 中 `state.fieldList` 的数据对象**必须**包含 `width` 属性控制布局：普通字段使用 `width: 50%`（占半行），文本域（textarea）使用 `width: 100%`（占整行）。

## 界面样式与图标说明
- **无样式块**: 严禁在文件中生成 `<style>` 样式区块。
- **无图标**: 所有按钮严禁生成 `icon` 图标属性。
