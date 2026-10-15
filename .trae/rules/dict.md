---
alwaysApply: true
---

## 规则说明
- 这是生成页面统一设置字典的规则。

## 规则内容
- 当页面生成 fieldList 集合时，如果type 为 'select-model'，则必须包含 code 属性。
- label为启用状态时，code 为 'enabled_type'
- label为收支类型时，code 为 'income_expense_type'
- label为结算状态时，code 为 'funds_settle_status'
- label为单据状态时，code 为 'funds_order_status'
- label包含是否字样时，code 为 'yes_or_no'
- label为银行性质时，code 为 'account_type'
- label包含方向时，code 为 'accounting_account_direction'






