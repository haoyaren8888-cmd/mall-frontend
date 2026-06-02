<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createAdminCategory, deleteAdminCategory, getAdminCategories, updateAdminCategory } from '@/api/admin'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const categories = ref([])
const formRef = ref()
const filter = reactive({
  keyword: '',
  status: ''
})

const form = reactive({
  parentId: 0,
  name: '',
  sort: 0,
  status: 'ON'
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const categoryMap = computed(() => new Map(categories.value.map(item => [item.id, item.name])))
const parentOptions = computed(() => categories.value.filter(item => item.parentId === 0 && item.id !== editingId.value))
const filteredCategories = computed(() => categories.value.filter(item => {
  const keywordMatched = !filter.keyword || item.name.includes(filter.keyword.trim())
  const statusMatched = !filter.status || item.status === filter.status
  return keywordMatched && statusMatched
}))

const load = async () => {
  loading.value = true
  try {
    categories.value = await getAdminCategories()
  } finally {
    loading.value = false
  }
}

const resetForm = row => {
  Object.assign(form, {
    parentId: row?.parentId ?? 0,
    name: row?.name ?? '',
    sort: row?.sort ?? 0,
    status: row?.status ?? 'ON'
  })
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEdit = row => {
  editingId.value = row.id
  resetForm(row)
  dialogVisible.value = true
}

const submit = async () => {
  await formRef.value?.validate()
  saving.value = true
  try {
    const payload = { ...form }
    if (editingId.value) {
      await updateAdminCategory(editingId.value, payload)
      ElMessage.success('分类已更新')
    } else {
      await createAdminCategory(payload)
      ElMessage.success('分类已新增')
    }
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

const remove = async row => {
  const hasChild = categories.value.some(item => item.parentId === row.id)
  if (hasChild) {
    ElMessage.warning('请先删除或迁移子分类')
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  await deleteAdminCategory(row.id)
  ElMessage.success('分类已删除')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="admin-page">
    <div class="toolbar">
      <h2 class="section-title">分类管理</h2>
      <el-button type="primary" @click="openCreate">新增分类</el-button>
    </div>

    <section class="panel admin-filter">
      <el-input v-model="filter.keyword" clearable placeholder="搜索分类名称" class="filter-input" />
      <el-select v-model="filter.status" clearable placeholder="全部状态" class="filter-select">
        <el-option label="启用" value="ON" />
        <el-option label="停用" value="OFF" />
      </el-select>
      <el-button @click="filter.keyword = ''; filter.status = ''">重置</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="filteredCategories" row-key="id" empty-text="暂无分类">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="name" label="分类名称" min-width="180" />
        <el-table-column label="上级分类" min-width="160">
          <template #default="{ row }">{{ row.parentId === 0 ? '一级分类' : categoryMap.get(row.parentId) }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag class="status-tag" :type="row.status === 'ON' ? 'success' : 'info'">
              {{ row.status === 'ON' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button text type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑分类' : '新增分类'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" maxlength="40" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select v-model="form.parentId" class="form-wide">
            <el-option label="一级分类" :value="0" />
            <el-option v-for="item in parentOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :step="1" class="form-wide" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button label="ON">启用</el-radio-button>
            <el-radio-button label="OFF">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-wide {
  width: 100%;
}

.admin-filter {
  display: flex;
  gap: 12px;
  padding: 14px;
}

.filter-input,
.filter-select {
  width: 220px;
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
