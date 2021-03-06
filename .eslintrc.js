module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 函数名和()中间不用加空格也不会报错
    'space-before-function-paren': 0,
    // 允许空行(允许在行尾添加尾随空格)
    'no-trailing-spaces': 0
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
