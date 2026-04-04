import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import { leadTelegramApiPlugin } from './vite/leadTelegramApiPlugin'

const projectRootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, projectRootDir, '')

  return {
    plugins: [react(), tailwindcss(), leadTelegramApiPlugin(environment)],
    resolve: {
      alias: {
        '@': path.resolve(projectRootDir, 'src'),
      },
    },
  }
})
