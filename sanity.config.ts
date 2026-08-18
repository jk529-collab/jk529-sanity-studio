import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {defaultDocumentNode, structure} from './src/structure'
import {schemaTypes} from './src/schemaTypes'
import './src/studio.css'

export default defineConfig({
  name: 'jk529-studio',
  title: 'JK529 內容工作台',
  projectId: 'qn9shm4c',
  dataset: 'production',
  plugins: [structureTool({structure, defaultDocumentNode})],
  schema: {types: schemaTypes},
  vite: (config: any) => ({
    ...config,
    server: {
      ...config.server,
      allowedHosts: ['3333-iuh4uqqgqyitg9rkbarf4-51195bad.sg1.manus.computer'],
    },
  }),
})
