<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告框部分 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="true"></el-alert>
      <!-- 步骤条部分 -->
      <!-- :active通过隐性转换成数字类型,因为tab栏中的name只能是字符串 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 循环显示多个item项，展示参数名称attr_name -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 多选框组attr_vals -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadApi"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览对话框 -->
      <el-dialog title="预览" :visible.sync="picDialogVisible" width="50%">
        <!-- 动态绑定图片的地址 -->
        <!-- 图片的绝对地址在预览图片事件中，通过参数file得到，然后保存到私有数据data的previewUrl中 -->
        <img :src="previewUrl" style="width: 100%" />
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
// 导入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条当前索引值
      activeIndex: '0',
      // 商品分类列表
      cateList: [],
      // 表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 文件上传数组，里面存放对象
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 深拷贝后的表单数据对象
      newAddForm: {},
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trriger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trriger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trriger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trriger: 'blur' }
        ],
        goods_cat: [{ required: true, message: '请选择商品分类' }]
      },
      // 级联选择器的val数组
      selectKeys: [],
      // 级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },

      // 商品动态参数列表
      manyTableData: [],
      // 商品静态属性列表
      onlyTableData: [],
      // 图片上传api接口地址
      uploadApi: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片上传后，点击预览事件中参数file存储的图片绝对路径
      previewUrl: '',
      // 控制图片预览对话框的显示与否
      picDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },

    // 级联选择器的change事件
    handleChange() {
      // 只能选择3级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      console.log(this.addForm.goods_cat)
    },

    // Tab栏切换事件
    beforeTabLeave(activeName, oldActiveName) {
      // activeName是要进入的tab栏的name值
      // oldActiveName是即将离开的tab的name值

      // 如果要离开基本信息tab栏, 判断是否已经选择了商品分类
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        // 如果没选,给出提示,并且return false,就会阻止tab栏切换
        this.$message.error('请先选择商品分类！')
        return false
      }
      // 如果选择了,return true 允许跳转
      return true
    },

    // Tab栏点击事件
    async tabClicked() {
      console.log(this.activeIndex)
      // 如果点击了商品参数
      if (this.activeIndex === '1') {
        // 发送请求获取商品参数数据
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        // 判断请求结果
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        }
        // 将参数中的attr_vals转换成数组
        res.data.forEach(item => {
          // 如果字符串的长度为0，就返回一个空数组
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        console.log(res.data)
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 发送请求获取商品静态属性数据
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        // 判断请求结果
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败')
        }
        this.onlyTableData = res.data
      }
    },

    // 图片预览处理事件
    handlePreview(file) {
      console.log(file)
      // 图片的绝对路径
      this.previewUrl = file.response.data.url
      // 显示图片预览对话框
      this.picDialogVisible = true
      console.log(this.previewUrl)
    },

    // 图片移除事件
    handleRemove(file) {
      console.log(file)
      // 1.获取想要移除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.找到数组中对象的pic值与临时路径相等项的index值
      var index = this.addForm.pics.findIndex(x => {
        return x.pic === filePath
      })
      // 3.根据index值移除数组中元素
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },

    // 文件上传成功
    uploadSuccess(response) {
      console.log(response)
      // 因为添加商品api要求上传文件是一个数组，里面存放对象，对象中的属性值就是response.data.tmp_path
      var picObj = { pic: response.data.tmp_path }
      // 将对象push到数组中pics
      this.addForm.pics.push(picObj)
      console.log(this.addForm)
    },

    // 添加商品确定
    async addGood() {
      console.log(this.addForm)
      // 表单预验证
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('请填写必要项')
        }
      })
      // 准备发送请求
      // 因为级联选择器双向绑定的必须是数组，而提交时需要字符串，如果直接join转换成字符串，会报错，所以需要深拷贝多一份一模一样的

      // 进行深拷贝
      // 方法一：
      // this.newAddForm = JSON.parse(JSON.stringify(this.addForm))

      // 方法二：使用lodash中的cloneDeep方法
      this.newAddForm = _.cloneDeep(this.addForm)

      this.newAddForm.goods_cat = this.newAddForm.goods_cat.join(',')

      // 循环动态参数
      this.manyTableData.forEach(item => {
        const manyObj = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.newAddForm.attrs.push(manyObj)
      })
      // 循环静态参数
      this.onlyTableData.forEach(item => {
        const onlyObj = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.newAddForm.attrs.push(onlyObj)
      })
      console.log(this.newAddForm)

      // 发送请求 商品名称必须是唯一的
      const { data: res } = await this.$http.post('goods', this.newAddForm)
      // 判断请求结果
      if (res.meta.status !== 201) {
        return this.$message.error('添加商品失败')
      }
      // 添加成功
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
    }
  },
  computed: {
    // 获取3级分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 5px 10px;
}

.addBtn {
  margin-top: 15px;
}
</style>
