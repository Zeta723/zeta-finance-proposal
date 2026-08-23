import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Vite config for Zeta 財務提案生成器
// base 設為 GitHub Pages 的 repository 路徑，對應
// https://zeta723.github.io/zeta-finance-proposal/
export default defineConfig({
    plugins: [react()],
    base: '/zeta-finance-proposal/',
    server: {
        port: 5173
    },
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 1600
    }
});
