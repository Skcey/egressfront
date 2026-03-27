import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 配置 Mock 插件
    viteMockServe({
      mockPath: 'mock', // Mock 数据文件存放目录（项目根目录下新建 mock 文件夹）
      localEnabled: false, // 开发环境关闭 Mock，使用真实后端API
      prodEnabled: false, // 生产环境关闭 Mock
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端服务地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // 去掉 /api 前缀
      }
    }
  }
})