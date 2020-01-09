import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate }
    ] }
]

const router = new VueRouter({
  routes
})

// 挂载路由防卫导航守卫
router.beforeEach((to, from, next) => {
  // to 表示将要访问的地址 from 表示来自的地址， next表示放行
  if (to.path === '/login') return next()
  // 获取sessionStorage里面的token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果获取不到，终止向下执行并强制跳转到/login
  if (!tokenStr) return next('/login')
  next()
})

export default router
