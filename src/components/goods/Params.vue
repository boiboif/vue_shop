<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 顶部警告文字 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>
      <!-- 选择分类级联框 -->
      <el-row class="cate_opt">
        <el-col>
          <span>请选择商品分类：</span>
          <!-- 级联选择框 -->
          <!-- v-model需要绑定一个数组，因为这是级联选择框，有多项选择 -->
          <!-- option表示绑定的数据 -->
          <!-- prop表示绑定的配置对象 -->
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab栏区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- tab栏标签many -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="idBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 循环显示多个tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="item.id"
                  closable
                  @close="handleClose(i, scope.row)"
                >{{item}}</el-tag>
                <!-- 输入框和按钮标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 作用域插槽 -->
                <el-button
                  size="mini"
                  type="primary"
                  class="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  class="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- tab栏标签only -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="idBtnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 循环显示多个tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="item.id"
                  closable
                  @close="handleClose(i, scope.row)"
                >{{item}}</el-tag>
                <!-- 输入框和按钮标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 作用域插槽 -->
                <el-button
                  size="mini"
                  type="primary"
                  class="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  class="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数/属性对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="resetAddForm"
      >
        <!-- 添加参数/属性 表单 -->
        <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 添加参数/属性 对话框脚部分 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑参数/属性对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="resetEditForm"
      >
        <!-- 添加参数/属性 表单 -->
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 添加参数/属性 对话框脚部分 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类数据列表
      cateList: [],
      // 动态参数数据
      manyTableData: [],
      // 静态参数属性
      onlyTableData: [],
      // 级联选择框配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectCateKeys: [],

      // tab栏双向绑定的数据，activeName是tab标签的name属性的值
      activeName: 'many',

      // 控制添加参数/属性 对话框的显示与否
      addDialogVisible: false,

      // 添加参数/属性表单对象
      addForm: {
        attr_name: ''
      },

      // 添加参数/属性表单验证规则
      addRules: {
        attr_name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },

      // 编辑参数/属性表单验证规则
      editRules: {
        attr_name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },

      // 控制编辑对话框的显示与否
      editDialogVisible: false,

      // 编辑参数表单对象
      editForm: {
        attr_name: ''
      }
    }
  },
  created() {
    // 生命周期函数，获取分类列表数据
    this.getCateList()
  },

  methods: {
    // 获取商品分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      // 判断是否获取分类列表成功
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表数据失败')
      }
      // 给分类数据列表赋值
      this.cateList = res.data
      console.log(this.cateList)
    },

    // 监听级联选择器change事件
    handleChange() {
      // 获取分类参数
      this.getParamsData()
    },

    // Tab栏切换事件
    handleTabClick() {
      console.log(this.activeName)
      // 获取分类参数
      this.getParamsData()
    },

    // 获取分类参数列表数据
    async getParamsData() {
      // 打印selectCateKeys的值
      console.log(this.selectCateKeys)
      // 控制级联选择框的选择范围,(只能选择3级)
      // 如果selectCateKeys数组的长度不为3，就清空数组,并且清空表格数据
      if (this.selectCateKeys.length !== 3) {
        // 清空级联选择器的数组
        this.selectCateKeys = []
        // 清空动态参数表格
        this.manyTableData = []
        // 清空静态属性表格
        this.onlyTableData = []
      } else {
        // 如果数组长度为3，就发送请求，获取分类参数
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: this.activeName } }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取分类参数失败')
        }
        console.log(res.data)
        // 将参数项转换成数组,并且为参数添加控制文本框显示与否的属性
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 因为不给每项添加属性,共用一个属性的话,会出现联动的情况,就是不同行的输入框共享一个值,共同显示和隐藏

          // 之后在作用域插槽中通过scope.row.inputVisible,控制文本框的显示与否
          item.inputVisible = false
          // 文本框的值
          item.inputValue = ''
        })
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
    },

    // 监听添加参数/属性 对话框关闭事件
    resetAddForm() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加对话框中点击了确定
    addParams() {
      // 表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 判断请求结果
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },

    // 显示编辑对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      // 发送请求，获取当前参数/属性的名称
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        { params: { attr_sel: this.activeName } }
      )

      // 判断请求结果
      if (res.meta.status !== 200) {
        return this.$message.error('请求失败')
      }
      // 请求成功，给编辑表单对象中的属性名称赋值
      this.editForm.attr_name = res.data.attr_name
      // 保存属性id，在确认提交时需要用
      this.editForm.attr_id = res.data.attr_id
      console.log(this.editForm)
    },

    // 监听修改对话框关闭事件
    resetEditForm() {
      this.$refs.editFormRef.resetFields()
    },

    // 编辑对话框中点击了确定
    editParams() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过，发送请求提交
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 判断请求结果
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        // 请求成功，给出提示，并更新参数列表数据
        this.$message.success('修改成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },

    // 删除参数/属性
    async removeParams(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 点了取消，给出提示并return
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 确认删除，发送请求
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )

      // 判断请求结果
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 删除成功，给出提示，并重新加载数据
      this.$message.success('删除成功')
      this.getParamsData()
      this.editDialogVisible = false
    },

    // 输入框失去焦点事件
    handleInputConfirm(row) {
      // 如果输入框去空格后长度为0
      if (row.inputValue.trim().length === 0) {
        // 清空输入框中的值
        row.inputValue = ''
        // 隐藏输入框
        row.inputVisible = false
        return false
      }
      // 如果没有return，证明有输入内容，接着执行后续操作
      // 将新增的tag标签的值push到数组中
      row.attr_vals.push(row.inputValue)
      // 然后清空输入框的内容,隐藏输入框
      row.inputValue = ''
      row.inputVisible = false

      // 发送请求，保存数据到后台
      this.saveAttrVals(row)
    },

    // 保存参数的tag到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },

    // tag标签关闭事件，发送请求删除attr_vals中对应的值
    handleClose(i, row) {
      console.log(i)
      // 移除对应索引号的attr_vals值
      row.attr_vals.splice(i, 1)
      // 发送请求
      this.saveAttrVals(row)
    },

    // 点击了按钮,切换至输入框
    showInput(row) {
      // 显示输入框
      row.inputVisible = true
      // 文本框自动获取焦点
      // $nextTick的作用,当页面中的元素被重新渲染之后,才会执行回调函数中的代码. 这里因为当点击按钮后,虽然row.inputVisible赋值为true了,但是input标签还没渲染完成.所以直接让他获取焦点,但是没这个标签,就会报错.所以要通过$nextTick方法,等input渲染完成后,才让他获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },

  computed: {
    // 控制按钮是否可用
    idBtnDisabled() {
      // 只有级联框选择了三级分类，就是selectCateKeys数组的长度为3，才可用
      if (this.selectCateKeys.length !== 3) {
        // 长度不为3 disabled = true btn不可用
        return true
      }
      // btn可用
      return false
    },

    // 获取三级分类的id,(获取分类参数的请求参数中需要用到)
    cateId() {
      // 如果selectCateKeys数组长度为3，就返回最后一个元素的值
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[this.selectCateKeys.length - 1]
      }
      // 不然的话就返回空
      return null
    },

    // 添加参数/属性 对话框的标题
    titleText() {
      if (this.activeName === 'many') {
        return '参数名称'
      }
      return '属性名称'
    }
  }
}
</script>

<style lang="less" scoped>
.cate_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
