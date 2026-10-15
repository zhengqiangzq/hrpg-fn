/**
 * PlanSearch 方案查询配置
 * 两组 JSON 配置完全对应截图布局
 *
 * 字段类型说明：
 * - input / select / selectModel / rangeDate / rangeInput / checkbox-group：基础类型
 * - selectDataCustom：带搜索图标的 SelectData 弹窗选择器（需 selectDataType）
 * - slot：自定义插槽（如辅助核算表格），由父组件通过 #table-{value} 提供内容
 *
 * span: 2 表示占据一整行（两列），不传则默认半行
 */
import { adjunctAccountItemList } from "@/api/base";

// ==================== 配置 1：凭证查询（对应截图 1） ====================

export const voucherQueryConfig = {
  fields: [
    {
      label: "核算账簿",
      value: "accbookName",
      asValue: "accbookId",
      type: "selectDataCustom",
      selectDataType: "accountingBook",
      defaultValue: "",
    },
    {
      label: "凭证状态",
      value: "voucherStatus",
      type: "selectModel",
      code: "voucher_status",
      defaultValue: "signed",
    },
    {
      label: "凭证类型",
      value: "voucherTypeName",
      asValue: "voucherTypeId",
      type: "selectDataCustom",
      selectDataType: "voucherType",
      defaultValue: "",
    },
    {
      label: "凭证号",
      value: "voucherNo",
      type: "rangeInput",
      defaultValue: ["", ""],
    },
    {
      label: "制单人",
      value: "makerName",
      asValue: "makerId",
      type: "selectDataCustom",
      selectDataType: "user",
      defaultValue: "",
    },
    {
      label: "会计期间",
      value: "periodRange",
      type: "rangeDate",
      defaultValue: ["", ""],
    },
    {
      label: "签字人",
      value: "signerName",
      asValue: "signerId",
      type: "selectDataCustom",
      selectDataType: "user",
      defaultValue: "",
    },
    {
      label: "审核人",
      value: "reviewerName",
      asValue: "reviewerId",
      type: "selectDataCustom",
      selectDataType: "user",
      defaultValue: "",
    },
    {
      label: "记账人",
      value: "bookkeeperName",
      asValue: "bookkeeperId",
      type: "selectDataCustom",
      selectDataType: "user",
      defaultValue: "",
    },
    {
      label: "差异凭证",
      value: "diffVoucher",
      type: "selectModel",
      code: "diff_voucher_type",
      defaultValue: "",
    },
    {
      label: "科目类别",
      value: "accCategory",
      type: "selectModel",
      code: "acc_category",
      defaultValue: "",
    },
    {
      label: "摘要",
      value: "summaryName",
      asValue: "summaryId",
      type: "selectDataCustom",
      selectDataType: "summary",
      defaultValue: "",
    },
    {
      label: "科目",
      value: "accountName",
      asValue: "accountId",
      type: "selectDataCustom",
      selectDataType: "accountingSubject",
      defaultValue: "",
    },
    {
      label: "金额方向",
      value: "amountDirection",
      type: "selectModel",
      code: "amount_direction",
      defaultValue: "double",
    },
    {
      label: "金额",
      value: "amountRange",
      type: "rangeInput",
      defaultValue: ["", ""],
    },
    {
      label: "内部往来维度",
      value: "innerDimLevel",
      type: "select",
      defaultValue: "",
      slipProps: {
        api: adjunctAccountItemList,
        query: { innerDimLevel: "1" },
        keyField: "name",
        valueField: "id",
      },
    },
    {
      label: "凭证勾选",
      value: "voucherCheck",
      type: "checkboxGroup",
      defaultValue: ["normal", "error"],
      options: [
        { label: "正常凭证", value: "normal" },
        { label: "错误凭证", value: "error" },
        { label: "作废凭证", value: "error2" },
        { label: "暂存凭证", value: "error3" },
      ],
      span: 2,
    },
    {
      label: "辅助核算",
      value: "auxiliaryList",
      type: "slot",
      defaultValue: [
        {
          itemName: "",
          itemId: "",
          itemValue: "",
          itemValueId: "",
          isEmpty: false,
          isNontail: false,
        },
      ],
      span: 2,
    },
  ],
};
