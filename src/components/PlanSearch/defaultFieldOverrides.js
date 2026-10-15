/**
 * PlanSearch 公共字段覆盖配置
 *
 * 以 fieldName 为 key，value 为需要覆盖的字段属性。
 * 优先级：组件 prop fieldOverrides > 此公共 JSON > 后端接口返回
 *
 * 使用示例：
 *   // 添加"科目类型"字段的接口和传参等
 *   voucherStatus: { 
 *     slipProps: {
         api: adjunctAccountItemList,
         query: { innerDimLevel: "1" },
         keyField: "name",
         valueField: "id",
       }
    }
 */
import { adjunctAccountItemList } from "@/api/base";
export const defaultFieldOverrides = {
   innerDimLevel: {
    slipProps: {
      api: adjunctAccountItemList,
      query: { innerDimLevel: '1' },
      keyField: "name",
      valueField: "id",
    },
  },
};
