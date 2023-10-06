import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'NoticeReact',
			fileName: 'notice',
		},
		rollupOptions: {
			external: ['react', 'react/jsx-runtime', '@notice-org/ntc'],
			output: {
				dir: 'lib',
				globals: {
					react: 'React',
					'react/jsx-runtime': 'jsxRuntime',
					'@notice-org/ntc': 'NTC',
				},
			},
		},
	},
})
