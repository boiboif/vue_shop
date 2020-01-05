<template>
  <!-- 包裹div盒子 -->
  <div class="login_container">
    <!-- 登陆盒子 -->
    <div class="login_box">
      <!-- 头像盒子 -->
      <div class="avatar">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- form表单盒子 -->
      <el-form class="fromBox" :model='loginForm' :rules='loginFormRules' ref="loginFormRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click='login'>登陆</el-button>
          <el-button type="info" @click='reset'>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登陆表单自定义属性loginForm
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证对象
      loginFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 9, message: '请输入3-9位字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '请输入6-16位字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset () {
      // 这里的this指向本组件,组件里面有一个$refs对象，里面可以拿到表单属性ref=“loginFormRef”中loginFormRef引用对象
      // console.log(this)
      // 表单方法resetFields用来重置表单
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 表单验证是否通过方法vilidate，传入一个回调函数，第一个参数是验证结果
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // await发送axios请求，结构获得返回对象中的data属性并重命名为res
        const { data: res } = await this.$http.post('login', this.loginForm)
        // 如果状态码不等于200 登陆失败
        if (res.meta.status !== 200) return this.$message.error('登陆失败')
        this.$message.success('登陆成功')
        // 1. 将登陆成功子厚的 token 保存到客户端的 sessionStorage 中
        //  1.1 项目中除了登陆之外的其他API接口，必须在登陆之后才能访问
        //  1.2 token只应在当前网站打开期间生效，所以将 token 保存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 2. 通过编程式导航跳转到主页，路由是/home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  // 包裹div盒子
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }
  // 登陆盒子
  .login_box {
    width: 450px;
    height: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 4px;
    background-color: #fff;
  }
  // 头像盒子
  .avatar {
    width: 140px;
    height: 140px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #ddd;
    border-radius: 50%;
    padding: 10px;
    background: #fff;
    box-shadow: 0 0 10px #ddd;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #ddd;
    }
  }
  // 表单盒子
  .fromBox {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    .btns {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
