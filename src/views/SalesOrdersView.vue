<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalesOrders, shipSalesOrder } from '@/api/order'

const router = useRouter()
const orders = ref([])
const total = ref(0)
const loading = ref(false)

const query = reactive({
  page: 1,
  size: 10,
  status: ''
})

const statusOptions = [
  { label: '全部交易', value: '' },
  { label: '待付款', value: 'PENDING_PAY' },
  { label: '已付款', value: 'PAID' },
  { label: '已交付', value: 'SHIPPED' },
  { label: '已完成', value: 'FINISHED' },
  { label: '已取消', value: 'CANCELED' }
]

const statusMap = {
  PENDING_PAY: { label: '待付款', type: 'warning', note: '买家尚未支付' },
  PAID: { label: '已付款', type: 'success', note: '等待卖家交付' },
  SHIPPED: { label: '已交付', type: 'primary', note: '等待买家确认' },
  FINISHED: { label: '已完成', type: 'info', note: '交易已结束' },
  CANCELED: { label: '已取消', type: 'danger', note: '交易已取消' }
}

const statusOf = status => statusMap[status] || { label: status, type: 'info', note: '状态待确认' }
const money = value => Number(value || 0).toFixed(2)

const productNames = items => {
  if (!items || !items.length) {
    return '暂无商品明细'
  }
  return items.map(item => `${item.productName} x${item.quantity}`).join('、')
}

const load = async () => {
  loading.value = true
  try {
    const result = await getSalesOrders({
      page: query.page,
      size: query.size,
      status: query.status || undefined
    })
    orders.value = result.records || []
    total.value = result.total || 0
  } finally {
    loading.value = false
  }
}

const search = () => {
  query.page = 1
  load()
}

const reset = () => {
  query.status = ''
  search()
}

const ship = async order => {
  await ElMessageBox.confirm('确认已经和买家完成交付吗？', '确认交付', { type: 'warning' })
  await shipSalesOrder(order.orderNo)
  ElMessage.success('已确认交付')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <div>
        <h2 class="section-title">我卖出的交易</h2>
        <p class="muted">查看自己发布商品产生的交易和交付状态。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <section class="panel sales-filter">
      <el-select v-model="query.status" clearable placeholder="全部状态" class="status-select" @change="search">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="orders" empty-text="暂无卖出交易">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="sold-items">
              <div v-for="item in row.items" :key="item.productId" class="sold-item">
                <el-image class="item-cover" :src="item.productImage" fit="cover" />
                <div class="item-main">
                  <button class="item-name" type="button" @click="router.push(`/product/${item.productId}`)">
                    {{ item.productName }}
                  </button>
                  <span class="muted">数量 {{ item.quantity }}，单价 ￥{{ money(item.price) }}</span>
                </div>
                <span class="price">￥{{ money(item.subtotal) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="交易单号" min-width="180" />
        <el-table-column label="商品" min-width="240">
          <template #default="{ row }">
            <span class="product-summary">{{ productNames(row.items) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="我的金额" width="130">
          <template #default="{ row }">
            <span class="price">￥{{ money(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="160">
          <template #default="{ row }">
            <div class="status-cell">
              <el-tag class="status-tag" :type="statusOf(row.status).type">
                {{ statusOf(row.status).label }}
              </el-tag>
              <span class="status-note">{{ statusOf(row.status).note }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="receiverSnapshot" label="买家联系信息" min-width="220" />
        <el-table-column prop="createdAt" label="提交时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.status === 'PAID'" text type="success" @click="ship(row)">
              确认交付
            </el-button>
            <span v-else class="muted">-</span>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-pagination
      class="pagination"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="query.size"
      v-model:current-page="query.page"
      @current-change="load"
    />
  </div>
</template>

<style scoped>
.toolbar p {
  margin: 4px 0 0;
}

.sales-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin: 16px 0;
}

.status-select {
  width: 180px;
}

.status-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.status-note {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
}

.product-summary {
  color: #374151;
  line-height: 1.5;
}

.sold-items {
  display: grid;
  gap: 10px;
  padding: 12px 24px;
  background: #f9fafb;
}

.sold-item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 110px;
  align-items: center;
  gap: 12px;
}

.item-cover {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  background: #eef2f7;
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

.pagination {
  margin-top: 18px;
  justify-content: center;
}

@media (max-width: 720px) {
  .sales-filter {
    align-items: stretch;
    flex-direction: column;
  }

  .status-select {
    width: 100%;
  }

  .sold-item {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .sold-item .price {
    grid-column: 2;
  }
}
</style>
