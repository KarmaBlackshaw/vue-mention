module.exports = {
  root: true,

  env: {
    node: true,
    browser: true
  },

  globals: {
    define: true
  },

  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    'plugin:vue/recommended'
  ],

  parser: 'vue-eslint-parser',

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'array-bracket-spacing': [
      'error',
      'never'
    ],
    'array-callback-return': 'error',
    'arrow-parens': [
      'error',
      'as-needed'
    ],
    'object-curly-spacing': ['error', 'always'],
    'arrow-spacing': 'error',
    'block-spacing': 'error',
    'brace-style': 'error',
    'camelcase': 'off',
    'comma-dangle': 'error',
    'default-case': 'error',
    'eqeqeq': 'off',
    'indent': [
      'error',
      2,
      {
        'ignoredNodes': [
          'TemplateLiteral'
        ],
        'SwitchCase': 1
      }
    ],
    'no-alert': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'no-else-return': 'error',
    'no-empty-function': 'error',
    'no-labels': 'off',
    'no-loop-func': 'error',
    'no-multiple-empty-lines': [
      'error',
      {
        'max': 1
      }
    ],
    'no-new': 'off',
    'no-prototype-builtins': 'off',
    'no-return-await': 'error',
    'no-shadow': 'error',
    'no-useless-catch': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    semi: ['error', 'never'],
    'quotes': [
      'error',
      'single',
      {
        'avoidEscape': true
      }
    ],
    'require-await': 'error',
    'template-curly-spacing': 'off',
    'vue/comma-spacing': [
      'error',
      {
        'before': false,
        'after': true
      }
    ],
    'vue/component-definition-name-casing': [
      'error',
      'PascalCase'
    ],
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case'
    ],
    'vue/custom-event-name-casing': [
      'error',
      'kebab-case',
      {
        'ignores': [
          '/^[a-z]+(?:-[a-z]+)*:[a-z]+(?:-[a-z]+)*$/u'
        ]
      }
    ],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        'singleline': 'never',
        'multiline': 'always'
      }
    ],
    'vue/html-end-tags': 'error',
    'vue/html-indent': [
      'error',
      2,
      {
        'attribute': 1,
        'baseIndent': 1,
        'closeBracket': 0,
        'alignAttributesVertically': true,
        'ignores': []
      }
    ],
    'vue/html-self-closing': [
      'error',
      {
        'html': {
          'void': 'never',
          'normal': 'never',
          'component': 'always'
        },
        'svg': 'always',
        'math': 'always'
      }
    ],
    'vue/match-component-file-name': [
      'error',
      {
        'extensions': [
          'vue'
        ],
        'shouldMatchCase': false
      }
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        'singleline': 1
      }
    ],
    'vue/no-unused-properties': [
      'error',
      {
        'groups': [
          'props',
          'data',
          'computed',
          'methods'
        ]
      }
    ],
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/this-in-template': [
      'error',
      'never'
    ],
    'vue/v-bind-style': [
      'error',
      'shorthand'
    ],
    'vue/v-on-style': [
      'error',
      'shorthand'
    ]
  }
}
