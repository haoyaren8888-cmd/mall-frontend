<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminReviews, updateAdminReviewStatus } from '@/api/admin'

const loading = ref(false)
const reviews = ref([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: '',
  rating: ''
})

const statusMap = {
  ON: { text: '显示中', type: 'success' },
  HIDDEN: { text: '已隐藏', type: 'info' }
}

const load = async () => {
  loading.value = true
  try {
    const result = await getAdminReviews({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status || undefined,
      rating: query.rating || undefined
    })
    reviews.value = result.records || []
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
  query.keyword = ''
  query.status = ''
  query.rating = ''
  search()
}

const statusOf = value => statusMap[value] || { text: value || '-', type: 'info' }

const formatTime = value => {
  if (!value) {
    return '-'
  }
  return String(value).replace('T', ' ').slice(0, 19)
}

const changeStatus = async row => {
  const target = row.status === 'ON' ? 'HIDDEN' : 'ON'
  const actionText = target === 'ON' ? '恢复显示' : '隐藏'

  try {
    await ElMessageBox.confirm(`确定要${actionText}这条评价吗？`, `${actionText}确认`, {
      type: target === 'ON' ? 'info' : 'warning'
    })
  } catch {
    return
  }

  await updateAdminReviewStatus(row.id, target)
  ElMessage.success(`评价已${actionText}`)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="admin-page">
    <div class="toolbar">
      <h2 class="section-title">评价管理</h2>
      <el-button type="primary" @click="load">刷新</el-button>
    </div>

    <section class="panel admin-filter">
      <el-input
        v-model="query.keyword"
        clearable
        placeholder="搜索评价内容"
        class="filter-input"
        @keyup.enter="search"
      />
      <el-select v-model="query.status" clearable placeholder="全部状态" class="filter-select" @change="search">
        <el-option label="显示中" value="ON" />
        <el-option label="已隐藏" value="HIDDEN" />
      </el-select>
      <el-select v-model="query.rating" clearable placeholder="全部评分" class="filter-select" @change="search">
        <el-option label="5星" :value="5" />
        <el-option label="4星" :value="4" />
        <el-option label="3星" :value="3" />
        <el-option label="2星" :value="2" />
        <el-option label="1星" :value="1" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="reviews" empty-text="暂无评价">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productName" label="商品" min-width="170" show-overflow-tooltip />
        <el-table-column prop="orderNo" label="订单号" min-width="190" show-overflow-tooltip />
        <el-table-column label="评价人" min-width="150">
          <template #default="{ row }">
            <div class="reviewer">
              <strong>{{ row.nickname || row.username || '-' }}</strong>
              <span>{{ row.username || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="150">
          <template #default="{ row }">
            <el-rate :model-value="Number(row.rating || 0)" disabled />
          </template>
        </el-table-column>
        <el-table-column label="评价内容" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="review-content">{{ row.content || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusOf(row.status).type">{{ statusOf(row.status).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评价时间" min-width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button text :type="row.status === 'ON' ? 'danger' : 'success'" @click="changeStatus(row)">
              {{ row.status === 'ON' ? '隐藏' : '恢复' }}
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
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.filter-input {
  width: 260px;
}

.filter-select {
  width: 160px;
}

.reviewer {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer span {
  color: #6b7280;
  font-size: 12px;
}

.review-content {
  color: #374151;
  line-height: 1.5;
}

.pagination {
  justify-content: flex-end;
}

@media (max-width: 760px) {
  .admin-filter {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-input,
  .filter-select {
    width: 100%;
  }
}
</style>
