<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminUsers, updateAdminUserStatus } from '@/api/admin'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const loading = ref(false)
const users = ref([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: ''
})

const statusMap = {
  ENABLED: { text: '正常', type: 'success' },
  DISABLED: { text: '禁用', type: 'danger' }
}

const roleMap = {
  ADMIN: { text: '管理员', type: 'warning' },
  USER: { text: '普通用户', type: 'info' }
}

const load = async () => {
  loading.value = true
  try {
    const result = await getAdminUsers({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status || undefined
    })
    users.value = result.records || []
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
  search()
}

const formatTime = value => {
  if (!value) {
    return '-'
  }
  return String(value).replace('T', ' ').slice(0, 19)
}

const statusOf = value => statusMap[value] || { text: value || '-', type: 'info' }
const roleOf = value => roleMap[value] || { text: value || '-', type: 'info' }

const changeStatus = async row => {
  const target = row.status === 'ENABLED' ? 'DISABLED' : 'ENABLED'
  const actionText = target === 'ENABLED' ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}用户「${row.nickname || row.username}」吗？`, `${actionText}确认`, {
      type: target === 'ENABLED' ? 'info' : 'warning'
    })
  } catch {
    return
  }

  await updateAdminUserStatus(row.id, target)
  ElMessage.success(`用户已${actionText}`)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="admin-page">
    <div class="toolbar">
      <h2 class="section-title">用户管理</h2>
      <el-button type="primary" @click="load">刷新</el-button>
    </div>

    <section class="panel admin-filter">
      <el-input
        v-model="query.keyword"
        clearable
        placeholder="搜索账号、姓名、手机号或学号"
        class="filter-input"
        @keyup.enter="search"
      />
      <el-select v-model="query.status" clearable placeholder="全部状态" class="filter-select" @change="search">
        <el-option label="正常" value="ENABLED" />
        <el-option label="禁用" value="DISABLED" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="users" empty-text="暂无用户">
        <el-table-column prop="username" label="账号" min-width="130" />
        <el-table-column prop="nickname" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="studentNo" label="学号" min-width="130" />
        <el-table-column prop="campus" label="校区" width="110" />
        <el-table-column prop="college" label="学院" min-width="150" show-overflow-tooltip />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleOf(row.role).type">{{ roleOf(row.role).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="信用分" width="90">
          <template #default="{ row }">{{ row.creditScore ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="交易数" width="90">
          <template #default="{ row }">{{ row.dealCount ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag class="status-tag" :type="statusOf(row.status).type">
              {{ statusOf(row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" min-width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button
              text
              :type="row.status === 'ENABLED' ? 'danger' : 'success'"
              :disabled="row.id === userStore.user?.id && row.status === 'ENABLED'"
              @click="changeStatus(row)"
            >
              {{ row.status === 'ENABLED' ? '禁用' : '启用' }}
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
  width: 300px;
}

.filter-select {
  width: 180px;
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
