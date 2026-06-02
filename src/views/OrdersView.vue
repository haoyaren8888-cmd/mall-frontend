<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cancelOrder, getOrders } from '@/api/order'

const router = useRouter()
const orders = ref([])
const page = ref(1)
const total = ref(0)

const statusMap = {
  PENDING_PAY: ['待支付', 'warning'],
  PAID: ['已支付', 'success'],
  SHIPPED: ['已发货', 'primary'],
  FINISHED: ['已完成', 'info'],
  CANCELED: ['已取消', 'danger']
}

const load = async () => {
  const result = await getOrders({ page: page.value, size: 10 })
  orders.value = result.records
  total.value = result.total
}

const cancel = async order => {
  await cancelOrder(order.orderNo)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page">
    <h2 class="section-title">我的订单</h2>
    <section class="panel">
      <el-table :data="orders" empty-text="暂无订单">
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span class="price">￥{{ Number(row.totalAmount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag class="status-tag" :type="statusMap[row.status]?.[1]">
              {{ statusMap[row.status]?.[0] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180" />
        <el-table-column label="操作" width="230">
          <template #default="{ row }">
            <el-button text type="primary" @click="router.push(`/orders/${row.orderNo}`)">详情</el-button>
            <el-button v-if="row.status === 'PENDING_PAY'" text type="success" @click="router.push(`/pay/${row.orderNo}`)">
              支付
            </el-button>
            <el-button v-if="row.status === 'PENDING_PAY'" text type="danger" @click="cancel(row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <el-pagination
      class="pagination"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="10"
      v-model:current-page="page"
      @current-change="load"
    />
  </div>
</template>

<style scoped>
.pagination {
  margin-top: 18px;
  justify-content: center;
}
</style>
