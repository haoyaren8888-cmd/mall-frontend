<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyProducts, offShelfProduct } from '@/api/product'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 8,
  itemStatus: ''
})

const itemStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '在售', value: 'ON_SALE' },
  { label: '已下架', value: 'OFF_SHELF' },
  { label: '已成交', value: 'SOLD' }
]

const auditMap = {
  PENDING: { text: '待审核', type: 'warning' },
  APPROVED: { text: '已通过', type: 'success' },
  REJECTED: { text: '未通过', type: 'danger' }
}

const itemMap = {
  ON_SALE: { text: '在售', type: 'success' },
  OFF_SHELF: { text: '已下架', type: 'info' },
  SOLD: { text: '已成交', type: 'warning' }
}

const formatPrice = value => {
  const price = Number(value)
  return Number.isFinite(price) ? price.toFixed(2) : '0.00'
}

const statusOf = (map, value) => map[value] || { text: value || '-', type: 'info' }

const load = async () => {
  loading.value = true
  try {
    const result = await getMyProducts({
      page: query.page,
      size: query.size,
      itemStatus: query.itemStatus
    })
    products.value = result.records || []
    total.value = Number(result.total || 0)
  } finally {
    loading.value = false
  }
}

const changeStatus = () => {
  query.page = 1
  load()
}

const offShelf = async row => {
  try {
    await ElMessageBox.confirm(`确定下架「${row.name}」吗？`, '下架确认', { type: 'warning' })
  } catch {
    return
  }
  await offShelfProduct(row.id)
  ElMessage.success('已下架')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page my-products-page">
    <div class="toolbar">
      <div>
        <h2 class="section-title">我的发布</h2>
        <p class="muted">查看自己发布的闲置商品、审核进度和在售状态。</p>
      </div>
      <el-button type="primary" @click="router.push('/publish')">继续发布</el-button>
    </div>

    <section class="panel filter-panel">
      <el-select v-model="query.itemStatus" class="status-select" @change="changeStatus">
        <el-option v-for="item in itemStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="products" empty-text="还没有发布闲置">
        <el-table-column label="图片" width="96">
          <template #default="{ row }">
            <el-image class="cover" :src="row.coverImage" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="闲置商品" min-width="190">
          <template #default="{ row }">
            <div class="name-cell">
              <strong>{{ row.name }}</strong>
              <span>{{ row.campus || '校内' }} · {{ row.tradePlace || '地点待沟通' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="转让价" width="110">
          <template #default="{ row }">
            <span class="price">¥{{ formatPrice(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="conditionLevel" label="成色" width="100" />
        <el-table-column label="审核" width="100">
          <template #default="{ row }">
            <el-tag :type="statusOf(auditMap, row.auditStatus).type">
              {{ statusOf(auditMap, row.auditStatus).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusOf(itemMap, row.itemStatus).type">
              {{ statusOf(itemMap, row.itemStatus).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" width="170" />
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button
              text
              type="primary"
              :disabled="row.auditStatus !== 'APPROVED'"
              @click="router.push(`/product/${row.id}`)"
            >
              查看
            </el-button>
            <el-button
              text
              type="primary"
              :disabled="row.itemStatus === 'SOLD'"
              @click="router.push(`/my-products/${row.id}/edit`)"
            >
              编辑
            </el-button>
            <el-button
              text
              type="warning"
              :disabled="row.itemStatus !== 'ON_SALE'"
              @click="offShelf(row)"
            >
              下架
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="query.size"
      v-model:current-page="query.page"
      @current-change="load"
    />
  </div>
</template>

<style scoped>
.my-products-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar p {
  margin: 4px 0 0;
}

.filter-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.status-select {
  width: 180px;
}

.cover {
  width: 64px;
  height: 52px;
  border-radius: 8px;
  background: #eef2f7;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-cell span {
  color: #64748b;
  font-size: 13px;
}

.pagination {
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .filter-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .status-select {
    width: 100%;
  }
}
</style>
