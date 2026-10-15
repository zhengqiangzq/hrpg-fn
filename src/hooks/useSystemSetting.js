import { ref } from 'vue'

/**
 * 使用系统设置
 */
const useSystemSetting = () => {
  const hospitalId = ref('')
  const hospitalName = ref('')
  const loadSetting = () => {
    const pkOrg = JSON.parse(sessionStorage.getItem('setting'))
    hospitalId.value = pkOrg?.orgId || pkOrg?.hospitalId || ''
    hospitalName.value =
      pkOrg?.orgName || pkOrg?.hospitalName || pkOrg?.companyName || ''
  }

  return {
    hospitalId,
    hospitalName,
    loadSetting,
  }
}

export default useSystemSetting
