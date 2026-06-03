<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelOrder, getOrders } from '@/api/order'

const router = useRouter()
const orders = ref([])
const page = ref(1)
const total = ref(0)

const statusMap = {
  PENDING_PAY: { label: '待支付', type: 'warning', tip: '等待完成模拟支付' },
  PAID: { label: '已支付', type: 'success', tip: '等待管理员确认交付' },
  SHIPPED: { label: '已交付', type: 'primary', tip: '后台已标记交付' },
  FINISHED: { label: '已完成', type: 'info', tip: '交易流程已结束' },
  CANCELED: { label: '已取消', type: 'danger', tip: '交易已取消' }
}

const statusOf = status => statusMap[status] || { label: status, type: 'info', tip: '状态待确认' }

const load = async () => {
  const result = await getOrders({ page: page.value, size: 10 })
  orders.value = result.records
  total.value = result.total
}

const cancel = async order => {
  await ElMessageBox.confirm('确认取消这个待支付交易吗？', '取消交易', { type: 'warning' })
  await cancelOrder(order.orderNo)
  ElMessage.success('交易已取消')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page">
    <h2 class="section-title">交易记录</h2>
    <section class="panel">
      <el-table :data="orders" empty-text="暂无交易记录">
        <el-table-column prop="orderNo" label="交易单号" min-width="180" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ Number(row.totalAmount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="180">
          <template #default="{ row }">
            <div class="status-cell">
              <el-tag class="status-tag" :type="statusOf(row.status).type">
                {{ statusOf(row.status).label }}
              </el-tag>
              <span class="status-note">{{ statusOf(row.status).tip }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="180" />
        <el-table-column label="操作" width="230">
          <template #default="{ row }">
            <div class="actions">
              <el-button text type="primary" @click="router.push(`/orders/${row.orderNo}`)">详情</el-button>
              <el-button v-if="row.status === 'PENDING_PAY'" text type="success" @click="router.push(`/pay/${row.orderNo}`)">
                支付
              </el-button>
              <el-button v-if="row.status === 'PENDING_PAY'" text type="danger" @click="cancel(row)">取消</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <el-pagination
      class="pagination"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="10"
      v-model:current-page="page"
      @current-change="load"
    />
  </div>
</template>

<style scoped>
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

.actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  margin-top: 18px;
  justify-content: center;
}
</style>
