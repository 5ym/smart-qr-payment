import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import vuetify from 'eslint-plugin-vuetify'

// eslint-plugin-vuetify registers its own eslint-plugin-vue instance, which
// collides with the one @nuxt/eslint-config already provides. Keep the vuetify
// plugin and its rules, drop the duplicate.
const vuetifyConfig = vuetify.configs['flat/recommended-v4'].map(
  ({ plugins, ...config }) => ({
    ...config,
    plugins: Object.fromEntries(
      Object.entries(plugins ?? {}).filter(([name]) => name !== 'vue')
    )
  })
)

export default createConfigForNuxt().append(vuetifyConfig)
