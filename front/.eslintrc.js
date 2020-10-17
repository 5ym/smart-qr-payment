module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020
  },
  "extends": [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-undef': 1,
    '@typescript-eslint/no-this-alias': 1
  }
}