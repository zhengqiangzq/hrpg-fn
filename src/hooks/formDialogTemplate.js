/**
 * 通用表单弹窗配置模板
 */
export const formDialogTemplate = {
  // ---- 角色权限 - 修改生效/失效日期 ----
  dateDialog: {
    title: "修改生效/失效日期",
    width: "800px",
    labelWidth: "140px",
    fieldList: [
      {
        label: "权限生效日期",
        value: "validateDate",
        type: "date",
        required: true,
        width: "50%",
      },
      {
        label: "权限失效日期",
        value: "expireDate",
        type: "date",
        required: true,
        width: "50%",
      },
    ],
    rules: {
      validateDate: [
        { required: true, message: "请选择生效日期", trigger: "change" },
      ],
      expireDate: [
        { required: true, message: "请选择失效日期", trigger: "change" },
      ],
    },
  },
  // ---- 方案查询 - 保存方案 ----
  savePlanDialog: {
    title: "保存方案",
    width: "640px",
    labelWidth: "140px",
    fieldList: [
      {
        label: "查询方案名称",
        value: "name",
        type: "input",
        required: true,
        width: "100%",
      },
    ],
    rules: {
      name: [{ required: true, message: "请输入方案名称", trigger: "blur" }],
    },
  },
   abstractDialog: {
    title: '新增常用摘要',
    width: '800px',
    labelWidth: '140px',
    fieldList: [
      { 
        label: '核算账簿',
        value: 'accbookName',
        asValue: 'accbookId',
        type: 'select-data-custom',
        selectDataType: 'accountingBook',
        required: true,
        width: '50%' 
      },
      { 
        label: '常用摘要编码',
        value: 'code',
        type: 'input', 
        required: true, 
        width: '50%' 
      },
      { 
        label: '摘要属性', 
        value: 'summaryType', 
        type: 'select-model',
        code:'summary_type', 
        required: true, 
        width: '50%' },
      { 
        label: '摘要内容', 
        value: 'summaryName', 
        type: 'textarea', 
        required: true, 
      },
    ],
    rules: {
      accbookName: [{ required: true, message: '请选择核算账簿', trigger: 'change' }],
      code: [{ required: true, message: '请输入摘要编码', trigger: 'blur' }],
      summaryType: [{ required: true, message: '请选择摘要属性', trigger: 'change' }],
      summaryName: [{ required: true, message: '请输入摘要内容', trigger: 'blur' }],
    },
  },
}