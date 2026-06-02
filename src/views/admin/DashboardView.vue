<script setup>
import { onMounted, ref } from 'vue'
import { Box, ShoppingCart, Tickets, User } from '@element-plus/icons-vue'
import { getAdminStats } from '@/api/admin'

const loading = ref(false)
const stats = ref({
  userCount: 0,
  productCount: 0,
  orderCount: 0,
  pendingOrderCount: 0
})

const cards = [
  { label: '用户总数', key: 'userCount', icon: User, color: '#2563eb' },
  { label: '商品总数', key: 'productCount', icon: Box, color: '#059669' },
  { label: '订单总数', key: 'orderCount', icon: Tickets, color: '#d97706' },
  { label: '待处理订单', key: 'pendingOrderCount', icon: ShoppingCart, color: '#dc2626' }
]

const load = async () => {
  loading.value = true
  try {
    stats.value = await getAdminStats()
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="admin-page" v-loading="loading">
    <div class="toolbar">
      <h2 class="section-title">后台首页</h2>
      <el-button type="primary" @click="load">刷新</el-button>
    </div>

    <section class="metric-grid">
      <article v-for="card in cards" :key="card.key" class="panel metric-card">
        <div class="metric-icon" :style="{ color: card.color, backgroundColor: `${card.color}14` }">
          <el-icon><component :is="card.icon" /></el-icon>
        </div>
        <div>
          <p>{{ card.label }}</p>
          <strong>{{ stats[card.key] || 0 }}</strong>
        </div>
      </article>
    </section>

    <section class="panel admin-note">
      <h3>运营待办</h3>
      <el-timeline>
        <el-timeline-item timestamp="商品管理">
          维护商品价格、库存、图片与上下架状态。
        </el-timeline-item>
        <el-timeline-item timestamp="订单管理">
          及时处理已支付订单，完成发货状态更新。
        </el-timeline-item>
        <el-timeline-item timestamp="分类管理">
          保持分类名称和排序清晰，方便用户筛选商品。
        </el-timeline-item>
      </el-timeline>
    </section>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 24px;
}

.metric-card p {
  margin: 0 0 8px;
  color: #6b7280;
}

.metric-card strong {
  font-size: 28px;
  color: #111827;
}

.admin-note {
  padding: 18px;
}

.admin-note h3 {
  margin: 0 0 14px;
}

@media (max-width: 980px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
