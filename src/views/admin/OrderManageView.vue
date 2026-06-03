<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminOrders, shipOrder } from '@/api/admin'

const loading = ref(false)
const orders = ref([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 10,
  status: '',
  orderNo: ''
})

const statusMap = {
  PENDING_PAY: ['待支付', 'warning'],
  PAID: ['已支付', 'success'],
  SHIPPED: ['已交付', 'primary'],
  FINISHED: ['已完成', 'info'],
  CANCELED: ['已取消', 'danger']
}

const load = async () => {
  loading.value = true
  try {
    const result = await getAdminOrders({
      page: query.page,
      size: query.size,
      status: query.status || undefined,
      orderNo: query.orderNo || undefined
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

const ship = async row => {
  try {
    await ElMessageBox.confirm(`确定将交易 ${row.orderNo} 标记为已交付吗？`, '交付确认', { type: 'warning' })
  } catch {
    return
  }
  await shipOrder(row.orderNo)
  ElMessage.success('交易已交付')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="admin-page">
    <div class="toolbar">
      <h2 class="section-title">交易订单</h2>
      <el-button type="primary" @click="load">刷新</el-button>
    </div>

    <section class="panel admin-filter">
      <el-input
        v-model="query.orderNo"
        clearable
        placeholder="搜索交易单号"
        class="filter-input"
        @keyup.enter="search"
      />
      <el-select v-model="query.status" clearable placeholder="全部状态" class="filter-select" @change="search">
        <el-option label="待支付" value="PENDING_PAY" />
        <el-option label="已支付" value="PAID" />
        <el-option label="已交付" value="SHIPPED" />
        <el-option label="已完成" value="FINISHED" />
        <el-option label="已取消" value="CANCELED" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="query.status = ''; query.orderNo = ''; search()">重置</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="orders" empty-text="暂无交易订单">
        <el-table-column prop="orderNo" label="交易单号" min-width="190" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ Number(row.totalAmount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag class="status-tag" :type="statusMap[row.status]?.[1]">
              {{ statusMap[row.status]?.[0] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receiverSnapshot" label="联系信息" min-width="260" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="提交时间" min-width="170" />
        <el-table-column prop="paidAt" label="支付时间" min-width="170" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'PAID'" text type="primary" @click="ship(row)">标记交付</el-button>
            <span v-else class="muted">-</span>
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
  gap: 12px;
  padding: 14px;
}

.filter-select {
  width: 220px;
}

.filter-input {
  width: 240px;
}

.pagination {
  justify-content: flex-end;
}

@media (max-width: 720px) {
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
