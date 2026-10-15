import { useSessionStorage } from '@vueuse/core'
import { reactive, watch, getCurrentInstance } from 'vue'

/**
 * 将字典数据转换为选项数据
 * @param option
 */
const dictionaryToOption = (option) => {
  return {
    id: option.id,
    label: option.name,
    key: option.name,
    value: option.id,
    code: option.code,
  }
}

/**
 * 使用字典
 */
const useDictionary = () => {
  // 字典缓存代理
  const dictionarySession = useSessionStorage('dictionary', null, {
    serializer: {
      read: (v) => (v ? JSON.parse(v) : []),
      write: (v) => JSON.stringify(v),
    },
  })
  const { proxy } = getCurrentInstance()
  const dictionary = reactive({})
  // 检测缓存变更，实时更新字典信息
  watch(
    dictionarySession,
    (dict) => {
      if (!Array.isArray(dict)) return
      dict.forEach((_d) => {
        setDictionary(_d.children, _d.code)
      })
    },
    { deep: true, immediate: true }
  )
  watch(
    proxy.$store.state.permission.dict,
    (dict) => {
      if (JSON.stringify(dict) === '{}') return
      for (const key in dict) {
        if (Object.hasOwnProperty.call(dict, key)) {
          const element = dict[key]
          setDictionary(element, key)
        }
      }
    },
    { deep: true, immediate: true }
  )
  function setDictionary(element, key) {
    // 查找默认值
    const _default = element.find((option) => option.isDefault == 1)
    // 设置字典信息
    dictionary[key] = {
      // 默认值
      default: _default ? dictionaryToOption(_default) : null,
      // 选项
      options: element.map(dictionaryToOption),
    }
  }
  // 设置默认值
  const setDefaultValue = (key, type = 'code') => {
    return dictionary[key]?.default ? dictionary[key].default[type] : ''
  }
  // 设置选项
  const setOptions = (key, type = 'code', isSearch = false) => {
    const options = dictionary[key]?.options?.map((item) => ({
      ...item,
      value: item[type],
    }))
    if (!options) {
      console.warn(`Can not find key ${key} in dictionary.`)
      return []
    }
    return isSearch
      ? [{ id: null, value: '', label: '全部' }, ...options]
      : options
  }
  // 根据ID回显名称
  const getOptionsValue = (key, id, type = 'code') => {
    return dictionary[key]?.options?.find((v) => `${v[type]}` === `${id}`)
      ?.label
  }
  // 使用label回显数值
  const findValueByLabel = (key, label, type = 'code') => {
    const result = dictionary[key]?.options?.find((v) => {
      let regex = label
      if (typeof label === 'string') {
        regex = new RegExp(label)
      }
      return regex.test(v.label)
    })
    return result ? result[type] : null
  }
  // 以正则匹配符合条件的数组
  const findValuesByLabel = (key, label, type = 'code') => {
    return dictionary[key]?.options
      ?.filter((v) => {
        let regex = label
        if (typeof label === 'string') {
          regex = new RegExp(label)
        }
        return regex.test(v.label)
      })
      .map((v) => v[type])
  }
  return {
    dictionary,
    setDefaultValue,
    setOptions,
    getOptionsValue,
    findValueByLabel,
    findValuesByLabel,
  }
}

export default useDictionary
