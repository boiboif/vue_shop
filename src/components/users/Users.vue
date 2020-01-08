<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 第一行搜索部分 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索输入框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表表格部分 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 scope.row拿到这一行的数据-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 编辑用户按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditUserDialog(scope.row.id)"
            ></el-button>
            <!-- 删除用户按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRolesDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 弹出对话框部分 close事件，Dialog 关闭的回调-->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%" @close="resetAddForm">
        <!-- 对话框中间内容(添加用户表单) -->
        <span>
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
        </span>
        <!-- 对话框底部按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button type="danger" @click="resetAddForm">重置</el-button>
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑用户的对话框 -->
      <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="resetEditForm">
        <!-- 对话框中间 编辑用户表单 -->
        <span>
          <el-form
            :model="editForm"
            :rules="addFormRules"
            ref="editFormRef"
            label-width="70px"
            class="demo-ruleForm"
          >
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
          </el-form>
        </span>
        <!-- 对话框脚部分 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRolesDialogVisible"
        width="40%"
        @close="closeSetRolesDialog"
      >
        <div>
          <p>当前用户: {{userInfo.username}}</p>
          <p>当前用户角色: {{userInfo.role_name}}</p>
          <p>
            分配新角色:
            <el-select v-model="roleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义表单验证规则
    var checkEmail = (rule, value, cb) => {
      const emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (emailReg.test(value)) {
        // 如果通过验证，return cb()
        return cb()
      }
      // 否则在cb里面new 一个 Error，传入错误信息
      cb(new Error('邮箱格式不符合规则，请重新输入'))
    }
    var checkMobile = (rule, value, cb) => {
      const mobileReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (mobileReg.test(value)) {
        return cb()
      }
      cb(new Error('手机号码格式不正确，请重新输入'))
    }
    return {
      // 用户列表请求参数
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5
      },
      // 用户列表数据
      userList: [],
      total: 0,
      // 控制 添加用户 对话框的显示与否
      addDialogVisible: false,
      // 控制 编辑用户 对话框的显示与否
      editDialogVisible: false,
      // 控制 分配角色 对话框的显示与否
      setRolesDialogVisible: false,
      // 添加用户表单数据绑定
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 编辑用户表单数据绑定
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '请输入3~8个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '请输入6~16个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 需要被分配角色的用户信息 or 分配角色对话框中的数据
      userInfo: {},
      // 角色列表
      rolesList: [],
      // select标签中绑定的角色id
      roleId: ''
    }
  },
  mounted() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      // 发送axios获取用户列表数据
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听每页显示多少条
    handleSizeChange(newSize) {
      // console.log(newSize)
      // 给data中的当前页数重新赋值
      this.queryInfo.pagesize = newSize
      // 重新发送请求获取欧阳农户列表数据
      this.getUserList()
    },
    // 监听当前页面的改变
    handleCurrentChange(newPage) {
      // console.log(newPage)
      // 给data中的每页显示多少条数据重新赋值
      this.queryInfo.pagenum = newPage
      // 重新发送请求获取欧阳农户列表数据
      this.getUserList()
    },
    // 监听switch开关状态变化
    async userStateChanged(userInfo) {
      // console.log(userInfo)
      // 发送axios请求，改变用户状态
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('改变用户状态失败')
      }
      this.$message.success('改变用户状态成功')
    },
    // 重置添加用户表单
    resetAddForm() {
      this.$refs.addFormRef.resetFields()
    },
    // 重置编辑用户表单
    resetEditForm() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交用户添加表单
    addUser() {
      // 预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('用户表单验证失败')
        }
        // 预验证通过，发送axios请求
        const { data: res } = await this.$http.post('users', this.addForm)
        // 如果返回status 不等于 201，提示添加错误
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        // 添加成功，重新获取用户列表
        this.getUserList()
        // 给出提示
        this.$message.success('添加用户成功')
        // 隐藏对话框
        this.addDialogVisible = false
      })
    },
    // 显示编辑用户对话框
    async showEditUserDialog(id) {
      this.editDialogVisible = true
      // 通过作用域插槽拿到要编辑用户的id
      // console.log(id)
      // 发送axios请求获取要编辑用户的信息
      const { data: res } = await this.$http.get(`users/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      // 给editForm对象中的属性赋值
      this.editForm = res.data
    },
    // 提交编辑用户表单
    editUser() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单信息不符合规则,请重新输入')
        }
        // 发送axios请求,实现用户信息编辑。id在获取要编辑用户信息的时候已经将返回值中的id赋值给了editForm对象中的属性了
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('提交失败')
        }
        this.$message.success('提交成功')
        // 成功后重新获取用户列表信息
        this.getUserList()
        // 隐藏对话框
        this.editDialogVisible = false
      })
    },
    // 根据id删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 点击了确定的话，发送请求，删除用户
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 删除成功，重新获取用户列表
      this.getUserList()
      // 给出提示
      this.$message.success('删除成功')
    },

    // 显示分配角色对话框
    async showSetRolesDialog(role) {
      this.setRolesDialogVisible = true
      // console.log(role)
      // 分配角色对话框中的数据userInfo赋值
      this.userInfo.username = role.username
      this.userInfo.role_name = role.role_name
      this.userInfo.id = role.id
      // 发送请求获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },

    // 分配角色确定
    async setRole() {
      if (!this.roleId) {
        return this.$message.error('请选择角色')
      }
      // 发送请求,分配新角色
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.roleId
      })
      // 如果返回失败结果
      if (res.meta.status !== 200) {
        return this.$message.error('分配新角色失败')
      }
      this.$message.success('分配新角色成功')
      // 重新加载用户列表数据
      this.getUserList()
      this.setRolesDialogVisible = false
    },

    // 关闭分配角色对话框,重置select标签中的roleId
    closeSetRolesDialog() {
      this.roleId = ''
      this.userInfo = {}
    }
  }
}
</script>
