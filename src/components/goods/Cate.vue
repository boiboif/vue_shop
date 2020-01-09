<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        :show-row-hover="false"
        index-text="#"
        border
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.cat_level ===0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level ===1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            class="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            class="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="40%"
        @close="resetaddCateForm"
      >
        <!-- 添加分类对话框中间表单 -->
        <el-form :model="addCateForm" :rules="addRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- 级联选择器 -->
            <!-- v-model需要绑定一个数组，因为这是级联选择框，有多项选择 -->
            <!-- option表示绑定的数据 -->
            <!-- prop表示绑定的配置对象 -->
            <el-cascader
              v-model="selectKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <!-- 对话框脚部分 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑分类名称对话框 -->
      <el-dialog
        title="编辑分类名称"
        :visible.sync="editCateDialogVisible"
        width="40%"
        @close="resetEditCaseForm"
      >
        <!-- 编辑分类对话框中的表单 -->
        <el-form :model="editCateForm" :rules="addRules" ref="editCateFormRef" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 分类总数
      total: 0,
      // 分类列表
      cateList: [],

      // 父级分类列表
      parentCateList: [],

      // tree表格列数据
      columns: [
        {
          label: '商品分类列表',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将该列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将该列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'sort'
        },
        {
          label: '操作',
          // 表示将该列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与否
      addCateDialogVisible: false,
      // 控制编辑分类对话框的显示峪口
      editCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        cat_name: '',
        // 父级分类id,如果要添加1级分类，则父分类Id应该设置为`0`
        cat_pid: 0,
        // 分类层级，默认为0，表示一级分类
        cat_level: 0
      },
      // 添加分类表单规则
      addRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 编辑分类表单数据对象
      editCateForm: {
        cat_name: ''
      },
      // 级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        // 让一级菜单也能选择
        checkStrictly: 'true'
      },
      // 选中父级分类的id数组
      selectKeys: []
    }
  },
  created() {
    this.getGoodsCateList()
  },
  methods: {
    // 获取商品分类列表
    async getGoodsCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      // 判断请求是否成功
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      console.log(res.data)
      this.cateList = res.data.result
      // 给分类数据总数total赋值
      this.total = res.data.total
    },
    // 监听每页显示数据条数的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 重新获取分类列表
      this.getGoodsCateList()
    },
    // 监听当前页码的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsCateList()
    },
    // 点击了添加分类按钮，显示对话框
    showAddCateDialog() {
      // 先获取父级分类
      this.getParentCateList()
      // 再显示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      // 判断是否获取成功
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类失败')
      }
      // 给data中的父级分类数据赋值
      this.parentCateList = res.data
      console.log(res.data)
    },
    // 监听对话框关闭事件，重置添加分类表单
    resetaddCateForm() {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.selectKeys = []
    },
    // 级联选择器内容改变时
    parentCateChanged() {
      // selectKeys数组中，最后一个元素就是父级id，数组长度就是分类等级
      if (this.selectKeys.length > 0) {
        // 给添加分类表单对象addCateForm中的分类父级id赋值
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        // 给分类等级赋值
        this.addCateForm.cat_level = this.selectKeys.length
      } else {
        // 如果等于0的话，重置父级id和分类等级为0
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      console.log(this.selectKeys)
    },
    // 添加分类表单确定提交时
    addCate() {
      console.log(this.addCateForm)
      // 预校验
      this.$refs.addCateFormRef.validate(async valid => {
        // 如果校验不通过直接return
        if (!valid) return
        // 发送请求，添加分类
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        // 判断是否发送成功
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        }
        // 添加成功，给出提示和重新加载分类列表数据
        this.$message.success('添加分类成功')
        this.getGoodsCateList()
        // 关闭对话框
        this.addCateDialogVisible = false
      })
    },

    // 显示编辑分类对话框
    async showEditCateDialog(id) {
      console.log(id)
      // 根据id查询分类数据
      const { data: res } = await this.$http.get('categories/' + id)
      // 判断是否成功
      if (res.meta.status !== 200) {
        this.$message.error('获取数据失败')
      }
      // 给editCateFrom对象中的分类id名赋值
      this.editCateForm.cat_name = res.data.cat_name
      // 因为最后在表单确认提交时要用到分类id，所以也把分类id存到editCateFrom对象中
      this.editCateForm.cat_id = res.data.cat_id
      this.editCateDialogVisible = true
    },

    // 编辑分类表单确定提交
    editCate() {
      // 预验证
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        // 验证成功，发送请求
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('提交失败')
        }
        // 成功后，重新加载分类列表
        this.getGoodsCateList()
        this.editCateDialogVisible = false
      })
    },
    // 监听编辑分类对话框关闭事件
    resetEditCaseForm() {
      // 重置表单
      this.$refs.editCateFormRef.resetFields()
    },

    // 根据id删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果没有点击确认
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 确认删除，发送请求
      const { data: res } = await this.$http.delete('categories/' + id)
      // 判断是否删除成功
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      // 删除成功，给出提示，并重新加载分类数据
      this.$message.success('删除成功')
      this.getGoodsCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
