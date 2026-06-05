<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalesOrderDetail, shipSalesOrder } from '@/api/order'

const route = useRoute()
const router = useRouter()
const order = ref(null)

const statusMeta = {
  PENDING_PAY: { label: '待付款', type: 'warning', alertType: 'warning', tip: '买家还没有完成付款，暂时不用交付。' },
  PAID: { label: '已付款', type: 'success', alertType: 'success', tip: '买家已付款，可以联系买家完成线下交付。' },
  SHIPPED: { label: '已交付', type: 'primary', alertType: 'info', tip: '已确认交付，等待买家确认完成。' },
  FINISHED: { label: '已完成', type: 'info', alertType: 'info', tip: '这笔交易已经完成。' },
  CANCELED: { label: '已取消', type: 'danger', alertType: 'error', tip: '这笔交易已经取消。' }
}

const currentStatus = computed(() => statusMeta[order.value?.status] || {
  label: order.value?.status || '未知状态',
  type: 'info',
  alertType: 'info',
  tip: '交易状态待确认。'
})
const canShip = computed(() => order.value?.status === 'PAID')
const money = value => Number(value || 0).toFixed(2)

const load = async () => {
  order.value = await getSalesOrderDetail(route.params.orderNo)
}

const ship = async () => {
  await ElMessageBox.confirm('确认已经和买家完成交付吗？', '确认交付', { type: 'warning' })
  await shipSalesOrder(order.value.orderNo)
  ElMessage.success('已确认交付')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page" v-if="order">
    <section class="panel order-head">
      <div>
        <h2>卖出交易详情</h2>
        <p class="muted">交易单号：{{ order.orderNo }}</p>
        <p class="muted">{{ order.receiverSnapshot }}</p>
        <el-alert class="status-alert" :title="currentStatus.tip" :type="currentStatus.alertType" :closable="false" show-icon />
      </div>
      <div class="summary">
        <el-tag size="large" :type="currentStatus.type">{{ currentStatus.label }}</el-tag>
        <div class="price amount">￥{{ money(order.totalAmount) }}</div>
        <p class="muted">我的成交金额</p>
      </div>
    </section>

    <section class="panel items">
      <div v-for="item in order.items || []" :key="item.productId" class="order-item">
        <img :src="item.productImage" :alt="item.productName" />
        <div class="item-main">
          <button class="item-name" type="button" @click="router.push(`/product/${item.productId}`)">
            {{ item.productName }}
          </button>
          <span class="muted">单价 ￥{{ money(item.price) }}</span>
        </div>
        <span>x {{ item.quantity }}</span>
        <span class="price">￥{{ money(item.subtotal) }}</span>
      </div>
    </section>

    <div class="actions">
      <el-button @click="router.push('/sales-orders')">返回我卖出的</el-button>
      <el-button v-if="canShip" type="success" @click="ship">确认交付</el-button>
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
  min-width: 160px;
  text-align: right;
}

.summary p {
  margin: 6px 0 0;
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
  grid-template-columns: 72px minmax(0, 1fr) 80px 120px;
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

.item-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.item-name {
  padding: 0;
  color: #166534;
  font: inherit;
  font-weight: 700;
  text-align: left;
  background: none;
  border: 0;
  cursor: pointer;
}

.item-name:hover {
  color: #15803d;
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
