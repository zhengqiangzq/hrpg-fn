---
name: treetable
description: 用于左侧树状，右侧表格模式。
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
  - 项目采用左右布局，左侧为树状结构，右侧为表格。
  - 左侧头部名称及按钮使用 `src/components/TreeBtns.vue`。
    - **注意**: 如果树头部没有按钮功能（仅有标题文字），则 `TreeBtns` 组件只需传入 `title`，`filter-btn` 传空数组 `[]`，不要生成无意义的 `btnList`。
    - 如果有按钮功能，则按权限动态过滤按钮，未授权的按钮不渲染。
  - 左侧树状结构使用基本的 `el-tree` 组件。
  - 右侧表格使用 `src/components/tableContainer.vue`。
  - 查询表单和按钮组需分别使用两个独立的 `src/components/newPageFilter.vue` 组件生成。
  - 接口属性 (`api`) 统一设为 `null`，不需要在文件中引入或标明实际的 API 接口。
  - **搜索字段**: 
    - 查询表单中，凡是查找类型的参数（如会计期间、药品类别、核算账簿、科目等），禁止使用 `suffixIcon: "Search"` 方式，必须使用 `slot: true` 并在 HTML 中通过插槽方式实现。
    - **插槽命名格式**: 查询表单插槽命名为 `#filter-{value}`，例如 `#filter-accountBookName`。
    - **插槽内容**: 插槽内必须包含 `el-input` 组件，且通过 `#append` 插槽添加带有点击事件的 `el-icon` (Search)，实现查找功能。
    - **查找方法**: 每个查找字段必须定义对应的选择方法，如 `selectAccountBook()`、`selectDebitSubject()`，方法内使用 `useSelectData` 钩子实现数据选择器。
  - **必填校验**: 
    - 若查询表单中存在必填项，必须在 `filterInfo.list` 中对应的字段添加 `required: true` 属性。
    - 必须导入 `requiredPageFilter` 工具函数，`import {requiredPageFilter} from "@/utils";`。
    - 查询方法中必须先调用 `requiredPageFilter(filterInfo.value.list, filterInfo.value.query)` 进行必填校验，校验通过后才能执行查询逻辑。
  - **表格序号字段**: 
    - `tableInfo.fieldList` 中**禁止**生成序号字段 `{ label: "序号", value: "index", type: "index" }`，表格组件会自动生成序号列。
  - 结构需参考 `src/views/demo/treeTable/index.vue`。
- **新增/编辑页（跳转页面） (modify.vue)**:
  - 使用 `src/components/ModifyPage/ModifyPage.vue` 作为容器。
  - 使用 `src/components/ModifyPage/ModifyForm.vue` 生成表单。
  - **组件传参**: 
    - `ModifyForm` 只需要传递 `:form-info="formInfo"` 即可，禁止重复传递 `ref`, `v-model`, `field-list`,  `rules`, `title` 等。
  - **多表单**: 
    - 如果页面中有多个表单区域（如科目信息、辅助信息等），需使用多个 `ModifyForm` 组件分别渲染，每个表单对应一个独立的 `formInfo` 对象。
  - **明细表格**: 
    - `ModifyTable` 组件默认自带序号列，不要在 `fieldList` 中再添加 `{ label: '序号', value: 'index' }`，也不要在模板中使用 `#col-index` 插槽，否则会导致序号重复。
  - **条件生成**: 
    - 只有在确实存在明细表格需求时，才生成 `ModifyTable.vue` 组件及其对应的 `tableInfo` 数据。
  - 结构需参考 `src/views/demo/treeTable/modify.vue`。
  - **新增页/编辑页（弹框模式） (addEdit.vue)**:
  - 新增页为弹框模式，点击新增按钮，打开新增弹框填写表单模式新增。
  - 使用方法可参考 `src/views/demo/tree/addEdit.vue`
  - **表单插槽**: 
    - 表单字段中凡是查找类型的参数（如科目、辅助核算等），必须使用 `type: 'slot'` 并在 HTML 中通过插槽方式实现。
    - **插槽命名格式**: 弹框表单插槽命名为 `#form-{value}`，例如 `#form-debitSubject`。
    - **插槽内容**: 插槽内必须包含 `el-input` 组件，且通过 `#append` 插槽添加带有点击事件的 `el-icon` (Search)，实现查找功能。
    - **查找方法**: 每个查找字段必须定义对应的选择方法，方法内使用 `useSelectData` 钩子实现数据选择器。
  - **必填校验**: 
    - 必填字段必须在 `fieldList` 中添加 `required: true` 属性。
    - 必填字段必须在 `rules` 对象中配置校验规则，格式为 `{ value: [{ required: true, message: "请输入/选择字段名", trigger: "blur" }] }`。
    - 确认按钮点击时必须调用 `state.value.ref.validate((valid) => { ... })` 进行表单校验，校验通过后才能提交。
- **详情页 (detail.vue)**:
  - 使用 `src/components/NewFullScreen.vue` 作为容器。
  - 内部结构使用 `model-panel` 划分，基础信息使用 `basic-information` 组件。
  - **条件生成**: 只有在确实存在明细表格数据时，才生成 `page-table` 组件及相关的明细面板。
  - 结构需参考 `src/views/demo/treeTable/detail.vue`，且必须包含可进入编辑页的“编辑”按钮及组件跳转逻辑。

## 项目生成结构说明
- 生成的主页使用 `index.vue` 文件命名。
- 生成的新增页为跳转页使用 `modify.vue` 文件命名，如果新增页是弹框模式使用 `addEdit.vue` 文件命名。
- 生成的详情页使用 `detail.vue` 文件命名。
- **明细页要求**: 
  - 除非明确有独立的明细页面，否则不生成 `detailList.vue`。
- **路径命名规则**: 
  - 目录和文件路径必须严格按照用户指定的驼峰式路径生成，禁止转换为小写或其他格式。例如用户指定 `src/views/demo/treeTable`，必须保持该路径的大小写格式。

## 页面跳转说明
- 点击新增按钮展示新增页面。
- 点击表格编码展示详情页面。
- 点击编辑按钮展示编辑页面。
- 点击明细页页签需展示明细页面。
- 点击列表页页签需展示列表页面。
- **跳转方式**: 
  - 页面跳转禁止使用 Vue Router，必须使用组件形式引入并结合 `v-if` 或 `v-show` 进行切换。

## 调用接口与逻辑说明
- **接口解耦**: 
  - 不需要在文件中直接引入或生成实际的 API 调用接口代码，接口引用一律设为 `null`，仅定义方法骨架。
- **useSelectData 钩子**: 
  - 当页面中存在查找类型字段（使用插槽方式实现的查找字段）时，必须引入 `useSelectData` 钩子，用于实现数据选择器功能。
  - 使用方式：`import { useSelectData } from "@/hooks/useSelectData";`，然后通过 `const { selectorInfo, selectorRef } = useSelectData();` 获取选择器实例。
- **筛选字段事件规范**：
  - **searchList 筛选字段禁止添加 event**：
    - `index.vue` 中 `filterInfo.searchList` 中的所有筛选条件字段（input、select、select-model、slot 等）**禁止配置 `event` 属性**。
  - **查询触发方式**：
    - 统一通过 filterbtn 中的"查询"按钮触发 `search()` 方法。
- **按钮方法**: 
  - 必须为所有按钮定义具体的点击事件处理函数。
  - **方法命名规范**：
    - 生成页面中`filterInfo.btnList` 中的按钮（除了导出按钮）其余按钮事件必须使用 `() => 方法名()` 格式，例如 `event: () => openModify()`。
  - **方法定义要求**：
    - 必须在 script 部分定义对应的方法函数，方法体可以为空 `{}`（表示待实现）或包含具体业务逻辑。
    - 方法命名建议采用动词+名词的形式，如 `handleAllocation`、`handleBatchAuxiliary`、`handleEnableDisable` 等。
    - 查询类方法可使用简洁名称如 `search`、`clearSearch`、`handleQueryPlan` 等。
    - 操作列按钮方法通常需要接收 row 参数，如 `update(row)`、`disableRow(row)`、`moreAction(row)`。
  - **删除逻辑**: 
    - 必须将单行删除和批量删除合并为一个 `handleDelete(row)` 方法。
    - 必须包含 `proxy.$confirm` 提示，且提示内容需根据删除数量动态显示。
    - 内部需逻辑判断：传入 `row` 为单删，不传则自动取选中行进行批删。
- **字段配置**: 
  - `index.vue` 中 `formInfo.fieldList` 中的数据对象禁止包含 `span` 属性。

## 界面样式与图标说明
- **无样式块**: 
  - 严禁在文件中生成 `<style>` 样式区块。
- **无图标**: 
  - 所有按钮严禁生成 `icon` 图标属性。
