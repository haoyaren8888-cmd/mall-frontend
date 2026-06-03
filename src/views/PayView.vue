<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderDetail } from '@/api/order'
import { mockPay } from '@/api/payment'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const paying = ref(false)

const statusMeta = {
  PENDING_PAY: { label: '待支付', type: 'warning', tip: '交易单已创建，确认金额无误后可以完成模拟支付。' },
  PAID: { label: '已支付', type: 'success', tip: '交易已经支付成功，可以在详情里查看处理进度。' },
  SHIPPED: { label: '已交付', type: 'primary', tip: '交易已经标记交付，不需要重复支付。' },
  FINISHED: { label: '已完成', type: 'info', tip: '交易已经完成，不需要重复支付。' },
  CANCELED: { label: '已取消', type: 'danger', tip: '交易已经取消，不能继续支付。' }
}

const currentStatus = computed(() => statusMeta[order.value?.status] || {
  label: order.value?.status || '未知状态',
  type: 'info',
  tip: '交易状态异常，请返回详情确认。'
})
const canPay = computed(() => order.value?.status === 'PENDING_PAY')

const load = async () => {
  order.value = await getOrderDetail(route.params.orderNo)
}

const pay = async () => {
  if (!canPay.value) {
    ElMessage.warning(currentStatus.value.tip)
    return
  }
  paying.value = true
  try {
    await mockPay(order.value.orderNo)
    ElMessage.success('支付成功，交易状态已更新')
    router.replace(`/orders/${order.value.orderNo}`)
  } finally {
    paying.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page pay-page" v-if="order">
    <section class="panel pay-panel">
      <div class="pay-title">
        <h2>模拟支付</h2>
        <el-tag :type="currentStatus.type">{{ currentStatus.label }}</el-tag>
      </div>
      <p class="muted">交易单号：{{ order.orderNo }}</p>
      <el-alert class="pay-alert" :title="currentStatus.tip" :closable="false" show-icon />
      <div class="pay-amount">¥{{ Number(order.totalAmount).toFixed(2) }}</div>
      <div class="pay-actions">
        <el-button type="primary" size="large" :loading="paying" :disabled="!canPay" @click="pay">
          确认支付
        </el-button>
        <el-button size="large" @click="router.push(`/orders/${order.orderNo}`)">查看交易</el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pay-page {
  display: flex;
  justify-content: center;
}

.pay-panel {
  width: min(480px, 100%);
  padding: 36px;
  text-align: center;
}

.pay-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
}

.pay-alert {
  margin-top: 18px;
  text-align: left;
}

.pay-amount {
  margin: 24px 0;
  color: #d0382b;
  font-size: 38px;
  font-weight: 800;
}

.pay-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 560px) {
  .pay-panel {
    padding: 24px 18px;
  }

  .pay-actions {
    flex-direction: column;
  }
}
</style>
