<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminMessages, updateAdminMessageStatus } from '@/api/admin'

const loading = ref(false)
const messages = ref([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: '',
  replied: ''
})

const statusMap = {
  ON: { text: '显示中', type: 'success' },
  HIDDEN: { text: '已隐藏', type: 'info' }
}

const load = async () => {
  loading.value = true
  try {
    const result = await getAdminMessages({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status || undefined,
      replied: query.replied === '' ? undefined : query.replied
    })
    messages.value = result.records || []
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
  query.replied = ''
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
    await ElMessageBox.confirm(`确定要${actionText}这条留言吗？`, `${actionText}确认`, {
      type: target === 'ON' ? 'info' : 'warning'
    })
  } catch {
    return
  }

  await updateAdminMessageStatus(row.id, target)
  ElMessage.success(`留言已${actionText}`)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="admin-page">
    <div class="toolbar">
      <h2 class="section-title">留言管理</h2>
      <el-button type="primary" @click="load">刷新</el-button>
    </div>

    <section class="panel admin-filter">
      <el-input
        v-model="query.keyword"
        clearable
        placeholder="搜索留言或回复内容"
        class="filter-input"
        @keyup.enter="search"
      />
      <el-select v-model="query.status" clearable placeholder="全部状态" class="filter-select" @change="search">
        <el-option label="显示中" value="ON" />
        <el-option label="已隐藏" value="HIDDEN" />
      </el-select>
      <el-select v-model="query.replied" clearable placeholder="回复情况" class="filter-select" @change="search">
        <el-option label="已回复" :value="true" />
        <el-option label="未回复" :value="false" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="messages" empty-text="暂无留言">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productName" label="商品" min-width="180" show-overflow-tooltip />
        <el-table-column label="留言人" min-width="150">
          <template #default="{ row }">
            <div class="message-user">
              <strong>{{ row.nickname || row.username || '-' }}</strong>
              <span>{{ row.campus || '校内' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="留言内容" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="message-text">{{ row.content || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="卖家回复" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="row.replyContent ? 'message-text' : 'empty-reply'">
              {{ row.replyContent || '暂未回复' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusOf(row.status).type">{{ statusOf(row.status).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="留言时间" min-width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="回复时间" min-width="170">
          <template #default="{ row }">{{ formatTime(row.replyAt) }}</template>
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

.message-user {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-user span {
  color: #6b7280;
  font-size: 12px;
}

.message-text {
  color: #374151;
  line-height: 1.5;
}

.empty-reply {
  color: #9ca3af;
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
