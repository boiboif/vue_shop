import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/css/fonts/iconfont.css'
// 导入第三方表格
import treeTable from 'vue-table-with-tree-grid'

// 导入axios
import axios from 'axios'
// 设置axios的基准地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 将axios挂在到Vue的原型对象上，这样每个组件都可以通过this来用到
Vue.prototype.$http = axios

// 请求拦截
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后要return出config请求对象
  return config
})

Vue.component('tree-table', treeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
