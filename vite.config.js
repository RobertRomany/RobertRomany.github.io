import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Repo is RobertRomany.github.io (user site) -> served from the domain root.
const build = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
export default defineConfig({ plugins: [react()], base: '/', define: { __BUILD__: JSON.stringify(build) } });
