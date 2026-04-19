import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        // Stock 数据服务代理
        '/api/stock': {
          target: env.VITE_STOCK_API_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
        // Chat API 代理
        '/api/chat': {
          target: env.VITE_CHAT_API_URL || 'http://localhost:8001',
          changeOrigin: true,
        },
      },
    },
  }
})
