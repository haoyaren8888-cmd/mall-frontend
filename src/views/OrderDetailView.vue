<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelOrder, finishOrder, getOrderDetail } from '@/api/order'
import { createProductReview } from '@/api/product'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const reviewDialogVisible = ref(false)
const reviewSubmitting = ref(false)
const reviewForm = ref({
  productId: null,
  productName: '',
  rating: 5,
  content: ''
})

const statusMeta = {
  PENDING_PAY: { label: '待支付', type: 'warning', alertType: 'warning', tip: '交易已提交，完成支付后管理员会继续处理。' },
  PAID: { label: '已支付', type: 'success', alertType: 'success', tip: '交易已付款，等待管理员确认交付。' },
  SHIPPED: { label: '已交付', type: 'primary', alertType: 'info', tip: '后台已标记交付，确认无误后可以完成交易。' },
  FINISHED: { label: '已完成', type: 'info', alertType: 'info', tip: '交易已经完成。' },
  CANCELED: { label: '已取消', type: 'danger', alertType: 'error', tip: '交易已经取消，不能继续支付。' }
}

const currentStatus = computed(() => statusMeta[order.value?.status] || {
  label: order.value?.status || '未知状态',
  type: 'info',
  alertType: 'info',
  tip: '交易状态待确认。'
})
const canPay = computed(() => order.value?.status === 'PENDING_PAY')
const canCancel = computed(() => order.value?.status === 'PENDING_PAY')
const canFinish = computed(() => order.value?.status === 'SHIPPED')
const canReview = computed(() => order.value?.status === 'FINISHED')
const progressSteps = [
  { title: '提交交易', description: '生成交易单' },
  { title: '完成支付', description: '等待交付' },
  { title: '完成交付', description: '等待确认' },
  { title: '交易完成', description: '可以评价' }
]
const progressActive = computed(() => {
  const statusIndex = {
    PENDING_PAY: 0,
    PAID: 1,
    SHIPPED: 2,
    FINISHED: 3,
    CANCELED: 0
  }
  return statusIndex[order.value?.status] ?? 0
})
const progressStatus = computed(() => (order.value?.status === 'CANCELED' ? 'error' : 'process'))

const load = async () => {
  order.value = await getOrderDetail(route.params.orderNo)
}

const cancel = async () => {
  await ElMessageBox.confirm('确认取消这个待支付交易吗？', '取消交易', { type: 'warning' })
  await cancelOrder(order.value.orderNo)
  ElMessage.success('交易已取消')
  await load()
}

const finish = async () => {
  await ElMessageBox.confirm('确认已经完成这笔交易吗？', '确认完成', { type: 'warning' })
  await finishOrder(order.value.orderNo)
  ElMessage.success('交易已完成')
  await load()
}

const openReview = item => {
  reviewForm.value = {
    productId: item.productId,
    productName: item.productName,
    rating: 5,
    content: ''
  }
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  const content = reviewForm.value.content.trim()
  if (!content) {
    ElMessage.warning('请先填写评价内容')
    return
  }

  reviewSubmitting.value = true
  try {
    await createProductReview(reviewForm.value.productId, {
      orderNo: order.value.orderNo,
      rating: reviewForm.value.rating,
      content
    })
    ElMessage.success('评价已提交')
    reviewDialogVisible.value = false
  } finally {
    reviewSubmitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page" v-if="order">
    <section class="panel order-head">
      <div>
        <h2>交易详情</h2>
        <p class="muted">交易单号：{{ order.orderNo }}</p>
        <p class="muted">{{ order.receiverSnapshot }}</p>
        <el-alert class="status-alert" :title="currentStatus.tip" :type="currentStatus.alertType" :closable="false" show-icon />
        <div class="status-steps">
          <el-steps :active="progressActive" :process-status="progressStatus" finish-status="success" align-center>
            <el-step
              v-for="step in progressSteps"
              :key="step.title"
              :title="step.title"
              :description="step.description"
            />
          </el-steps>
        </div>
      </div>
      <div class="summary">
        <el-tag size="large" :type="currentStatus.type">{{ currentStatus.label }}</el-tag>
        <div class="price amount">¥{{ Number(order.totalAmount).toFixed(2) }}</div>
      </div>
    </section>
    <section class="panel items">
      <div v-for="item in order.items || []" :key="item.productId" class="order-item">
        <img :src="item.productImage" :alt="item.productName" />
        <span>{{ item.productName }}</span>
        <span>x {{ item.quantity }}</span>
        <span class="price">¥{{ Number(item.subtotal).toFixed(2) }}</span>
        <el-button v-if="canReview" size="small" type="primary" plain @click="openReview(item)">
          评价
        </el-button>
      </div>
    </section>
    <div class="actions">
      <el-button @click="router.push('/orders')">返回交易记录</el-button>
      <el-button v-if="canCancel" type="danger" plain @click="cancel">取消交易</el-button>
      <el-button v-if="canPay" type="primary" @click="router.push(`/pay/${order.orderNo}`)">去支付</el-button>
      <el-button v-if="canFinish" type="success" @click="finish">确认完成</el-button>
    </div>
    <el-dialog v-model="reviewDialogVisible" title="评价交易商品" width="420px">
      <div class="review-form">
        <strong>{{ reviewForm.productName }}</strong>
        <el-rate v-model="reviewForm.rating" />
        <el-input
          v-model="reviewForm.content"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="写下商品成色、交付体验或沟通感受"
        />
      </div>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewSubmitting" @click="submitReview">提交评价</el-button>
      </template>
    </el-dialog>
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

.status-steps {
  max-width: 640px;
  margin-top: 22px;
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
  grid-template-columns: 72px 1fr 80px 120px 76px;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #edf0f5;
}

.order-item .el-button {
  justify-self: end;
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

.review-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

  .status-steps {
    overflow-x: auto;
    padding-bottom: 4px;
  }
}
</style>
