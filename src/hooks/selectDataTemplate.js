/**
 * table表头数据
 */
import {
  periodyearList,
  periodmonthList,
  sysArchiveList,
  accsystemList,
  adjunctAccountItemList,
  selectPageByUser,
  serviceBusiOrgAction,
  accasoaVersionList,
  getUserList,
  accountingbookAuthList,
  accasoaListByBook,
  accasoaById,
  voucherTypeList, cashFlowItemsTreeList,
  getAllocationList,
} from "@/api/base";
// import {allAccountBook, pageVoucherType} from "@/api/finance";
import { useStorage } from "@vueuse/core";
import {parallelAccountRuleCopyDetail} from "@/api/rulesAndInitial/parallelAccountRule";
const setting = useStorage("setting", {}, sessionStorage);
export const dataTemplate = {
  dept: {
    title: "科室",
    component: "tree",
    // api: getDeptTree,
  },
  accountingBook: {
    title: "选择账簿",
    api: accountingbookAuthList,
    component: "tree",
    disabledLevel: [1],
    filterPlaceholder: "请输入编码/名称",
    filterControls: [
      { label: "按主账簿查询", field: "accbookType", queryValue: "1" },
    ],
    defaultProps: {
      children: "accBookList",
      label: (data) => (data.code ? `${data.code} ${data.name}` : data.name),
    },
    query: {
      type: "1",
    },
    saveEmpty: true
    // 自定义 label 渲染（返回 VNode），用于需要分样式展示编码和名称
    // renderLabel: (h, { data }) =>
    //   h("div", { class: "tree-node-label" }, [
    //     data.code ? h("span", { class: "tree-node-code" }, data.code) : null,
    //     h("span", { class: "tree-node-name" }, data.name),
    //   ]),
  },
  voucherType: {
    title: "凭证类型",
    api: voucherTypeList,
    pager: true,
    filters: [
      { label: "编码", value: "code", type: "input" },
      { label: "名称", value: "name", type: "input" },
    ],
    fieldList: [
      { label: "编码", value: "code" },
      { label: "名称", value: "name" },
    ],
  },
  commonVoucher: {
    title: "调用常用凭证",
    api: periodyearList,
    apiList: periodmonthList,
    rootName: "常用凭证",
    component: "treeTable",
    pager: false,
    tabIndex: true,
    selectMode: "table",
    clickParams: "id",
    code: "id",
    defaultProps: {
      children: "children",
      label: "periodyear",
    },
    query: {},
    fieldList: [
      { label: "摘要", value: "summary" },
      { label: "会计科目", value: "subjectName" },
      { label: "辅助核算", value: "auxiliary" },
      { label: "借方", value: "debitAmount" },
      { label: "贷方", value: "creditAmount" },
    ],
  },
  accountingPeriodMonth: {
    title: "会计期间",
    api: periodyearList,
    apiList: periodmonthList,
    rootName: "会计年度",
    query: {
      sort: "begin_date desc",
    },
    component: "treeTable",
    pager: false,
    tabIndex: true,
    filters: null,
    clickParams: "accountingPeriodId",
    code: "id",
    defaultProps: {
      children: "children",
      label: "periodyear",
    },
    fieldList: [
      { label: "会计期间", value: "periodyearAndMonth" },
      { label: "开始日期", value: "begindate" },
      { label: "结束日期", value: "enddate" },
    ],
  },
  systemArchive: {
    title: "系统档案",
    rootName: "系统档案",
    selectMode: "table",
    apiList: sysArchiveList,
    dictKey: "fn_new_class_type",
    query: {},
    component: "treeTable",
    pager: true,
    defaultProps: {
      children: "children",
      label: "name",
    },
    // 表头
    fieldList: [
      { label: "档案编码", value: "code" },
      { label: "档案名称", value: "name" },
      { label: "档案类型", value: "classTypeValue" },
    ],
    // 搜索框
    searchList: [
      {
        label: "关键词",
        value: "keyword",
        componentType: "input",
      },
    ],
    // 树型点击时传参
    clickParams: "classType",
    code: "code",
  },
  Account: {
    title: "会计科目",
    api: accasoaListByBook,
    apiList: accasoaById,
    selectMode: "tree",
    // dictKey: "fn_new_class_type",
    width: "1200px",
    onlyLeaf: true,
    query: {},
    component: "treeTable",
    pager: false,
    // disabledLevel: [1],
    defaultProps: {
      children: "children",
      label: (data) => (data.code ? `${data.code} ${data.name}` : data.name),
    },
    // 表头
    fieldList: [
      { label: "辅助核算编码", value: "accassitemCode" },
      { label: "辅助核算名称", value: "accassitemName" },
    ],
    // 搜索框
    formList: [
      {
        label: "科目编码",
        value: "code",
        type: "input",
        width: '50%',
        disabled: true,
      },
      {
        label: "科目名称",
        value: "name",
        type: "input",
      width: '50%',
        disabled: true,
      },
      {
        label: "科目类型",
        value: "accTypeName",
        type: "input",
      width: '50%',
        disabled: true,
      },
      {
        label: "科目方向",
        value: "accDirectionValue",
        type: "input",
      width: '50%',
        disabled: true,
      },
      {
        label: "科目分类",
        value: "cashClassValue",
        type: "input",
      width: '50%',
        disabled: true,
      },
      {
        label: "发生额方向控制",
        value: "isCtrlIncur",
        type: "checkbox-model",
      width: '50%',
        disabled: true,
      },
      {
        label: "余额额方向控制",
        value: "isCtrlBalance",
        type: "checkbox-model",
      width: '50%',
        disabled: true,
      },
      {
        label: "账簿余额双向显示",
        value: "bothDirection",
        type: "checkbox-model",
      width: '50%',
        disabled: true,
      },
      {
        label: "启用状态",
        value: "statusValue",
        type: "input",
      width: '50%',
        disabled: true,
      },
      {
        label: "是否末级",
        value: "isTail",
        type: "checkbox-model",
      width: '50%',
        disabled: true,
      },
    ],
    // 树型点击时传参
    clickParams: "id",
    code: "id",
    // 表格接收名称、
    tableDataName:"accassList",
  },
  // ---- 科目体系（单选树） ----
  accSystem: {
    title: "选择科目体系",
    rootName: "科目体系",
    component: "tree",
    api: accsystemList,
    query: {},
    showCheckbox: false,
    filterPlaceholder: "请输入科目体系编码/名称",
    defaultProps: {
      children: "children",
      label: (data) => (data.code ? `${data.code} ${data.name}` : data.name),
    },
  },
  // ---- 科目表（多选树，复选框） ----
  accChart: {
    title: "选择科目表",
    rootName: "科目表",
    component: "tree",
    api: accsystemList,
    checkStrictly: true,
    filterPlaceholder: "请输入科目表编码/名称",
    onlyLeaf: true,
    query: {
      withAccchart: true,
    },
    defaultProps: {
      children: "accchartList",
      label: (data) => (data.code ? `${data.code} ${data.name}` : data.name),
    },
  },
  // ---- 辅助核算项（多选表格） ----
  adjunctAccountItem: {
    title: "选择辅助核算项",
    api: adjunctAccountItemList,
    checkBox: true,
    filters: [
      {
        componentType: "input",
        label: "编码/名称",
        clearable: true,
        value: "keyword",
      },
    ],
    fieldList: [
      { label: "辅助核算项编码", value: "code" },
      { label: "辅助核算项名称", value: "name" },
    ],
  },
  // ---- 辅助核算项(含余额方向控制等)（多选表格） ----
  adjunctAccountOtherItem: {
    title: "选择辅助核算项",
    api: adjunctAccountItemList,
    checkBox: true,
    filters: [
      {
        componentType: "input",
        label: "编码/名称",
        clearable: true,
        value: "keyword",
      },
    ],
    fieldList: [
      { label: "辅助核算项编码", value: "code" },
      { label: "辅助核算项名称", value: "name" },
      {
        label: "余额方向控制",
        value: "isBalanceDirectionCtrl",
        type: "checkbox-model",
        align: "center",
      },
      {
        label: "是否可为空",
        value: "isEmpty",
        type: "checkbox-model",
        align: "center",
      },
      {
        label: "是否可选非末级",
        value: "isNontail",
        type: "checkbox-model",
        align: "center",
      },
    ],
  },
  // ---- 选择人员（单选表格） ----
  user: {
    title: "选择人员",
    api: getUserList,
    pager: true,
    saveEmpty: true,
    checkBox: false,
    query: { type: "normal", userType: "1" },
    filters: [{ type: "input", label: "名称", value: "name" }],
    fieldList: [
      { label: "名称", value: "name" },
      { label: "账号", value: "accountNo" },
      { label: "部门", value: "deptName" },
    ],
  },
  // ---- 角色权限 - 选择用户（多选表格） ----
  roleAuth: {
    title: "选择用户",
    api: selectPageByUser,
    pager: true,
    width: "1200px",
    filters: [
      {
        label: "所属组织",
        value: "orgName",
        asValue: "orgId",
        componentType: "select-data-custom",
        selectDataType: "orgTree",
      },
      { label: "编码", value: "accountNo", componentType: "input" },
      { label: "名称", value: "name", componentType: "input" },
    ],
    fieldList: [
      { label: "用户编码", value: "accountNo" },
      { label: "用户名称", value: "name" },
      { label: "部门", value: "deptName" },
      { label: "所属组织", value: "orgName" },
    ],
    checkBox: true,
    query: { orgId: setting.value.orgId, orgName: setting.value.hospitalName },
  },
  // ---- 所属组织（纯树弹窗） ----
  // 作为 select-data-custom 的 dataTemplate 使用示例
  // 支持 component: 'tree' | 'treeTable' | 表格（通过 fieldList 触发）
  orgTree: {
    title: "选择所属组织",
    filterPlaceholder: "请输入编码或名称",
    component: "tree",
    saveEmpty: true,
    api: (q) =>
      serviceBusiOrgAction({
        userId: JSON.parse(localStorage.getItem("userInfoStore") || "{}")
          ?.userAndPermissionInfo?.userInfoDTO?.id,
        ...q,
      }),
    nodeKey: "id",
    defaultProps: {
      children: "children",
      label: (data) => (data.code ? `${data.code} ${data.name}` : data.name),
    },
  },
  // ---- 科目版本详情（多选表格） ----
  versioningDetail: {
    title: "版本详情",
    api: accasoaVersionList,
    checkBox: false,
    pager: false,
    hiddenFilter: true,
    width: '1200px',
    hiddenBtn: true,
    fieldList: [
      { label: "科目表", value: "accchartName" },
      { label: "科目编码", value: "code" },
      { label: "科目名称", value: "name" },
      { label: "版本号", value: "versionNum" },
      { label: "生效日期", value: "effectiveDate" },
      { label: "失效日期", value: "validityDate" },
      { label: "创建组织", value: "createOrgName" },
    ],

  },
  // ---- 辅助核算值选择（动态弹窗类型，由后端接口返回 displayType 决定展示风格） ----
  adjunctValue: {
    title: "选择辅助核算值",
    component: "treeTable", // 默认左树右表，可被 selectorInfo 覆盖为 tree/table
  },
  copyDetail: {
    title: "复制详情",
    api: parallelAccountRuleCopyDetail,
    query: {},
    hiddenBtn: true,
    hiddenFilter: true,
    fieldList: [
      { label: "复制日期", value: "createDate" },
      { label: "本方账簿", value: "fromAccbookName" },
      { label: "目的账簿", value: "toAccbookName" },
      { label: "复制内容", value: "typeValue" },
      { label: "摘要", value: "explanation" },
      { label: "说明", value: "copyResult" },
    ],
  },
  cashFlowProject: {
    title: "现金流量项目",
    api: cashFlowItemsTreeList,
    query: {},
    component: "tree",
  },
  // ========== 分摊规则选择（第二个弹窗） ==========
  allocationRule: {
    title: "分摊规则",
    api: getAllocationList,
    pager: true,
    width: "800px",
    filters: [
      { label: "关键字", value: "code", componentType: "input" },
    ],
    fieldList: [
      { label: "序号", value: "sortNum", width: "80" },
      { label: "分摊规则编码", value: "code" },
      { label: "分摊规则名称", value: "name" },
    ],
  },
};
