import { downloadLodop } from '@/api/base'
import utils from '@/common/js/utils'
import { ElMessageBox, ElMessage } from 'element-plus'
// LODOP 对象相关变量
let CreatedOKLodop7766 = null;
let CLodopScriptLoaded = false;
let CLodopLoadAttempted = false; // 添加标记表示是否已尝试加载

// 打印服务配置
const PRINT_CONFIG = {
  versions: {
    clodop: '3.0.0.2',
    lodop: '6.0'
  },
  ports: [8000, 18000, 8443],
  maxWaitTime: 10000,
  maxCheckCount: 20,
  licenseInfo: [
    {
      company: '成都思力普科技有限责任公司',
      license: 'B5911AABD171EA1DB546E8E42C530EFE',
      companyEn: '成都思力普科技有限責任公司',
      licenseEn: 'B8C85C711A87C88B28D10E95E4E9437E'
    },
    {
      company: 'THIRD LICENSE',
      license: '',
      companyEn: 'Chengdu sillip Technology Co., Ltd.',
      licenseEn: '5FAE491FBAEE15D211282B8B952F3C4F'
    }
  ]
};

/**
 * 下载lodop事件
 */
window.parent.downloadPrintPlugin = function(str) {
  let data = str + '.exe'
  let params = {
    fileName: 'lodop/install_lodop' + data,
  }
  downloadLodop(params).then((res) => {
    if (res) {
      utils.parseExcel(res, 'Lodop')
    }
  })
}
/**
 * 判断是否需要使用 CLodop
 * 针对不支持插件的浏览器
 */
export function needCLodop() {
  try {
    const ua = navigator.userAgent;
    
    // 移动端设备
    if (/Windows\sPhone/i.test(ua)) return true;
    if (/iPhone|iPod/i.test(ua)) return true;
    if (/Android/i.test(ua)) return true;
    if (/Edge\D?\d+/i.test(ua)) return true;

    // 检查浏览器版本
    const verTrident = ua.match(/Trident\D?\d+/i);
    const verIE = ua.match(/MSIE\D?\d+/i);
    const verOPR = ua.match(/OPR\D?\d+/i);
    const verFF = ua.match(/Firefox\D?\d+/i);
    const x64 = /x64/i.test(ua);
    
    // 非IE且64位系统
    if (verTrident == null && verIE == null && x64 !== null) return true;
    
    // Firefox 42+ 或 64位系统
    if (verFF !== null) {
      const version = parseInt(verFF[0].match(/\d+/)[0]);
      if (version >= 42 || x64 !== null) return true;
    }
    
    // Opera 32+
    if (verOPR !== null) {
      const version = parseInt(verOPR[0].match(/\d+/)[0]);
      if (version >= 32) return true;
    }
    
    // 非IE且非Trident内核的浏览器
    if (verTrident == null && verIE == null) {
      const verChrome = ua.match(/Chrome\D?\d+/i);
      if (verChrome !== null) {
        const version = parseInt(verChrome[0].match(/\d+/)[0]);
        if (version >= 42) return true;
      }
    }
    
    return false;
  } catch (err) {
    return true;
  }
}

/**
 * 检查 CLodop 服务端口
 */
async function checkCLodopService() {
  const promises = PRINT_CONFIG.ports.map((port) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(port);
      img.onerror = () => resolve(null);
      setTimeout(() => resolve(null), 2000);
      img.src = `http://localhost:${port}/favicon.ico?t=${Date.now()}`;
    });
  });

  for (let i = 0; i < promises.length; i++) {
    const result = await promises[i];
    if (result) return result;
  }
  return null;
}

/**
 * 动态加载 CLodop 脚本
 */
async function loadCLodopScript() {
  CLodopLoadAttempted = true; // 标记已尝试加载
  
  try {
    const servicePort = await checkCLodopService();
    if (!servicePort) {
      console.error('CLodop服务不可用');
      return false;
    }
    
    const head = document.head || document.documentElement;
    const script = document.createElement('script');
    script.async = true;
    script.src = `http://localhost:${servicePort}/CLodopfuncs.js?priority=1&t=${Date.now()}`;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('CLodop脚本加载超时');
        resolve(false);
      }, 5000);

      script.onload = () => {
        clearTimeout(timeoutId);
        CLodopScriptLoaded = true;
        resolve(true);
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        console.warn('CLodop脚本加载失败');
        resolve(false);
      };

      head.appendChild(script);
    });
  } catch (err) {
    console.error('加载CLodop脚本失败', err);
    return false;
  }
}

/**
 * 自动加载 CLodop 脚本
 */
if (needCLodop()) {
  setTimeout(async () => {
    await loadCLodopScript();
  }, 1500);
}

/**
 * 消息提示类
 */
class PrintMessage {
  static showInstallPrompt(msg) {
    ElMessageBox.alert(msg, '提示', {
      dangerouslyUseHTMLString: true,
    });
  }

  static showWarning(message) {
    ElMessage.warning({
      message: message,
      duration: 3000,
    });
  }

  static showError(message) {
    ElMessage.error({
      message: message,
      showClose: true,
      duration: 3500,
    });
  }
}

/**
 * 创建提示消息
 */
class MessageBuilder {
  static buildInstallMessage(type = 'clodop') {
    if (type === 'clodop') {
      return `<br><font >CLodop云打印服务(localhost本地)未安装启动!点击这里<a href='javascript:void(0);' onclick="downloadPrintPlugin('64')" class="CLodop-a">执行安装</a>,安装后请刷新页面。</font>`;
    } else {
      const is64IE = this.isIE() && /x64/i.test(navigator.userAgent);
      const type = is64IE ? '64' : '32';
      return `<br><font >打印控件未安装!点击这里<a href='javascript:void(0);' onclick="downloadPrintPlugin(${type})" class="CLodop-a">执行安装</a>,安装后请刷新页面或重新进入。</font>`;
    }
  }

  static buildUpdateMessage(type = 'clodop') {
    if (type === 'clodop') {
      return `<br><font >CLodop云打印服务需升级!点击这里<a href='javascript:void(0);' onclick="downloadPrintPlugin('32')" class="CLodop-a">执行升级</a>,升级后请刷新页面。</font>`;
    } else {
      const is64IE = this.isIE() && /x64/i.test(navigator.userAgent);
      const type = is64IE ? '64' : '32';
      return `<br><font >打印控件需要升级!点击这里<a href='javascript:void(0);' onclick="downloadPrintPlugin(${type})" class="CLodop-a">执行升级</a>,升级后请重新进入。</font>`;
    }
  }

  static buildBrowserTips(browser) {
    const tips = {
      firefox: "<br><br><font color='#FF00FF'>（注意：如曾安装过Lodop旧版附件npActiveXPLugin,请在【工具】->【附加组件】->【扩展】中先卸它）</font>",
      chrome: "<br><br><font color='#FF00FF'>(如果此前正常，仅因浏览器升级或重安装而出问题，需重新执行以上安装）</font>"
    };
    return tips[browser] || '';
  }

  static isIE() {
    return /MSIE|Trident/i.test(navigator.userAgent);
  }
}

/**
 * 初始化传统 Lodop 对象
 */
function initLodopObject(oOBJECT, oEMBED) {
  let LODOP = null;
  const isIE = MessageBuilder.isIE();

  // 如果页面已存在 Lodop 对象
  if (oOBJECT !== undefined && oEMBED !== undefined) {
    LODOP = isIE ? oOBJECT : oEMBED;
  } else if (CreatedOKLodop7766 === null) {
    // 创建新的 Lodop 对象
    LODOP = document.createElement('object');
    LODOP.setAttribute('width', 0);
    LODOP.setAttribute('height', 0);
    LODOP.setAttribute(
      'style',
      'position:absolute;left:0px;top:-100px;width:0px;height:0px;'
    );

    if (isIE) {
      LODOP.setAttribute(
        'classid',
        'clsid:2105C259-1E0C-4534-8141-A753534CB4CA'
      );
    } else {
      LODOP.setAttribute('type', 'application/x-print-lodop');
    }

    document.documentElement.appendChild(LODOP);
    CreatedOKLodop7766 = LODOP;
  } else {
    LODOP = CreatedOKLodop7766;
  }

  return LODOP;
}

/**
 * 设置 LODOP 许可证
 */
function setLodopLicenses(LODOP) {
  PRINT_CONFIG.licenseInfo.forEach((license) => {
    LODOP.SET_LICENSES(
      license.company,
      license.license,
      license.companyEn,
      license.licenseEn
    );
  });
}

/**
 * 检查传统 Lodop 版本
 */
function checkLodopVersion(LODOP) {
  if (LODOP && LODOP.VERSION && LODOP.VERSION < PRINT_CONFIG.versions.lodop) {
    const updateMessage = MessageBuilder.buildUpdateMessage('lodop');
    PrintMessage.showInstallPrompt(updateMessage);
  }
}

/**
 * 检查 CLodop 版本
 */
function checkCLodopVersion() {
  if (window.CLODOP && window.CLODOP.CVERSION < PRINT_CONFIG.versions.clodop) {
    const updateMessage = MessageBuilder.buildUpdateMessage('clodop');
    PrintMessage.showInstallPrompt(updateMessage);
  }
}

/**
 * 等待 CLodop 服务就绪
 */
function waitForCLodop() {
  const startTime = Date.now();
  let checkCount = 0;

  while (Date.now() - startTime < PRINT_CONFIG.maxWaitTime && checkCount < PRINT_CONFIG.maxCheckCount) {
    try {
      const LODOP = window.getCLodop();
      if (LODOP) {
        return LODOP;
      }
    } catch (err) {
      checkCount++;
    }
  }
  
  return null;
}
/**
 * 获取 LODOP 对象主函数
 */
export function getLodop(oOBJECT = null, oEMBED = null) {
  let LODOP = null;
  const isIE = MessageBuilder.isIE();

  try {
    if (needCLodop()) {
      // 使用 CLodop（现代浏览器）
      if (!CLodopScriptLoaded) {
        // 如果还没有尝试加载，先尝试加载
        if (!CLodopLoadAttempted) {
          // 显示安装提示，让用户手动安装
          const installMessage = MessageBuilder.buildInstallMessage('clodop');
          PrintMessage.showInstallPrompt(installMessage);
          return null;
        } else {
          // 已经尝试加载但失败了，显示安装提示
          const installMessage = MessageBuilder.buildInstallMessage('clodop');
          PrintMessage.showInstallPrompt(installMessage);
          return null;
        }
      }

      // 等待 CLodop 服务就绪
      LODOP = waitForCLodop();

      if (!LODOP) {
        const installMessage = MessageBuilder.buildInstallMessage('clodop');
        PrintMessage.showInstallPrompt(installMessage);
        return null;
      }

      checkCLodopVersion();
    } else {
      // 使用传统 Lodop（旧版 IE 等）
      LODOP = initLodopObject(oOBJECT, oEMBED);

      // 检查 Lodop 是否安装
      if (!LODOP || typeof LODOP.VERSION === 'undefined') {
        const ua = navigator.userAgent;
        const is64IE = isIE && /x64/i.test(ua);
        
        // 显示相应提示
        if (ua.includes('Chrome')) {
          PrintMessage.showInstallPrompt(MessageBuilder.buildInstallMessage('lodop') + MessageBuilder.buildBrowserTips('chrome'));
        }
        if (ua.includes('Firefox')) {
          PrintMessage.showInstallPrompt(MessageBuilder.buildInstallMessage('lodop') + MessageBuilder.buildBrowserTips('firefox'));
        }
        
        const installMessage = is64IE 
          ? MessageBuilder.buildInstallMessage('lodop')
          : MessageBuilder.buildInstallMessage('lodop');
        
        PrintMessage.showInstallPrompt(installMessage);
        return LODOP;
      }

      // 检查版本
      checkLodopVersion(LODOP);
    }

    // 设置许可证
    setLodopLicenses(LODOP);
    
    return LODOP;

  } catch (err) {
    PrintMessage.showError('获取打印对象失败：' + err.message);
    return null;
  }
}