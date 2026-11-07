import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Repo is RobertRomany.github.io (user site) -> served from the domain root.
export default defineConfig({ plugins: [react()], base: '/' });
