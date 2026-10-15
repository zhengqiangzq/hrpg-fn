import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'
// 原生时间格式化辅助函数
const getFormattedTime = () => {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  env.VITE_APP_TIME = getFormattedTime()

  // 获取自定义环境变量，判断是否排除 demo 目录
  // 假设我们在 .env.staging 中设置 VITE_APP_EXCLUDE_DEMO=true
  const excludeDemo = env.VITE_APP_EXCLUDE_DEMO == 'true'

  return {
    base: mode === 'development' ? '' : '/fnNew/',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      // 统一路径分隔符，解决跨平台构建问题
      preserveSymlinks: false,
    },
    // vite 相关配置
    server: {
      port: 8091,
      open: false,
      host: true,
      proxy: {
        '/api/basic': {
          // 基础服务
          target: 'http://10.60.20.145:8881',
          // 本地
          // target: 'http://10.60.20.159:8881',
          // target: 'http://10.60.10.106:8881',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/api': {
          // 基础服务
          // target: 'http://10.60.20.161:7310',
          target: 'http://10.60.20.145:9005/api/fnNew',
          // target: 'http://10.60.20.159:8400',
          // target: 'http://10.60.10.106:8400',
          // 本地
          // target: 'http://10.60.20.156:7310',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ureport': {
          target: 'http://172.16.11.138:9005',
          changeOrigin: true,
        },
      },
    },
    // 预构建常用依赖，加快开发服务器启动
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'element-plus',
        'axios',
        '@vueuse/core',
        '@element-plus/icons-vue',
      ],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    build: {
      // minify: true,
      minify: 'esbuild',
      cssMinify: 'lightningcss',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      cssCodeSplit: true,
      // 启用预加载
      modulePreload: true,
      // 使用较新的目标以获得更好的优化
      target: 'modules',
      rollupOptions: {
        //配置rollup
        output: {
          // 配置rollup输出选项
          // Static resource classification and packaging//静态资源分类打包
          chunkFileNames: `assets/js/[name]-[hash].js`, //代码块文件名
          entryFileNames: `assets/js/[name]-[hash].js`, //入口文件名
          assetFileNames: `assets/[ext]/[name]-[hash].[ext]`, // 资源文件名
          manualChunks: {
            // Vue 核心 和 UI 框架
            'vue-core': ['vue', 'vue-router', 'vuex', 'vue-i18n','axios', '@vueuse/core', 'element-plus', '@element-plus/icons-vue' ],
            'vue-extras': ['vuedraggable', 'vue3-print-nb'],
            // 通用工具
            'common-utils': ['qs', 'js-cookie', 'nprogress', 'crypto-js'],
            // 特殊功能
            'special-libs': ['clipboard', 'v-viewer', 'js-pinyin', 'localforage', 'file-saver'],
          },
        },
        external: excludeDemo ? [/src\/views\/demo\//] : []
      },
      // 使用 esbuildOptions
      esbuildOptions: {
        // esbuild 的压缩选项
        drop: ['console', 'debugger'], // 移除 console 和 debugger
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        scss: {
          charset: false,
        },
      },
    },
  }
})
