import { defineApplicationConfig } from '@vben/vite-config';
import fs from 'node:fs';
import path from 'node:path';

(function copyData() {
  const file = path.resolve(
    process.cwd(),
    'node_modules',
    'webdriver-browser-core/dist-wdbLib/index.js',
  );
  const toFolder = path.resolve(process.cwd(), 'public/wdbLib');
  fs.mkdirSync(toFolder, { recursive: true });
  fs.copyFileSync(file, path.resolve(toFolder, 'wdbLib.js'));
})();

export default defineApplicationConfig({
  overrides: {
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'qrcode',
        '@iconify/iconify',
        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/locale/en_US',
      ],
    },
    server: {
      proxy: {
        '/basic-api': {
          target: 'http://localhost:7001',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/basic-api`), ''),
          // only https
          // secure: false
        },
        '/upload': {
          target: 'http://localhost:3300/upload',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/upload`), ''),
        },
      },
      open: false, // 项目启动后，自动打开
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
      port: 3100,
    },
  },
});
