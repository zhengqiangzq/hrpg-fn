import utils from "@/common/js/utils"; // 公共方法
import store from "@/store";
import { adjunctAccountItemList } from "@/api/base";
export default {
  /*
   *componentType: input input输入框
   *componentType: number 数字输入框
   * componentType: price 价格
   * componentType: date 日期输入框
   * componentType: dateTime 日期时间输入框
   * componentType: select-model 字典输入框
   * componentType: select-data-custom 通用选择弹框（selectDataType: 'user' 选择人员）
   * componentType: datetimerange 日期区间选择
   * componentType: slip-select api查询下拉选择
   * code: 字典
   * asValue: value映射
   * 普通查询用插槽: slot:true
   */
  //明细常用
  FieldList: {
    code: {
      label: "编码",
      value: "code",
      componentType: "input",
      show: false,
      hidden: true,
    },
    name: {
      label: "名称",
      value: "name",
      componentType: "input",
      show: false,
      hidden: true,
    },
    remark: {
      label: "备注",
      value: "remark",
      componentType: "input",
      show: false,
      hidden: true,
    },
    statusValue: {
      label: "状态",
      value: "statusValue",
      asValue: "status",
      componentType: "select-model",
      code: "",
      show: false,
      hidden: true,
    },
    dataSourceTypeValue: {
      label: '数据来源类型',
      value: 'dataSourceTypeValue',
      asValue: 'dataSourceType',
      componentType: 'select-model',
      code: 'sys_param_config_control_mode',
      show: false,
      hidden: true,
    },
    controlTypeValue: {
      label: '数据来源类型',
      value: 'controlTypeValue',
      asValue: 'dataSourceType',
      componentType: 'select-model',
      code: 'sys_param_config_control_mode',
      show: false,
      hidden: true,
    },
    createUserName: {
      label: '创建人',
      value: 'createUserName',
      asValue: 'createUser',
      componentType: 'select-data-custom',
      selectDataType: 'user',
      show: false,
      hidden: true,
    },
    createTime: {
      label: '创建时间',
      value: 'createTime',
      componentType: 'dateTime',
      show: false,
      hidden: true,
    },
    orgName: {
      label: '组织',
      value: 'orgName',
      componentType: 'input',
      show: false,
      hidden: true,
    },
    createOrgName: {
      label: '创建组织名称',
      value: 'createOrgName',
      componentType: 'input',
      show: false,
      hidden: true,
    },
    accchartName: {
      label: '科目表',
      value: 'accchartName',
      componentType: 'input',
      show: false,
      hidden: true,
    },
    codeRule: {
      label: '编码规则',
      value: 'codeRule',
      componentType: 'input',
      show: false,
      hidden: true,
    },
    dispname: {
      label: '科目全称',
      value: 'dispname',
      componentType: 'input',
      show: false,
      hidden: true,
    },
    accTypeName: {
      label: '科目类型',
      value: 'accTypeName',
      componentType: 'input',
      show: false,
      hidden: true,
    },
    cashClassValue: {
      label: '现金分类',
      value: 'cashClassValue',
      asValue: 'cashClass',
      componentType: 'select-model',
      code: 'accasoa_cash_class',
      show: false,
      hidden: true,
    },
    accDirectionValue: {
      label: '科目方向',
      value: 'accDirectionValue',
      asValue: 'accDirection',
      componentType: 'select-model',
      code: 'accounting_account_direction',
      show: false,
      hidden: true,
    },
    accassValue: {
      label: '辅助核算',
      value: 'accassValue',
      componentType: 'input',
      show: false,
      hidden: true,
    },
    isTailValue: {
      label: '是否末级',
      value: 'isTailValue',
      asValue: 'isTail',
      componentType: 'select-model',
      code: 'yes_or_no',
      show: false,
      hidden: true,
    },
    bothDirectionValue: {
      label: '账簿余额双向显示',
      value: 'bothDirectionValue',
      asValue: 'bothDirection',
      componentType: 'select-model',
      code: 'yes_or_no',
      show: false,
      hidden: true,
    },
    isCtrlIncurValue: {
      label: '发生额方向控制',
      value: 'isCtrlIncurValue',
      asValue: 'isCtrlIncur',
      componentType: 'select-model',
      code: 'yes_or_no',
      show: false,
      hidden: true,
    },
    isCtrlBalanceValue: {
      label: '余额方向控制',
      value: 'isCtrlBalanceValue',
      asValue: 'isCtrlBalance',
      componentType: 'select-model',
      code: 'yes_or_no',
      show: false,
      hidden: true,
    },
    isCtrlInnerValue: {
      label: '内部往来科目',
      value: 'isCtrlInnerValue',
      asValue: 'isCtrlInner',
      componentType: 'select-model',
      code: 'yes_or_no',
      show: false,
      hidden: true,
    },
    innerDimLevelName: {
      label: '内部往来维度',
      value: 'innerDimLevelName',
      asValue: 'innerDimLevel',
      componentType: 'slip-select',
      api: adjunctAccountItemList,
      query: { innerDimLevel: '1' },
      show: false,
      hidden: true,
    },
    ctrlLevelValue: {
      label: '科目控制级次',
      value: 'ctrlLevelValue',
      asValue: 'ctrlLevel',
      componentType: 'select-model',
      code: 'accasoa_ctrl_level',
      show: false,
      hidden: true,
    },
    accAttributeValue: {
      label: '科目属性',
      value: 'accAttributeValue',
      asValue: 'accAttribute',
      componentType: 'select-model',
      code: 'acctype_attribute',
      show: false,
      hidden: true,
    },
    effectiveDate: {
      label: '生效日期',
      value: 'effectiveDate',
      componentType: 'input',
      show: false,
      hidden: true,
    },
  },
};
