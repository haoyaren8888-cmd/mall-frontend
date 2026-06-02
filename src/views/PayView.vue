<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderDetail } from '@/api/order'
import { mockPay } from '@/api/payment'

const route = useRoute()
const router = useRouter()
const order = ref(null)

const load = async () => {
  order.value = await getOrderDetail(route.params.orderNo)
}

const pay = async () => {
  await mockPay(order.value.orderNo)
  ElMessage.success('支付成功')
  router.push(`/orders/${order.value.orderNo}`)
}

onMounted(load)
</script>

<template>
  <div class="page pay-page" v-if="order">
    <section class="panel pay-panel">
      <h2>模拟支付</h2>
      <p class="muted">订单号：{{ order.orderNo }}</p>
      <div class="pay-amount">￥{{ Number(order.totalAmount).toFixed(2) }}</div>
      <el-button type="primary" size="large" :disabled="order.status !== 'PENDING_PAY'" @click="pay">
        确认支付
      </el-button>
      <el-button @click="router.push(`/orders/${order.orderNo}`)">查看订单</el-button>
    </section>
  </div>
</template>

<style scoped>
.pay-page {
  display: flex;
  justify-content: center;
}

.pay-panel {
  width: min(460px, 100%);
  padding: 36px;
  text-align: center;
}

h2 {
  margin: 0 0 12px;
}

.pay-amount {
  margin: 24px 0;
  color: #d0382b;
  font-size: 38px;
  font-weight: 800;
}
</style>
