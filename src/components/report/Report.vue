<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <!-- 2.为 ECharts 准备一个具备高宽的 DOM 容器 -->
      <div id="main" style="width: 800px;height:600px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1.导入echarts
import echarts from 'echarts'
import _ from 'lodash'

export default {
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  // 当页面dom元素加载完毕后，会执行mounted
  async mounted() {
    // 3.基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // 发送请求获取图表数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      this.$message.error('获取图标数据失败')
    }

    // 合并数据
    const option = _.merge(res.data, this.options)

    // 5.使用刚指定的配置项和数据显示图表。
    myChart.setOption(option)
  },
  methods: {}
}
</script>
