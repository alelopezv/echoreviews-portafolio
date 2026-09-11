import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // react() da el JSX y la recarga en caliente; tailwindcss() procesa las
    // clases al compilar. Los dos hacen falta de verdad — el comentario que
    // había acá venía de la plantilla de Figma Make y decía que eran
    // obligatorios "aunque Tailwind no se use", que en este proyecto no es
    // el caso: todo el estilado son clases de Tailwind.
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
