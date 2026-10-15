<template>
  <page-dialog
    :title="dialogInfo.title"
    v-model:visible="showDialog"
    :width="dialogInfo.width"
    :bt-list="dialogInfo.btList"
  >
    <div class="model-panel">
      <div class="model-panel-body" style="padding: 0;">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="表格查询设置" name="queryLevel">
            <el-row class="set-preference-wrap">
              <el-col :span="10">
                <el-button
                  style="margin-bottom: 8px;"
                  type="primary"
                  :disabled="!searchList1.length"
                  @click="rightMove('queryLevel')"
                  >一键右移</el-button
                >
                <div class="set-preference-item margin-right">
                  <div class="draggable-wrap-item background-color">
                    <span>未选</span>
                    <div
                      style="width: 240px"
                      class="draggable-wrap-item-right-form-width-default-title"
                    >
                      默认值
                    </div>
                  </div>
                  <draggable
                    class="draggable-wrap"
                    :list="searchList1"
                    @add="add1"
                    tag="ul"
                    item-key="value"
                    v-bind="{
                      animation: 200,
                      group: 'site',
                    }"
                  >
                    <!-- @choose="choose1" -->
                    <template #item="{ element, index }">
                      <div
                        class="draggable-wrap-item"
                        :key="element.value + index"
                        :style="{
                          height:
                            element.isPreferenceControl &&
                            element.isPreferenceShow &&
                            element.isDateSplit
                              ? '78px'
                              : '',
                        }"
                      >
                        <span>{{ element.label }}</span>
                        <div class="draggable-wrap-item-right">
                          <div style="width: 216px; margin-right: 24px">
                            <template v-if="element.slot">
                              <slot
                                :name="'preference-' + element.value"
                                :row="element"
                                :key="element.value"
                              ></slot>
                            </template>
                            <el-input
                              v-if="element.componentType === 'input'"
                              v-model="element.searchDefaultValue"
                              style="width: 100%"
                              :disabled="element.disabled || false"
                              :key="element.value"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :placeholder="getPlaceholder(element)"
                              @input="
                                (e) => (element.searchDefaultValue = validSe(e))
                              "
                            />
                            <el-input
                              v-if="element.componentType === 'textarea'"
                              style="width: 100%"
                              v-model="element.searchDefaultValue"
                              :disabled="element.disabled || false"
                              :key="element.value"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :placeholder="getPlaceholder(element)"
                              @input="
                                (e) => (element.searchDefaultValue = validSe(e))
                              "
                            />
                            <!-- 选择框 -->
                            <el-select
                              v-if="element.componentType === 'select'"
                              style="width: 100%"
                              v-model="element.searchDefaultValue"
                              :disabled="element.disabled"
                              :multiple="element.multiple"
                              :key="element.value"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :filterable="
                                element.filterable === false
                                  ? element.filterable
                                  : true
                              "
                              @visible-change="
                                visibleChange($event, element.list)
                              "
                              :placeholder="getPlaceholder(element)"
                            >
                              <el-option
                                v-for="(
                                  childItem, childIndex
                                ) in listTypeOptionsInfo[element.list]"
                                :key="childItem.key"
                                :label="
                                  childItem.key.length > 12
                                    ? childItem.key.substring(0, 12) + '...'
                                    : childItem.key
                                "
                                :value="childItem.value"
                              />
                            </el-select>
                            <slip-select
                              v-if="element.componentType === 'slip-select'"
                              v-model:modelValue="element.searchDefaultValue"
                              style="width: 100%"
                              value-key="value"
                              :key="element.value"
                              :placeholder="getPlaceholder(element)"
                              :api="element.api"
                              :query="element.query"
                              :isMaterialDrug="isMaterialDrug"
                              :default-value="element.defaultValue"
                              :divisionName="element.divisionName"
                              :key-field="element.keyField"
                              :value-field="element.valueField"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :filterable="
                                element.filterable === false
                                  ? element.filterable
                                  : true
                              "
                              :disabled="element.disabled"
                              :multiple="element.multiple"
                            />
                            <select-model
                              v-if="element.componentType === 'select-model'"
                              v-model:modelValue="element.searchDefaultValue"
                              :key="element.value"
                              :type-code="element.code"
                              :disabled="element.disabled"
                              :clear-type="true"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :check-default="
                                element.checkDefault
                                  ? element.checkDefault
                                  : false
                              "
                              :placeholder="getPlaceholder(element)"
                              :only-show-option="element.onlyShowOption"
                              :multiple="element.multiple"
                            />
                            <!-- 时间选择框 -->
                            <el-time-select
                              v-if="element.componentType === 'time'"
                              v-model="element.searchDefaultValue"
                              style="width: 100%"
                              :key="element.value"
                              :disabled-date="
                                element.TimePickerOptions &&
                                element.TimePickerOptions.disabledDate
                              "
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :disabled="element.disabled"
                              :placeholder="getPlaceholder(element)"
                            />
                            <!-- 日期选择框 -->
                            <div v-if="element.componentType === 'date'">
                              <div
                                v-if="
                                  element.isPreferenceControl &&
                                  element.isPreferenceShow &&
                                  element.isDateSplit
                                "
                              >
                                <el-date-picker
                                  v-model="element.searchDefaultValueGreater"
                                  style="width: 100%"
                                  :key="element.value"
                                  :disabled-date="
                                    element.datePickerOptions &&
                                    element.datePickerOptions.disabledDate
                                  "
                                  type="date"
                                  :clearable="
                                    element.clearable === false
                                      ? element.clearable
                                      : true
                                  "
                                  :disabled="element.disabled"
                                  format="YYYY-MM-DD"
                                  value-format="YYYY-MM-DD"
                                  :placeholder="getPlaceholder(element)"
                                />
                                <el-date-picker
                                  v-model="element.searchDefaultValueLesser"
                                  style="width: 100%; margin-top: 4px"
                                  :key="element.value"
                                  :disabled-date="
                                    element.datePickerOptions &&
                                    element.datePickerOptions.disabledDate
                                  "
                                  type="date"
                                  :clearable="
                                    element.clearable === false
                                      ? element.clearable
                                      : true
                                  "
                                  :disabled="element.disabled"
                                  format="YYYY-MM-DD"
                                  value-format="YYYY-MM-DD"
                                  :placeholder="getPlaceholder(element)"
                                />
                              </div>
                              <el-date-picker
                                v-else
                                v-model="element.searchDefaultValue"
                                style="width: 100%"
                                :key="element.value"
                                :disabled-date="
                                  element.datePickerOptions &&
                                  element.datePickerOptions.disabledDate
                                "
                                type="date"
                                :clearable="
                                  element.clearable === false
                                    ? element.clearable
                                    : true
                                "
                                :disabled="element.disabled"
                                format="YYYY-MM-DD"
                                value-format="YYYY-MM-DD"
                                :placeholder="getPlaceholder(element)"
                              />
                            </div>
                            <el-date-picker
                              v-if="element.componentType === 'daterange'"
                              v-model="timeInfo[element.value]"
                              :key="element.value"
                              style="width: 202px"
                              format="YYYY-MM-DD"
                              value-format="YYYY-MM-DD"
                              type="daterange"
                              range-separator="至"
                              :shortcuts="$fn.pickerOptionsFn()"
                              align="right"
                              :start-placeholder="element.label + '开始日期'"
                              :end-placeholder="element.label + '结束日期'"
                              @change="timeChange($event, element)"
                            ></el-date-picker>
                            <div v-if="element.componentType === 'dateTime'">
                              <div
                                v-if="
                                  element.isPreferenceControl &&
                                  element.isPreferenceShow &&
                                  element.isDateSplit
                                "
                              >
                                <el-date-picker
                                  v-model="element.searchDefaultValueGreater"
                                  :key="element.value"
                                  style="width: 100%"
                                  :disabled-date="
                                    element.datePickerOptions &&
                                    element.datePickerOptions.disabledDate
                                  "
                                  type="datetime"
                                  :clearable="
                                    element.clearable === false
                                      ? element.clearable
                                      : true
                                  "
                                  :disabled="element.disabled"
                                  format="YYYY-MM-DD HH:mm:ss"
                                  value-format="YYYY-MM-DD HH:mm:ss"
                                  :placeholder="getPlaceholder(element)"
                                />
                                <el-date-picker
                                  v-model="element.searchDefaultValueLesser"
                                  :key="element.value"
                                  style="width: 100%; margin-top: 4px"
                                  :disabled-date="
                                    element.datePickerOptions &&
                                    element.datePickerOptions.disabledDate
                                  "
                                  type="datetime"
                                  :clearable="
                                    element.clearable === false
                                      ? element.clearable
                                      : true
                                  "
                                  :disabled="element.disabled"
                                  format="YYYY-MM-DD HH:mm:ss"
                                  value-format="YYYY-MM-DD HH:mm:ss"
                                  :placeholder="getPlaceholder(element)"
                                />
                              </div>
                              <el-date-picker
                                v-else
                                v-model="element.searchDefaultValue"
                                :key="element.value"
                                style="width: 202px"
                                :disabled-date="
                                  element.datePickerOptions &&
                                  element.datePickerOptions.disabledDate
                                "
                                type="datetime"
                                :clearable="
                                  element.clearable === false
                                    ? element.clearable
                                    : true
                                "
                                :disabled="element.disabled"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                :placeholder="getPlaceholder(element)"
                              />
                            </div>
                            <el-date-picker
                              v-if="element.componentType === 'datetimerange'"
                              v-model="timeInfo[element.value]"
                              :key="element.value"
                              style="width: 202px"
                              format="YYYY-MM-DD HH:mm:ss"
                              value-format="YYYY-MM-DD HH:mm:ss"
                              type="datetimerange"
                              range-separator="至"
                              :shortcuts="$fn.pickerOptionsFn()"
                              align="right"
                              :default-time="[
                                new Date(2000, 1, 1, 0, 0, 0),
                                new Date(2000, 1, 1, 23, 59, 59),
                              ]"
                              :start-placeholder="element.label + '开始日期'"
                              :end-placeholder="element.label + '结束日期'"
                              @change="timeChange($event, element)"
                            ></el-date-picker>

                            <!-- 通用自定义 SelectData 弹窗 -->
                            <el-input
                              v-if="element.componentType === 'select-data-custom'"
                              :model-value="customSelectDisplay[element.value] || ''"
                              class="not-mongolia"
                              :key="element.value"
                              type="input"
                              :required="true"
                              :disabled="true"
                              :placeholder="'请选择' + element.label"
                            >
                              <template #append>
                                <el-icon @click="openSelectCustom(element, '1')"
                                  ><Search
                                /></el-icon>
                              </template>
                            </el-input>
                            <span>{{ noInput(element) }}</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </draggable>
                </div>
              </el-col>
              <el-col :span="14">
                <el-button
                  style="margin-bottom: 8px;"
                  type="primary"
                  :disabled="!searchList2.length"
                  @click="leftMove('queryLevel')"
                  >一键左移</el-button
                >
                <div class="set-preference-item">
                  <div class="draggable-wrap-item background-color">
                    <span>已选</span>
                    <div class="draggable-wrap-item-right">
                      <div
                        class="draggable-wrap-item-right-form-width-default-title"
                      >
                        默认值
                      </div>
                      <span class="slip-edit">操作</span>
                    </div>
                  </div>
                  <draggable
                    class="draggable-wrap"
                    v-model="searchList2"
                    @add="add2"
                    @update="datadragSearchEnd2"
                    tag="ul"
                    item-key="value"
                    v-bind="{
                      animation: 200,
                      group: 'site',
                    }"
                  >
                    <!-- @choose="choose2" -->
                    <template #item="{ element, index }">
                      <div
                        class="draggable-wrap-item"
                        :key="element.value + index"
                        :style="{
                          height:
                            element.isPreferenceControl &&
                            element.isPreferenceShow &&
                            element.isDateSplit
                              ? '78px'
                              : '',
                        }"
                      >
                        <span> {{ element.label }}</span>
                        <div class="draggable-wrap-item-right">
                          <div style="width: 216px; margin-right: 24px">
                            <template v-if="element.slot">
                              <slot
                                :name="'preference-' + element.value"
                                :row="element"
                                :key="element.value"
                              ></slot>
                            </template>
                            <el-input
                              v-if="element.componentType === 'input'"
                              v-model="element.searchDefaultValue"
                              style="width: 100%"
                              :disabled="element.disabled || false"
                              :key="element.value"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :placeholder="getPlaceholder(element)"
                              @input="
                                (e) => (element.searchDefaultValue = validSe(e))
                              "
                            />
                            <el-input
                              v-if="element.componentType === 'textarea'"
                              style="width: 100%"
                              v-model="element.searchDefaultValue"
                              :disabled="element.disabled || false"
                              :key="element.value"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :placeholder="getPlaceholder(element)"
                              @input="
                                (e) => (element.searchDefaultValue = validSe(e))
                              "
                            />
                            <!-- 选择框 -->
                            <el-select
                              v-if="element.componentType === 'select'"
                              style="width: 100%"
                              v-model="element.searchDefaultValue"
                              :disabled="element.disabled"
                              :multiple="element.multiple"
                              :key="element.value"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :filterable="
                                element.filterable === false
                                  ? element.filterable
                                  : true
                              "
                              @visible-change="
                                visibleChange($event, element.list)
                              "
                              :placeholder="getPlaceholder(element)"
                            >
                              <el-option
                                v-for="(
                                  childItem, childIndex
                                ) in listTypeOptionsInfo[element.list]"
                                :key="childItem.key"
                                :label="
                                  childItem.key.length > 12
                                    ? childItem.key.substring(0, 12) + '...'
                                    : childItem.key
                                "
                                :value="childItem.value"
                              />
                            </el-select>
                            <slip-select
                              v-if="element.componentType === 'slip-select'"
                              v-model:modelValue="element.searchDefaultValue"
                              style="width: 100%"
                              value-key="value"
                              :key="element.value"
                              :placeholder="getPlaceholder(element)"
                              :api="element.api"
                              :query="element.query"
                              :default-value="element.defaultValue"
                              :key-field="element.keyField"
                              :isMaterialDrug="isMaterialDrug"
                              :value-field="element.valueField"
                              :divisionName="element.divisionName"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :filterable="
                                element.filterable === false
                                  ? element.filterable
                                  : true
                              "
                              :disabled="element.disabled"
                              :multiple="element.multiple"
                            />
                            <select-model
                              v-if="element.componentType === 'select-model'"
                              v-model:modelValue="element.searchDefaultValue"
                              :key="element.value"
                              :type-code="element.code"
                              :disabled="element.disabled"
                              :clear-type="true"
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :check-default="
                                element.checkDefault
                                  ? element.checkDefault
                                  : false
                              "
                              :placeholder="getPlaceholder(element)"
                              :only-show-option="element.onlyShowOption"
                              :multiple="element.multiple"
                            />
                            <!-- 时间选择框 -->
                            <el-time-select
                              v-if="element.componentType === 'time'"
                              v-model="element.searchDefaultValue"
                              style="width: 100%"
                              :key="element.value"
                              :disabled-date="
                                element.TimePickerOptions &&
                                element.TimePickerOptions.disabledDate
                              "
                              :clearable="
                                element.clearable === false
                                  ? element.clearable
                                  : true
                              "
                              :disabled="element.disabled"
                              :placeholder="getPlaceholder(element)"
                            />
                            <!-- 日期选择框 -->
                            <div v-if="element.componentType === 'date'">
                              <div
                                v-if="
                                  element.isPreferenceControl &&
                                  element.isPreferenceShow &&
                                  element.isDateSplit
                                "
                              >
                                <el-date-picker
                                  v-model="element.searchDefaultValueGreater"
                                  style="width: 100%"
                                  :key="element.value"
                                  :disabled-date="
                                    element.datePickerOptions &&
                                    element.datePickerOptions.disabledDate
                                  "
                                  type="date"
                                  :clearable="
                                    element.clearable === false
                                      ? element.clearable
                                      : true
                                  "
                                  :disabled="element.disabled"
                                  format="YYYY-MM-DD"
                                  value-format="YYYY-MM-DD"
                                  :placeholder="getPlaceholder(element)"
                                />
                                <el-date-picker
                                  v-model="element.searchDefaultValueLesser"
                                  style="width: 100%; margin-top: 4px"
                                  :key="element.value"
                                  :disabled-date="
                                    element.datePickerOptions &&
                                    element.datePickerOptions.disabledDate
                                  "
                                  type="date"
                                  :clearable="
                                    element.clearable === false
                                      ? element.clearable
                                      : true
                                  "
                                  :disabled="element.disabled"
                                  format="YYYY-MM-DD"
                                  value-format="YYYY-MM-DD"
                                  :placeholder="getPlaceholder(element)"
                                />
                              </div>
                              <el-date-picker
                                v-else
                                v-model="element.searchDefaultValue"
                                style="width: 100%"
                                :key="element.value"
                                :disabled-date="
                                  element.datePickerOptions &&
                                  element.datePickerOptions.disabledDate
                                "
                                type="date"
                                :clearable="
                                  element.clearable === false
                                    ? element.clearable
                                    : true
                                "
                                :disabled="element.disabled"
                                format="YYYY-MM-DD"
                                value-format="YYYY-MM-DD"
                                :placeholder="getPlaceholder(element)"
                              />
                            </div>
                            <el-date-picker
                              v-if="element.componentType === 'daterange'"
                              v-model="element.searchDefaultValue"
                              :key="element.value"
                              style="width: 202px"
                              format="YYYY-MM-DD"
                              value-format="YYYY-MM-DD"
                              type="daterange"
                              range-separator="至"
                              :shortcuts="$fn.pickerOptionsFn()"
                              align="right"
                              :start-placeholder="element.label + '开始日期'"
                              :end-placeholder="element.label + '结束日期'"
                              @change="timeChange($event, element)"
                            ></el-date-picker>
                            <div v-if="element.componentType === 'dateTime'">
                              <div
                                v-if="
                                  element.isPreferenceControl &&
                                  element.isPreferenceShow &&
                                  element.isDateSplit
                                "
                              >
                                <el-date-picker
                                  v-model="element.searchDefaultValueGreater"
                                  :key="element.value"
                                  style="width: 100%"
                                  :disabled-date="
                                    element.datePickerOptions &&
                                    element.datePickerOptions.disabledDate
                                  "
                                  type="datetime"
                                  :clearable="
                                    element.clearable === false
                                      ? element.clearable
                                      : true
                                  "
                                  :disabled="element.disabled"
                                  format="YYYY-MM-DD HH:mm:ss"
                                  value-format="YYYY-MM-DD HH:mm:ss"
                                  :placeholder="getPlaceholder(element)"
                                />
                                <el-date-picker
                                  v-model="element.searchDefaultValueLesser"
                                  :key="element.value"
                                  style="width: 100%; margin-top: 4px"
                                  :disabled-date="
                                    element.datePickerOptions &&
                                    element.datePickerOptions.disabledDate
                                  "
                                  type="datetime"
                                  :clearable="
                                    element.clearable === false
                                      ? element.clearable
                                      : true
                                  "
                                  :disabled="element.disabled"
                                  format="YYYY-MM-DD HH:mm:ss"
                                  value-format="YYYY-MM-DD HH:mm:ss"
                                  :placeholder="getPlaceholder(element)"
                                />
                              </div>
                              <el-date-picker
                                v-else
                                v-model="element.searchDefaultValue"
                                :key="element.value"
                                style="width: 100%; margin-top: 4px"
                                :disabled-date="
                                  element.datePickerOptions &&
                                  element.datePickerOptions.disabledDate
                                "
                                type="datetime"
                                :clearable="
                                  element.clearable === false
                                    ? element.clearable
                                    : true
                                "
                                :disabled="element.disabled"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                :placeholder="getPlaceholder(element)"
                              />
                            </div>
                            <el-date-picker
                              v-if="element.componentType === 'datetimerange'"
                              v-model="timeInfo[element.value]"
                              :key="element.value"
                              style="width: 202px"
                              format="YYYY-MM-DD HH:mm:ss"
                              value-format="YYYY-MM-DD HH:mm:ss"
                              type="datetimerange"
                              range-separator="至"
                              :shortcuts="$fn.pickerOptionsFn()"
                              align="right"
                              :default-time="[
                                new Date(2000, 1, 1, 0, 0, 0),
                                new Date(2000, 1, 1, 23, 59, 59),
                              ]"
                              :start-placeholder="element.label + '开始日期'"
                              :end-placeholder="element.label + '结束日期'"
                              @change="timeChange($event, element)"
                            ></el-date-picker>
                            <!-- 通用自定义 SelectData 弹窗 -->
                            <el-input
                              v-if="element.componentType === 'select-data-custom'"
                              :model-value="customSelectDisplay[element.value] || ''"
                              class="not-mongolia"
                              :key="element.value"
                              type="input"
                              :required="true"
                              :disabled="true"
                              :placeholder="'请选择' + element.label"
                            >
                              <template #append>
                                <el-icon @click="openSelectCustom(element, '2')"
                                  ><Search
                                /></el-icon>
                              </template>
                            </el-input>
                            <span>{{ noInput(element) }}</span>
                          </div>

                          <span
                            class="slip-edit"
                            @click="setTop(element, searchList2, 'queryLevel')"
                          >
                            {{ index ? '置顶' : '' }}
                          </span>
                        </div>
                      </div>
                    </template>
                  </draggable>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane
            label="表格显示设置"
            v-if="showLevelShow"
            name="showLevel"
          >
            <el-row class="set-preference-wrap">
              <el-col :span="6">
                <el-button
                  style="margin-bottom: 8px;"
                  type="primary"
                  :disabled="!fieldList1.length"
                  @click="rightMove('showLevel')"
                  >一键右移</el-button
                >
                <div class="set-preference-item margin-right">
                  <div class="draggable-wrap-item background-color">未选</div>
                  <draggable
                    class="draggable-wrap"
                    v-model="fieldList1"
                    tag="ul"
                    v-bind="{
                      animation: 200,
                      group: 'fieldSite',
                    }"
                    item-key="value"
                    @add="fieldAddshow1"
                  >
                    <template #item="{ element, index }">
                      <div
                        class="draggable-wrap-item"
                        :key="element.value + index"
                      >
                        {{ element.label }}
                      </div>
                    </template>
                  </draggable>
                </div>
              </el-col>
              <el-col :span="18">
                <el-button
                  style="margin-bottom: 8px;"
                  type="primary"
                  :disabled="!fieldList2.length"
                  @click="leftMove('showLevel')"
                  >一键左移</el-button
                >
                <div class="set-preference-item">
                  <div class="draggable-wrap-item background-color">
                    <span>已选</span>
                    <div class="draggable-wrap-item-right">
                      <div class="draggable-wrap-item-right-form-width-title">
                        单元格宽度
                      </div>
                      <span class="slip-edit">操作</span>
                    </div>
                  </div>
                  <draggable
                    class="draggable-wrap"
                    v-model="fieldList2"
                    tag="ul"
                    v-bind="{
                      animation: 200,
                      group: 'fieldSite',
                    }"
                    item-key="value"
                    @add="fieldAddshow2"
                    @update="datadragFieldEnd2"
                  >
                    <template #item="{ element, index }">
                      <div
                        class="draggable-wrap-item"
                        :key="element.value + index"
                      >
                        <span> {{ element.label }}</span>
                        <div class="draggable-wrap-item-right">
                          <el-input-number
                            style="width: 100px; margin-right: 24px"
                            clearable
                            controls-position="right"
                            v-model="element.minWidth"
                            :min="0"
                          ></el-input-number>
                          <span
                            class="slip-edit"
                            @click="setTop(element, fieldList2, 'showLevel')"
                          >
                            {{ index ? '置顶' : '' }}
                          </span>
                        </div>
                      </div>
                    </template>
                  </draggable>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane
            label="表格分组设置"
            v-if="groupLevelShow"
            name="groupLevel"
          >
            <el-row class="set-preference-wrap">
              <el-col :span="6">
                <el-button
                  style="margin-bottom: 8px;"
                  type="primary"
                  :disabled="!fieldList1.length"
                  @click="rightMove('groupLevel')"
                  >一键右移</el-button
                >
                <div class="set-preference-item margin-right">
                  <div class="draggable-wrap-item background-color">未选</div>
                  <draggable
                    class="draggable-wrap"
                    v-model="fieldList1"
                    tag="ul"
                    v-bind="{
                      animation: 200,
                      group: 'fieldSite',
                    }"
                    item-key="value"
                    @add="fieldAddGroup1"
                  >
                    <template #item="{ element, index }">
                      <div
                        class="draggable-wrap-item"
                        :key="element.value + index"
                      >
                        {{ element.label }}
                      </div>
                    </template>
                  </draggable>
                </div>
              </el-col>
              <el-col :span="18">
                <el-button
                  style="margin-bottom: 8px;"
                  type="primary"
                  :disabled="!fieldList2.length"
                  @click="leftMove('groupLevel')"
                  >一键左移</el-button
                >
                <div class="set-preference-item">
                  <div class="draggable-wrap-item background-color">
                    <span>已选</span>
                    <span class="slip-edit">操作</span>
                  </div>
                  <draggable
                    class="draggable-wrap"
                    v-model="fieldList2"
                    tag="ul"
                    v-bind="{
                      animation: 200,
                      group: 'fieldSite',
                    }"
                    item-key="value"
                    @add="fieldAddGroup2"
                    @update="datadragFieldEnd3"
                  >
                    <template #item="{ element, index }">
                      <span> {{ element.label }}</span>
                      <span
                        class="slip-edit"
                        @click="setTop(element, fieldList2, 'groupLevel')"
                      >
                        {{ index ? '置顶' : '' }}
                      </span>
                    </template>
                  </draggable>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane name="sortLevel" v-if="sortLevelShow">
            <template #label>
              <div style="display: flex; align-items: center;">
                <span class="margin-right">表格排序设置</span>
                <select-model
                  v-if="activeName === 'sortLevel'"
                  v-model="newCustomizeUserVO.head.sortType"
                  type-code="sort_type"
                  :clearable="false"
                  :check-default="true"
                  width="100px"
                  placeholder="请选择排序方式"
                />
              </div>
            </template>
            <el-row class="set-preference-wrap">
              <el-col :span="6">
                <!-- 隐藏排序一键右移按钮 -->
                <el-button
                  style="margin-bottom: 8px;visibility: hidden;"
                  type="primary"

                  :disabled="!fieldList1.length"
                  @click="rightMove('sortLevel')"
                  >一键右移</el-button
                >
                <div class="set-preference-item margin-right">
                  <div class="draggable-wrap-item background-color">未选</div>
                  <draggable
                    class="draggable-wrap"
                    v-model="fieldList1"
                    tag="ul"
                    v-bind="{
                      animation: 200,
                      group: 'fieldSite',
                    }"
                    item-key="value"
                    @add="fieldAddSort1"
                  >
                    <template #item="{ element, index }">
                      <div
                        class="draggable-wrap-item"
                        :key="element.value + index"
                      >
                        {{ element.label }}
                      </div>
                    </template>
                  </draggable>
                </div>
              </el-col>
              <el-col :span="18">
                <el-button
                  style="margin-bottom: 8px;"
                  type="primary"
                  :disabled="!fieldList2.length"
                  @click="leftMove('sortLevel')"
                  >一键左移</el-button
                >
                <div class="set-preference-item">
                  <div class="draggable-wrap-item background-color">
                    <span>已选</span>
                    <span class="slip-edit">操作</span>
                  </div>
                  <draggable
                    class="draggable-wrap"
                    v-model="fieldList2"
                    tag="ul"
                    v-bind="{
                      animation: 200,
                      group: 'fieldSite',
                    }"
                    item-key="value"
                    @add="fieldAddSort2"
                    @update="datadragFieldEnd4"
                  >
                    <template #item="{ element, index }">
                      <div class="draggable-wrap-item" :key="index">
                        <span>{{ element.label }}</span>
                        <span
                          class="slip-edit"
                          @click="changeSort(element.sortControllerType, index)"
                        >
                          {{
                            element.sortControllerType === 1
                              ? '升序'
                              : element.sortControllerType === 2
                              ? '降序'
                              : ''
                          }}
                        </span>
                      </div>
                    </template>
                  </draggable>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </page-dialog>
  <SelectData ref="selectorRef" />
</template>
<script setup name="SetPreference">
import draggable from 'vuedraggable'
const SelectModel = defineComponent(() =>  import('@/components/SelectModel/index'))
const SlipSelect = defineComponent(() =>  import('@/components/SlipSelect/index'))
import { defineComponent } from 'vue'
import { useSelectData } from '@/hooks/useSelectData'
const { proxy } = getCurrentInstance()
const emits = defineEmits()
//偏好设置
const PageDialog = defineAsyncComponent(() =>
  import('@/components/PageDialog/index')
)
const props = defineProps({
  visible: {
    type: Boolean,
  },
  searchList: {
    type: Array,
    default: function () {
      return []
    },
  },
  fieldList: {
    type: Array,
    default: function () {
      return []
    },
  },
  customizeUserVO: {
    type: Object,
    default: function () {
      return {}
    },
  },
  groupLevelShow: {
    type: Boolean,
    default: false,
  },
  showLevelShow: {
    type: Boolean,
    default: true,
  },
  sortLevelShow: {
    type: Boolean,
    default: true,
  },
  listTypeInfo: {
    type: Object,
    default: () => {
      return {}
    },
  },
  isMaterialDrug: {
    //是否同时支持物资和药品
    type: Boolean,
    default: false,
  },
})
const activeName = ref('queryLevel')
const dialogInfo = ref({
  title: '偏好设置',
  width: '1200px',
  btLoading: false,
  btList: [
    {
      label: '确定',
      type: 'primary',
      disabled: false,
      event: save,
      show: true,
    },
    { label: '取消', event: handleClose, show: true },
  ],
})
const searchList1 = ref([])
const searchList2 = ref([])
const fieldList1 = ref([])
const fieldList2 = ref([])
const newFieldList = ref([])
const newCustomizeUserVO = ref({})

const listTypeOptionsInfo = ref({})
const copyListTypeInfo = ref({})
const list = ref('')
const timeInfo = ref({})
const { selectorInfo, selectorRef } = useSelectData()
const customSelectDisplay = ref({}) // 已选项的显示名称
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件shows
  },
})
const noInput = computed(() => (data) => {
  if (
    !data.slot &&
    (data.componentType === 'price' || data.componentType === 'number')
  ) {
    return '无'
  }
  return ''
})
watch(
  () => props.listTypeInfo,
  (val) => {
    listTypeOptionsInfo.value = proxy.$fn.deepClone(val)
    copyListTypeInfo.value = proxy.$fn.deepClone(listTypeOptionsInfo.value)
  },
  {
    immediate: true,
    deep: true,
  }
)
watch(
  () => props.searchList,
  (val) => {
    props.searchList.forEach((item) => {
      if (
        item.componentType === 'daterange' ||
        item.componentType === 'datetimerange'
      ) {
        if (
          item.searchDefaultValue &&
          !proxy.$fn.isEmptyString(item.searchDefaultValue)
        ) {
          proxy.$nextTick(() => {
            let arr = proxy.$fn.splitArr(item.searchDefaultValue)
            let str = item.asValue ? item.asValue : item.value
            timeInfo.value[str] = Array.from(arr)
          })
        }
      }
    })
  },
  {
    deep: true,
    immediate: true,
  }
)
setData()
function setData() {
  newCustomizeUserVO.value = JSON.parse(JSON.stringify(props.customizeUserVO))
  let arr1 = proxy.$fn.deepClone(props.searchList)
  newFieldList.value = proxy.$fn.deepClone(props.fieldList)
  if (arr1.length) {
    searchList1.value = arr1.filter((item) => {
      if (item.searchLevel === 0) {
        if (item.isPreferenceControl) {
          return item.isPreferenceShow
        }
        return item
      }
    })
    searchList2.value = arr1.filter((item) => {
      if (item.searchLevel > 0) {
        if (item.isPreferenceControl) {
          return item.isPreferenceShow
        }
        return item
      }
    })
  }
}
function setTop(row, arr, str) {
  //置顶
  arr = arr.filter((item) => item !== row)
  switch (str) {
    case 'queryLevel':
      arr.unshift(row)
      arr.forEach((item, index) => {
        item.searchLevel = index + 1
      })
      searchList2.value = arr
      break
    case 'showLevel':
      arr.unshift(row)
      arr.forEach((item, index) => {
        item.showLevel = index + 1
      })
      fieldList2.value = arr
      break
    case 'groupLevel':
      arr.unshift(row)
      arr.forEach((item, index) => {
        item.groupLevel = index + 1
      })
      fieldList2.value = arr
      break
  }
}
function rightMove(str) {
  //右移
  switch (str) {
    case 'queryLevel':
      searchList2.value = searchList2.value.concat(searchList1.value)
      searchList2.value.forEach((item, index) => {
        item.show = true
        item.searchLevel = index + 1
      })
      searchList1.value = []
      break
    case 'showLevel':
      fieldList2.value = fieldList2.value.concat(fieldList1.value)
      fieldList2.value.forEach((item, index) => {
        item.hidden = false
        item.showLevel = index + 1
      })
      fieldList1.value = []
      break
    case 'groupLevel':
      fieldList2.value = fieldList2.value.concat(fieldList1.value)
      fieldList2.value.forEach((item, index) => {
        item.groupLevel = index + 1
      })
      fieldList1.value = []
      break
    case 'sortLevel':
      fieldList2.value = fieldList2.value.concat(fieldList1.value)
      fieldList2.value.forEach((item, index) => {
        item.sortable = true
        item.sortControllerType = 1
        item.sortLevel = index + 1
      })
      fieldList1.value = []
      break
  }
}
function leftMove(str) {
  //左移
  switch (str) {
    case 'queryLevel':
      searchList1.value = searchList1.value.concat(searchList2.value)
      searchList1.value.forEach((item) => {
        item.show = false
        item.searchLevel = 0
      })
      searchList2.value = []
      break
    case 'showLevel':
      fieldList1.value = fieldList1.value.concat(fieldList2.value)
      fieldList1.value.forEach((item) => {
        item.hidden = true
        item.showLevel = 0
      })
      fieldList2.value = []
      break
    case 'groupLevel':
      fieldList1.value = fieldList1.value.concat(fieldList2.value)
      fieldList1.value.forEach((item) => {
        item.groupLevel = 0
      })
      fieldList2.value = []
      break
    case 'sortLevel':
      fieldList1.value = fieldList1.value.concat(fieldList2.value)
      fieldList1.value.forEach((item) => {
        item.sortable = false
        item.sortControllerType = 0
        item.sortLevel = 0
      })
      fieldList2.value = []
      break
  }
}
function handleClose() {
  showDialog.value = false
}
function save() {
  proxy.$nextTick(() => {
    let customizeUserVO = newCustomizeUserVO.value
    let _searchList2 = proxy.$fn.deepClone(searchList2.value)
    let _searchList1 = proxy.$fn.deepClone(searchList1.value)
    let searchList = _searchList2.concat(_searchList1)
    let fieldList = newFieldList.value
    searchList.forEach((item) => {
      if (item.value === 'price' && item.searchDefaultValue) {
        let val = item.searchDefaultValue.split(',')
        if (
          !(
            val &&
            val.length == 2 &&
            !val.includes('null') &&
            !val.includes('undefined') &&
            !val.includes('')
          )
        ) {
          proxy.$message({
            message: '请填写正确的价格区间',
            type: 'warning',
            duration: 3500,
            showClose: true,
          })
          throw new Error('请填写正确的价格区间')
        }
      }
      if (
        item.isPreferenceControl &&
        item.isPreferenceShow &&
        item.isDateSplit
      ) {
        if (item.searchDefaultValueGreater || item.searchDefaultValueLesser) {
          item.searchDefaultValue =
            (item.searchDefaultValueGreater || '') +
            ',' +
            (item.searchDefaultValueLesser || '')
        } else {
          item.searchDefaultValue = ''
        }
        if (item.searchDefaultValueGreater && item.searchDefaultValueLesser) {
          const startTimestamp = new Date(item.searchDefaultValueGreater).getTime();
          const endTimestamp = new Date(item.searchDefaultValueLesser).getTime();
          // 检查日期是否有效，以及结束时间是否早于开始时间
          if (isNaN(startTimestamp) || isNaN(endTimestamp) || endTimestamp < startTimestamp) {
            proxy.$message({
              message: '填写的结束时间或日期不能早于开始时间或日期',
              type: 'warning',
              duration: 3500,
              showClose: true,
            });
            throw new Error('填写的结束时间或日期不能早于开始时间或日期');
          }
        }
      }
      let type = Object.prototype.toString.call(item.searchDefaultValue)
      if (type === '[object Object]') {
        item.searchDefaultValue = JSON.stringify(item.searchDefaultValue)
      }
      if (Object.keys(customizeUserVO.detail).includes(item.value)) {
        customizeUserVO.detail[item.value].searchLevel = item.searchLevel
        customizeUserVO.detail[item.value].searchDefaultValue =
          item.searchDefaultValue
      }
    })
    fieldList.forEach((item) => {
      if (Object.keys(customizeUserVO.detail).includes(item.value)) {
        customizeUserVO.detail[item.value].showLevel = item.showLevel
        customizeUserVO.detail[item.value].sortControllerType =
          item.sortControllerType
        customizeUserVO.detail[item.value].sortLevel = item.sortLevel
        customizeUserVO.detail[item.value].formWidth = item.minWidth
      }
    })
    emits('callback', {
      searchList: searchList,
      fieldList: fieldList,
      customizeUserVO: customizeUserVO,
    })
    handleClose()
  })
}
function compare(property) {
  return function (a, b) {
    return a[property] - b[property]
  }
}
function handleClick() {
  proxy.$nextTick(() => {
    let fieldList = newFieldList.value
    if (activeName.value === 'showLevel') {
      fieldList1.value = fieldList.filter((item) => item.showLevel === 0)
      fieldList.sort(compare('showLevel'))
      fieldList2.value = fieldList.filter((item) => item.showLevel > 0)
    } else if (activeName.value === 'sortLevel') {
      fieldList.sort(compare('showLevel'))
      fieldList1.value = fieldList.filter(
        (item) => item.sortControllerType === 0 && item.showLevel > 0
      )
      fieldList2.value = fieldList.filter(
        (item) => item.sortControllerType > 0 && item.showLevel > 0
      )
    } else if (activeName.value === 'groupLevel') {
      fieldList1.value = fieldList.filter(
        (item) => item.groupLevel === 0 && item.showLevel > 0
      )
      fieldList2.value = fieldList.filter(
        (item) => item.groupLevel > 0 && item.showLevel > 0
      )
    }
  })
}
function changeSort(num, index) {
  if (num === 1) {
    fieldList2.value[index].sortControllerType = 2
  } else if (num === 2) {
    fieldList2.value[index].sortControllerType = 1
  }
}
//查询
function add1(e) {
  searchList1.value.forEach((item) => {
    item.show = false
    item.searchLevel = 0
  })
}
function add2(e) {
  searchList2.value.forEach((item, index) => {
    item.show = true
    item.searchLevel = index + 1
  })
}
function datadragSearchEnd2() {
  searchList2.value.forEach((item, index) => {
    item.searchLevel = index + 1
  })
}
//显示
function fieldAddshow1() {
  fieldList1.value.forEach((item) => {
    item.hidden = true
    item.showLevel = 0
  })
}
function fieldAddshow2() {
  fieldList2.value.forEach((item, index) => {
    item.hidden = false
    item.showLevel = index + 1
  })
}
function datadragFieldEnd2() {
  fieldList2.value.forEach((item, index) => {
    item.showLevel = index + 1
  })
}
//分组
function fieldAddGroup1() {
  fieldList1.value.forEach((item) => {
    item.groupLevel = 0
  })
}
function fieldAddGroup2() {
  fieldList2.value.forEach((item, index) => {
    item.groupLevel = index + 1
  })
}
function datadragFieldEnd3() {
  fieldList2.value.forEach((item, index) => {
    item.groupLevel = index + 1
  })
}
//排序
function fieldAddSort1(e) {
  fieldList1.value.forEach((item) => {
    item.sortable = false
    item.sortControllerType = 0
    item.sortLevel = 0
  })
}
function fieldAddSort2(e) {
  let newIndex = e.newIndex;
  let oldIndex = e.oldIndex;
  // 最多只允许5个排序字段
  if (fieldList2.value.length === 6) {
    fieldList2.value.splice(newIndex, 1); //清除多余右移字段
    fieldList1.value.splice(oldIndex, 0, e.item._underlying_vm_); //复原多余右移字段
    proxy.$message.error({
      message: "排序字段不能超过5个",
      showClose: true,
      duration: 3500,
    });
    return;
  }
  fieldList2.value.forEach((item, index) => {
    item.sortable = true
    item.sortControllerType = newIndex === index ? 1 : item.sortControllerType
    item.sortLevel = index + 1
  })
}
function datadragFieldEnd4(e) {
  fieldList2.value.forEach((item, index) => {
    item.sortLevel = index + 1
  })
}
function choose1(evt) {
  // const ITEM_HEIGHT = 153;
  const ITEM_HEIGHT = evt.item.offsetHeight
  let container = evt.path[1]
  let index = evt.oldIndex

  if (index * ITEM_HEIGHT < container.scrollTop) {
    container.scrollTo({
      top: index * ITEM_HEIGHT,
    })
  } else if (
    (index + 1) * ITEM_HEIGHT >
    container.scrollTop + container.offsetHeight
  ) {
    container.scrollTo({
      top: (index + 1) * ITEM_HEIGHT - container.offsetHeight,
    })
  }
}
function choose2(evt) {
  // const ITEM_HEIGHT = 153;
  const ITEM_HEIGHT = evt.item.offsetHeight
  let container = evt.path[1]
  let index = evt.oldIndex

  if (index * ITEM_HEIGHT < container.scrollTop) {
    container.scrollTo({
      top: index * ITEM_HEIGHT,
    })
  } else if (
    (index + 1) * ITEM_HEIGHT >
    container.scrollTop + container.offsetHeight
  ) {
    container.scrollTo({
      top: (index + 1) * ITEM_HEIGHT - container.offsetHeight,
    })
  }
}
// 得到placeholder的显示
function getPlaceholder(row) {
  let placeholder = ''
  if (row.componentType === 'input' || row.componentType === 'textarea') {
    placeholder = '请输入' + row.label
  } else if (
    row.componentType === 'select' ||
    row.componentType === 'time' ||
    row.componentType === 'date' ||
    row.componentType === 'dateTime' ||
    row.componentType === 'select-model' ||
    row.componentType === 'slip-select'
  ) {
    placeholder = '请选择' + row.label
  } else {
    placeholder = row.label
  }
  return placeholder
}
function visibleChange(val, _list) {
  //下拉框出现/隐藏时触发
  list.value = _list
  if (!val) {
    listTypeOptionsInfo.value[_list] = copyListTypeInfo.value[_list]
  }
}
function timeChange(val, elemnt) {
  if (val && val.length) {
    elemnt.searchDefaultValue = val[0] + ',' + val[1]
  } else {
    elemnt.searchDefaultValue = null
  }
}
echoFun()
function echoFun() {
  let searchList = proxy.$fn.deepClone(props.searchList)
  if (searchList.length) {
    searchList.forEach((item) => {
      // 处理 searchDefaultValue
    })
  }
}
// 打开自定义 SelectData 弹窗（偏好设置通用版）
function openSelectCustom(item, listType) {
  const valueField = item.valueField || 'id'
  const labelField = item.labelField || 'name'

  // 从 searchList 查找当前已选值用于回显
  const currentItem = listType === '1'
    ? searchList1.value.find(i => i.value === item.value)
    : searchList2.value.find(i => i.value === item.value)
  const currentDefault = currentItem?.searchDefaultValue
  const ids = currentDefault?.key?.length ? currentDefault.key : []

  selectorInfo.type = item.selectDataType || 'user'
  selectorInfo.query = item.query || {}
  if (ids.length) {
    selectorInfo.defaultSelected = ids.length === 1 ? ids[0] : ids
  }
  selectorInfo.callback = (row) => {
    const searchListItem = listType === '1'
      ? searchList1.value.find(i => i.value === item.value)
      : searchList2.value.find(i => i.value === item.value)

    const rows = Array.isArray(row) ? row : (row && typeof row === 'object' && Object.keys(row).length !== 0 ? [row] : [])
    if (rows.length) {
      const idArr = rows.map(r => r[valueField])
      const nameStr = rows.map(r => r[labelField]).join(',')
      customSelectDisplay.value[item.value] = nameStr
      if (searchListItem) {
        searchListItem.searchDefaultValue = { key: idArr, value: nameStr }
      }
    } else {
      customSelectDisplay.value[item.value] = ''
      if (searchListItem) {
        searchListItem.searchDefaultValue = ''
      }
    }
  }
  selectorInfo.visible = true
}
</script>
<style scoped lang="scss">
.set-preference-wrap {
  box-sizing: border-box;
  .set-preference-item {
    border: 1px solid #dae2ea;
    height: 300px;
    overflow: hidden;
    overflow-y: scroll;
  }
}
.draggable-wrap {
  height: 100%;
  .draggable-wrap-group {
    height: 100%;
    width: 100%;
    display: inline-block;
  }
}
.draggable-wrap-item {
  height: 36px;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #dae2ea;
  padding: 0 5px;
  box-sizing: border-box;
  color: #606266;
  .draggable-wrap-item-right {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .draggable-wrap-item-right-form-width {
      margin-right: 24px;
    }
    .draggable-wrap-item-right-form-width-title {
      width: 100px;
      margin-right: 24px;
      text-align: center;
    }
    .draggable-wrap-item-right-form-width-default-title {
      width: 216px;
      margin-right: 24px;
      text-align: center;
    }
  }
}
.background-color {
  background: #fff;
  border-top: 0;
  color: #333;
  font-weight: 600;
}
.margin-right {
  margin-right: 24px;
}
.slip-edit {
  display: inline-block;
  width: 40px;
}
</style>
