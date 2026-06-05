<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Box, ShoppingCart, Tickets, User } from '@element-plus/icons-vue'
import { getAdminStats } from '@/api/admin'

const router = useRouter()
const loading = ref(false)
const stats = ref({
  userCount: 0,
  enabledUserCount: 0,
  disabledUserCount: 0,
  productCount: 0,
  orderCount: 0,
  pendingOrderCount: 0
})

const cards = [
  { label: '用户总数', key: 'userCount', icon: User, color: '#2563eb', route: '/admin/users' },
  { label: '闲置商品总数', key: 'productCount', icon: Box, color: '#059669' },
  { label: '交易订单总数', key: 'orderCount', icon: Tickets, color: '#d97706' },
  { label: '待处理交易', key: 'pendingOrderCount', icon: ShoppingCart, color: '#dc2626' }
]

const goCard = card => {
  if (card.route) {
    router.push(card.route)
  }
}

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
      <article
        v-for="card in cards"
        :key="card.key"
        class="panel metric-card"
        :class="{ 'is-link': card.route }"
        @click="goCard(card)"
      >
        <div class="metric-icon" :style="{ color: card.color, backgroundColor: `${card.color}14` }">
          <el-icon><component :is="card.icon" /></el-icon>
        </div>
        <div>
          <p>{{ card.label }}</p>
          <strong>{{ stats[card.key] || 0 }}</strong>
        </div>
      </article>
    </section>

    <section class="panel user-status">
      <div>
        <h3>账号状态</h3>
        <p class="muted">后台用户管理同步统计</p>
      </div>
      <div class="user-status-items">
        <div class="status-box enabled">
          <span>正常账号</span>
          <strong>{{ stats.enabledUserCount || 0 }}</strong>
        </div>
        <div class="status-box disabled">
          <span>禁用账号</span>
          <strong>{{ stats.disabledUserCount || 0 }}</strong>
        </div>
      </div>
    </section>

    <section class="panel admin-note">
      <h3>运营待办</h3>
      <el-timeline>
        <el-timeline-item timestamp="闲置商品审核">
          审核学生发布的闲置商品，维护价格、图片、成色与上下架状态。
        </el-timeline-item>
        <el-timeline-item timestamp="交易交付">
          及时处理已支付交易，完成校内交付状态更新。
        </el-timeline-item>
        <el-timeline-item timestamp="分类管理">
          保持分类名称和排序清晰，方便同学筛选闲置商品。
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

.metric-card.is-link {
  cursor: pointer;
}

.metric-card.is-link:hover {
  border-color: #bfdbfe;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
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

.user-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
}

.user-status h3 {
  margin: 0 0 6px;
}

.user-status p {
  margin: 0;
}

.user-status-items {
  display: flex;
  gap: 12px;
}

.status-box {
  min-width: 136px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.status-box span {
  display: block;
  margin-bottom: 6px;
  color: #6b7280;
}

.status-box strong {
  font-size: 24px;
}

.status-box.enabled strong {
  color: #059669;
}

.status-box.disabled strong {
  color: #dc2626;
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

  .user-status,
  .user-status-items {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
