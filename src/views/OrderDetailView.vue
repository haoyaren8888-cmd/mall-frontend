<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelOrder, getOrderDetail } from '@/api/order'

const route = useRoute()
const router = useRouter()
const order = ref(null)

const statusMeta = {
  PENDING_PAY: { label: '待支付', type: 'warning', alertType: 'warning', tip: '订单已提交，完成支付后后台才能继续发货。' },
  PAID: { label: '已支付', type: 'success', alertType: 'success', tip: '订单已付款，等待管理员在后台发货。' },
  SHIPPED: { label: '已发货', type: 'primary', alertType: 'info', tip: '订单已由后台发货，等待后续确认完成。' },
  FINISHED: { label: '已完成', type: 'info', alertType: 'info', tip: '订单已经完成。' },
  CANCELED: { label: '已取消', type: 'danger', alertType: 'error', tip: '订单已经取消，不能继续支付。' }
}

const currentStatus = computed(() => statusMeta[order.value?.status] || {
  label: order.value?.status || '未知状态',
  type: 'info',
  alertType: 'info',
  tip: '订单状态待确认。'
})
const canPay = computed(() => order.value?.status === 'PENDING_PAY')
const canCancel = computed(() => order.value?.status === 'PENDING_PAY')

const load = async () => {
  order.value = await getOrderDetail(route.params.orderNo)
}

const cancel = async () => {
  await ElMessageBox.confirm('确认取消这个待支付订单吗？', '取消订单', { type: 'warning' })
  await cancelOrder(order.value.orderNo)
  ElMessage.success('订单已取消')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page" v-if="order">
    <section class="panel order-head">
      <div>
        <h2>订单详情</h2>
        <p class="muted">订单号：{{ order.orderNo }}</p>
        <p class="muted">{{ order.receiverSnapshot }}</p>
        <el-alert class="status-alert" :title="currentStatus.tip" :type="currentStatus.alertType" :closable="false" show-icon />
      </div>
      <div class="summary">
        <el-tag size="large" :type="currentStatus.type">{{ currentStatus.label }}</el-tag>
        <div class="price amount">￥{{ Number(order.totalAmount).toFixed(2) }}</div>
      </div>
    </section>
    <section class="panel items">
      <div v-for="item in order.items || []" :key="item.productId" class="order-item">
        <img :src="item.productImage" :alt="item.productName" />
        <span>{{ item.productName }}</span>
        <span>x {{ item.quantity }}</span>
        <span class="price">￥{{ Number(item.subtotal).toFixed(2) }}</span>
      </div>
    </section>
    <div class="actions">
      <el-button @click="router.push('/orders')">返回订单列表</el-button>
      <el-button v-if="canCancel" type="danger" plain @click="cancel">取消订单</el-button>
      <el-button v-if="canPay" type="primary" @click="router.push(`/pay/${order.orderNo}`)">去支付</el-button>
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

.status-alert {
  max-width: 560px;
  margin-top: 14px;
}

.summary {
  min-width: 150px;
  text-align: right;
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
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

@media (max-width: 720px) {
  .order-head,
  .actions {
    flex-direction: column;
  }

  .summary {
    text-align: left;
  }

  .order-item {
    grid-template-columns: 72px 1fr;
  }
}
</style>
