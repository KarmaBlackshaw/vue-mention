const { VueUseDirectiveResolver } = require('unplugin-vue-components/resolvers')
const IconsResolver = require('unplugin-icons/resolver')

module.exports = {
  transpileDependencies: true,

  configureWebpack: {
    plugins: [
      require('unplugin-auto-import/webpack')({
        imports: ['vue', '@vueuse/core'],

        dts: './auto-imports.d.ts',
        dirs: ['./src/composables'],
        eslintrc: {
          enabled: true, // Default `false`
          filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        }
      }),
      require('unplugin-vue-components/webpack')({
        dirs: ['src/components'],
        directoryAsNamespace: true,
        directives: true,
        resolvers: [
          IconsResolver({
            prefix: 'icon'
          }),
          VueUseDirectiveResolver()
        ]
      }),
      require('unplugin-icons/webpack')({
        autoInstall: true
      })
    ]
  }
}
