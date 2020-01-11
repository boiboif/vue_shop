<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <!-- 输入框部分 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格部分 -->
      <el-table :data="orderList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="500"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay==1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="200">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" prop="is_send">
          <template>
            <!-- 修改地址按钮 -->
            <el-button
              type="primary"
              size="mini"
              class="el-icon-edit"
              @click="addressDialogVisible = true"
            ></el-button>
            <!-- 查看物流信息按钮 -->
            <el-button
              type="success"
              size="mini"
              class="el-icon-location"
              @click="showProgressInfo"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改地址对话框 -->
      <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" @close="resetForm">
        <!-- 中间表单 -->
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <!-- 级联选择器 -->
            <el-Cascader :options="cityData" v-model="citykeys" :props="cityProps"></el-Cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 查看物流信息对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
        <!-- 时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer"></span>
      </el-dialog>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[7, 15, 25, 35]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data() {
    return {
      // 订单查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 7
      },
      // 订单列表
      orderList: [],
      // 订单数据总数
      total: 0,
      // 控制地址对话框的显示与否
      addressDialogVisible: false,
      // 修改地址表单对象
      editForm: {
        address1: '',
        address2: ''
      },
      // 修改地址表单验证规则
      editRules: {
        address1: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据
      cityData,
      // 级联选择器的双向绑定数据
      citykeys: [],
      // 级联选择器配置对象
      cityProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        expandTrigger: 'hover'
      },

      // 控制物流信息对话框的显示与否
      progressDialogVisible: false,
      // 物流信息
      progressInfo: []  
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      // 判断请求结果
      if (res.meta.status !== 200) {
        this.$message.error('获取订单失败')
      }
      // 请求成功
      console.log(res.data)
      this.total = res.data.total
      this.orderList = res.data.goods
    },

    // 分页大小改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 当前页数改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },

    // 修改地址对话框关闭，重置表单
    resetForm() {
      this.$refs.editFormRef.resetFields()
    },

    // 显示查看物流信息的对话框
    async showProgressInfo() {
      // 发送请求获取物流信息
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
      console.log(this.progressInfo)
    }
  }
}
</script>
