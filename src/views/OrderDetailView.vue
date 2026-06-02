<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail } from '@/api/order'

const route = useRoute()
const router = useRouter()
const order = ref(null)

const statusText = {
  PENDING_PAY: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  FINISHED: '已完成',
  CANCELED: '已取消'
}

onMounted(async () => {
  order.value = await getOrderDetail(route.params.orderNo)
})
</script>

<template>
  <div class="page" v-if="order">
    <section class="panel order-head">
      <div>
        <h2>订单详情</h2>
        <p class="muted">订单号：{{ order.orderNo }}</p>
        <p class="muted">{{ order.receiverSnapshot }}</p>
      </div>
      <div>
        <el-tag size="large">{{ statusText[order.status] || order.status }}</el-tag>
        <div class="price amount">￥{{ Number(order.totalAmount).toFixed(2) }}</div>
      </div>
    </section>
    <section class="panel items">
      <div v-for="item in order.items" :key="item.productId" class="order-item">
        <img :src="item.productImage" :alt="item.productName" />
        <span>{{ item.productName }}</span>
        <span>x {{ item.quantity }}</span>
        <span class="price">￥{{ Number(item.subtotal).toFixed(2) }}</span>
      </div>
    </section>
    <div class="actions">
      <el-button @click="router.push('/orders')">返回订单列表</el-button>
      <el-button v-if="order.status === 'PENDING_PAY'" type="primary" @click="router.push(`/pay/${order.orderNo}`)">去支付</el-button>
    </div>
  </div>
</template>

<style scoped>
.order-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
  margin-bottom: 16px;
}

h2 {
  margin: 0 0 8px;
}

.amount {
  margin-top: 12px;
  font-size: 24px;
}

.items {
  padding: 8px 18px;
}

.order-item {
  display: grid;
  grid-template-columns: 72px 1fr 80px 120px;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #edf0f5;
}

img {
  width: 72px;
  height: 58px;
  border-radius: 8px;
  object-fit: cover;
}

.actions {
  margin-top: 18px;
}
</style>
