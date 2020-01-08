<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/homt' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表表格部分 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdBottom', i1 === 0 ? 'bdTop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeTagById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdTop', 'vcenter']"
                >
                  <!-- 渲染二级 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeTagById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeTagById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="40%" @close="resetAddForm">
      <!-- 中间内容 添加角色表单 -->
      <span>
        <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <!-- 脚部分 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="40%">
      <!-- 中间内容 编辑角色表单 -->
      <span>
        <el-form :model="editForm" :rules="addRules" ref="editFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <!-- 脚部分 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="40%"
      @close="setRightsDialogClose"
    >
      <!-- 中间树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defKeys"
        ref="rightsRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 权限列表数据
      rightsList: [],
      // 控制添加角色对话框显示与否
      addDialogVisible: false,
      // 控制编辑角色对话框显示与否
      editDialogVisible: false,
      // 控制分配权限对话框的显示与否
      setRightsDialogVisible: false,
      // 添加角色表单
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色表单
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单规则
      addRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色名描述', trigger: 'blur' }
        ]
      },
      // 树形控件属性绑定对象
      treeProps: {
        // 树形控件每一级的标题是对象中的authName属性
        label: 'authName',
        // 树形控件通过children属性来分级
        children: 'children'
      },
      // 默认显示选中结点的id值
      defKeys: [],
      // 即将要分配权限的角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(res)
    },

    // 添加角色表单中 确定 添加角色
    addRole() {
      // 表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('输入信息不符合规则，请检查')
        }
        // 无误时，发送axios请求，添加角色
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 重新加载角色列表
        this.getRolesList()
        this.addDialogVisible = false
      })
    },

    // 关闭对话框时重置添加角色表单
    resetAddForm() {
      this.$refs.addFormRef.resetFields()
    },

    // 显示编辑角色对话框
    async showEditDialog(id) {
      // 发送请求，获取当前id值得角色数据
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取当前角色数据失败')
      }
      this.editDialogVisible = true
      // 给私用数据中得editForm对象赋值
      this.editForm = res.data
    },

    // 编辑角色表单中 确定 编辑角色
    editRole() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('输入信息不符合规则，请检查')
        }
        // 发送axios请求，提交编辑后的数据
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('提交编辑信息失败')
        }
        // 给出提示和重新加载列表
        this.$message.success('编辑成功')
        this.getRolesList()
        // 关闭对话框
        this.editDialogVisible = false
      })
    },

    // 删除角色
    async removeRoleById(id) {
      // 获取confirm框的结果
      const removeResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (removeResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 点击了确定，根据id删除角色
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      // 删除成功，给出提示和重新加载角色列表数据
      this.$message.success('删除成功')
      this.getRolesList()
    },

    // 删除权限标签
    async removeTagById(role, rightsId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('以取消删除操作')
      }
      // 发送请求删除权限
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightsId}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      // 删除成功给scope.row.children重新赋值，而不是重新获取列表，重新获取列表会导致表格重新渲染
      role.children = res.data
    },

    // 点击了分配权限对话框
    async showSetRightsDialog(role) {
      // 保存将要分配角色的id
      this.roleId = role.id
      // 发送请求，获取权限列表数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      console.log(this.rightsList)
      // 递归选中节点
      this.getLeafKeys(role, this.defKeys)
      this.setRightsDialogVisible = true
    },

    // 通过递归,找到角色下所有三级权限的id值,将其push到defKeys数组中
    getLeafKeys(node, arr) {
      // console.log(node)
      // 如果在当前节点中找不到children属性,证明已经是第三级节点了
      if (!node.children) {
        // 将里面的id值push到数组中
        return arr.push(node.id)
      }
      // 遍历节点的中children属性
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },

    // 当分配权限对话框关闭时,清空权限defkeys数组
    setRightsDialogClose() {
      this.defKeys = []
    },

    // 分配权限对话框 确定提交时
    async setRights() {
      // 定义一个数组用来存放选中节点的id和帮选中节点的id
      const keys = [
        ...this.$refs.rightsRef.getCheckedKeys(),
        ...this.$refs.rightsRef.getHalfCheckedKeys()
      ]
      const keysStr = keys.join(',')
      // console.log(keysStr)
      // 发送请求,分配权限
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: keysStr
      })
      if (res.meta.status !== 200) {
        this.$message.error('分配失败')
      }
      // 分配成功
      this.$message.success('分配成功')
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 15px;
}
.bdTop {
  border-top: 1px solid #ccc;
}
.bdBottom {
  border-bottom: 1px solid #ccc;
}
// 一级权限和二级权限居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>
