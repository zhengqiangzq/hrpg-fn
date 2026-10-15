---
name: table
description: 用于生成最基础的页面（首页为普通表格），其中包括首页、新增/编辑页、详情页等。
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
  - 表格使用 `src/components/tableContainer.vue`。
  - 查询表单和按钮组需分别使用两个独立的 `src/components/newPageFilter.vue` 组件生成。
  - 接口属性 (`api`) 统一设为 `null`，不需要在文件中引入或标明实际的 API 接口。
  - **API对象定义**: 
    - 需要引入或生成实际的 API 调用接口代码，接口引用一律设为 `null`，仅定义方法骨架。
    - 定义API对象，所有接口属性设为 `null`，仅 `download` 属性可设为 `exportTemplateExcel`（用于下载模板）。
    - 结构需参考 `src/views/demo/table/index.vue`。
  - **搜索字段**: 
    - 查询表单中,使用newPageFilter组件，凡是查找类型的参数（如会计期间、药品类别、核算账簿、科目等），禁止使用 `suffixIcon: "Search"` 方式，必须使用 `slot: true` 并在 HTML 中通过插槽方式实现。
    - **插槽命名格式**: 查询表单插槽命名为 `#filter-{value}`，例如 `#filter-accountBookName`。
    - **插槽内容**: 插槽内必须包含 `el-input` 组件，且通过 `#append` 插槽添加带有点击事件的 `el-icon` (Search)，实现查找功能。
    - **查找方法**: 每个查找字段必须定义对应的选择方法，如 `selectAccountBook()`、`selectDebitSubject()`，方法内使用 `useSelectData` 钩子实现数据选择器。
  - **必填校验**: 
    - 若查询表单中存在必填项，必须在 `filterInfo.list` 中对应的字段添加 `required: true` 属性。
    - 必须导入 `requiredPageFilter` 工具函数，`import {requiredPageFilter} from "@/utils";`。
    - `getList()` 查询方法中必须先调用 `requiredPageFilter(filterInfo.value.list, filterInfo.value.query)` 进行必填校验，校验通过后才能执行查询逻辑。
  - **表格序号字段**: 
    - `tableInfo.fieldList` 中**禁止**生成序号字段 `{ label: "序号", value: "index", type: "index" }`，表格组件会自动生成序号列。
  - **导入按钮**: 
    - 导入和导入日志按钮禁止手动创建，必须使用 `useUploadExcel` 钩子生成的 `uploadExcelBtns`，通过展开运算符 `...uploadExcelBtns` 添加到 `btnList` 中。
    - 结构需参考 `src/views/demo/table/index.vue`。
  - **导入模板/下载模板与导出功能**: 
    - 必须使用 `useUpload` 钩子获取 `exportData` 和 `downloadTemplate` 方法。
    - 导入模板按钮事件使用 `downloadTemplate("模板名称", "权限标识")`。
    - 导出按钮事件使用 `exportData(query)`，且需先判断查询条件是否存在，不存在则提示"请先查询数据"。
    - 使用方法可参考 `src/views/demo/table/index.vue`
  - **权限控制**: 
    - 不需要定义 `PERMISSION_CODE` 字段。
    - 权限格式：`proxy.$permission('页面名称:操作标识')`，如 `proxy.$permission('table:add')`。
    - 使用方法可参考 `src/views/demo/table/index.vue`
- **新增/编辑页 (modify.vue)**:
  - 使用 `src/components/ModifyPage/ModifyPage.vue` 作为容器。
  - 使用 `src/components/ModifyPage/ModifyForm.vue` 生成表单。
  - **组件传参**: 
    - `ModifyForm` 只需要传递 `:form-info="formInfo"` 即可，禁止重复传递 `ref`, `v-model`, `field-list`, `rules`, `title` 等。
  - **条件生成**:   只有在确实存在明细表格需求时，才生成 `ModifyTable.vue` 组件及其对应的 `tableInfo` 数据。
  - **关联页面**: 
    - 有新增页面就必须生成详情页，反之亦然。
  - **明细表格标题**: 
    - 修改明细表格名称需通过 `tableInfo.title` 属性设置，禁止手动生成 `model-panel`、`model-panel-header`、`model-panel-body` 等 div 容器。
  - **显隐控制**: 
    - 禁止直接使用 `v-model:visible="visible"`，必须使用 `showDialog` computed 属性控制显隐，通过 `emit('update:visible', newValue)` 同步父组件状态。
  - **插槽定义**: 
    - `formInfo.fieldList` 和 `tableInfo.fieldList` 中禁止使用 `slot: true`，必须使用 `type: 'slot'` 来定义插槽字段。
    - **表单插槽**: 表单字段中凡是查找类型的参数（如科目、辅助核算等），必须使用 `type: 'slot'` 并在 HTML 中通过插槽方式实现。
    - **插槽命名格式**: 表单插槽命名为 `#form-{value}`，例如 `#form-debitSubject`。
    - **插槽内容**: 插槽内必须包含 `el-input` 组件，且通过 `#append` 插槽添加带有点击事件的 `el-icon` (Search)，实现查找功能。
    - **查找方法**: 每个查找字段必须定义对应的选择方法，方法内使用 `useSelectData` 钩子实现数据选择器。
    - **必填校验**: 
      - 必填字段必须在 `formInfo.fieldList` 中添加 `required: true` 属性。
      - 必填字段必须在 `formInfo.rules` 对象中配置校验规则，格式为 `{ value: [{ required: true, message: "请输入/选择字段名", trigger: "blur" }] }`。
      - 确认按钮点击时必须调用表单验证方法进行校验，校验通过后才能提交。
    - 结构需参考 `src/views/demo/table/modify.vue`。
- **详情页 (detail.vue)**:
  - 使用 `src/components/NewFullScreen.vue` 作为容器。
  - 内部结构使用 `model-panel` 划分，基础信息使用 `basic-information` 组件。
  - **详情页明细表格条件生成**: 
    - 只有在确实存在明细表格数据时，才生成 `page-table` 组件及相关的明细面板。
  - **字段配置**: 
    - `formInfo.fieldList` 和 `tableInfo.fieldList` 中的数据对象禁止包含 `type` 属性；如果 label 字段中包含“金额”字样，需添加 `align: 'right'` 属性。表单数据对象禁止包含 `span` 属性控制布局：普通字段禁止添加 `width` 属性，文本域（textarea）使用 `width: 100%`（占整行）。
    - `addEdit.vue` 中 `state.fieldList` 的数据对象**必须**包含 `width` 属性控制布局：普通字段使用 `width: 50%`（占半行），文本域（textarea）使用 `width: 100%`（占整行）。
    - 结构需参考 `src/views/demo/table/detail.vue`，且必须包含可进入编辑页的“编辑”按钮及组件跳转逻辑。
- **明细页 (detailList.vue)**:
  - 表格使用 `src/components/tableContainer.vue`。
  - 查询表单和按钮组需分别使用两个独立的 `src/components/newPageFilter.vue` 组件生成。
  - 接口属性 (`api`) 统一设为 `null`，不需要在文件中引入或标明实际的 API 接口。
  - 结构需参考 `src/views/demo/table/detailList.vue`，且必须包含可进入明细页切换跳转逻辑。


## 项目生成结构说明
- 生成的主页使用 `index.vue` 文件命名。
- 生成的新增页使用 `modify.vue` 文件命名。
- 生成的详情页使用 `detail.vue` 文件命名。
- **明细页要求**: 除非明确有独立的明细页面，否则不生成 `detailList.vue`。
- **路径命名规则**: 目录和文件路径必须严格按照用户指定的驼峰式路径生成，禁止转换为小写或其他格式。例如用户指定 `src/views/demo/treeTable`，必须保持该路径的大小写格式。

## 页面跳转说明
- 点击新增按钮展示新增页面。
- 点击表格编码展示详情页面。
- 点击编辑按钮展示编辑页面。
- 点击明细页页签需展示明细页面。
- 点击列表页页签需展示列表页面。
- **跳转方式**: 页面跳转禁止使用 Vue Router，必须使用组件形式引入并结合 `v-if` 或 `v-show` 进行切换。

## 调用接口与逻辑说明
- **接口解耦**: 不需要引入或生成实际的 API 调用接口代码，接口引用一律设为 `null`，仅定义方法骨架。
- **useSelectData 钩子**: 
  - 当页面中存在查找类型字段（使用插槽方式实现的查找字段）时，必须引入 `useSelectData` 钩子，用于实现数据选择器功能。
  - 使用方式：`import { useSelectData } from "@/hooks/useSelectData";`，然后通过 `const { selectorInfo, selectorRef } = useSelectData();` 获取选择器实例。
- **按钮方法**: 必须为所有按钮定义具体的点击事件处理函数。
  - **方法命名规范**：
    - 生成页面中 `filterInfo.btnList` 中的按钮（除了导出按钮）其余按钮事件必须使用 `() => 方法名()` 格式，例如 `event: () => openModify()`。
- **删除逻辑**: 必须将单行删除和批量删除合并为一个 `handleDelete(row)` 方法。
  - 必须包含 `proxy.$confirm` 提示，且提示内容需根据删除数量动态显示。
  - 内部需逻辑判断：传入 `row` 为单删，不传则自动取选中行进行批删。
- **字段配置**: `formInfo.fieldList` 中的数据对象禁止包含 `span` 属性。

## 界面样式与图标说明
- **无样式块**: 严禁在文件中生成 `<style>` 样式区块。
- **无图标**: 所有按钮严禁生成 `icon` 图标属性。
