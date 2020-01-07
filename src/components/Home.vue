<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登陆</el-button>
    </el-header>
    <!-- 主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="collapseBtn" @click="toggleCollapse">|||</div>
        <!-- 侧边栏导航菜单区域  router开启路由模式-->
        <!-- default-active的值为二级导航的:index值，对应的二级导航会高亮 -->
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#3699FF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active='activePath'
        >
        <!-- 一级导航 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级导航模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconClass[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级导航 -->
            <!-- 当menu开启router模式时跳转的地址是:index的值 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavstate('/' + subItem.path)"
            >
              <!-- 二级导航模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 中间内容 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconClass: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  mounted() {
    this.getMenuList()
    // 页面刷新时获取session中的activePath，赋值给data()中的activePath
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 清空sessionStorage
      window.sessionStorage.clear()
      // 跳转到登陆页面
      this.$router.push('/login')
    },
    // 获取菜单数据
    async getMenuList() {
      // 发送axios请求获取菜单数据并解构获得
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) { return this.$message.error('获取左侧菜单列表失败') }
      // 将数据赋值给menuList
      this.menuList = res.data
      console.log(res)
    },
    // 切换菜单折叠状态
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 左侧菜单点击高亮
    saveNavstate(activePath) {
      // 将二级导航的:index值存储到session中
      window.sessionStorage.setItem('activePath', activePath)
      // 点击的时候也赋值一次
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #363d40;
  padding-left: 0;
  color: #fff;
  font-size: 24px;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #313743;
  .el-menu {
    border-right: 0;
  }
  .collapseBtn {
    line-height: 24px;
    background-color: #243137;
    font-size: 10px;
    color: #fff;
    letter-spacing: 0.2em;
    text-align: center;
    cursor: pointer;
  }
}
.el-main {
  background-color: #e9edf1;
}
.iconfont {
  margin-right: 12px;
}
</style>
