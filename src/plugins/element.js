import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 将Message组件挂在到Vue的原型对象中,这样可以在组件中可以通过this.$message调用这个组件
Vue.prototype.$message = Message
