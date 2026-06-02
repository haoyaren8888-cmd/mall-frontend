<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  getAdminProducts,
  offProduct,
  onProduct,
  updateAdminProduct
} from '@/api/admin'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()
const products = ref([])
const categories = ref([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  categoryId: null
})

const form = reactive({
  categoryId: null,
  name: '',
  description: '',
  price: 0,
  stock: 0,
  coverImage: '',
  status: 'ON'
})

const rules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const categoryMap = computed(() => new Map(categories.value.map(item => [item.id, item.name])))

const loadCategories = async () => {
  categories.value = await getAdminCategories()
}

const load = async () => {
  loading.value = true
  try {
    const result = await getAdminProducts({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      categoryId: query.categoryId || undefined
    })
    products.value = result.records || []
    total.value = result.total || 0
  } finally {
    loading.value = false
  }
}

const search = () => {
  query.page = 1
  load()
}

const resetForm = row => {
  Object.assign(form, {
    categoryId: row?.categoryId ?? null,
    name: row?.name ?? '',
    description: row?.description ?? '',
    price: row?.price ?? 0,
    stock: row?.stock ?? 0,
    coverImage: row?.coverImage ?? '',
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
      await updateAdminProduct(editingId.value, payload)
      ElMessage.success('商品已更新')
    } else {
      await createAdminProduct(payload)
      ElMessage.success('商品已新增')
    }
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

const remove = async row => {
  try {
    await ElMessageBox.confirm(`确定删除商品「${row.name}」吗？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  await deleteAdminProduct(row.id)
  ElMessage.success('商品已删除')
  await load()
}

const toggleStatus = async row => {
  if (row.status === 'ON') {
    await offProduct(row.id)
    ElMessage.success('商品已下架')
  } else {
    await onProduct(row.id)
    ElMessage.success('商品已上架')
  }
  await load()
}

onMounted(async () => {
  await loadCategories()
  await load()
})
</script>

<template>
  <div class="admin-page">
    <div class="toolbar">
      <h2 class="section-title">商品管理</h2>
      <el-button type="primary" @click="openCreate">新增商品</el-button>
    </div>

    <section class="panel admin-filter">
      <el-input
        v-model="query.keyword"
        clearable
        placeholder="搜索商品名称"
        class="filter-input"
        @keyup.enter="search"
      />
      <el-select v-model="query.categoryId" clearable placeholder="全部分类" class="filter-select">
        <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="query.keyword = ''; query.categoryId = null; search()">重置</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="products" empty-text="暂无商品">
        <el-table-column label="图片" width="92">
          <template #default="{ row }">
            <el-image class="product-cover" :src="row.coverImage" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">{{ categoryMap.get(row.categoryId) || '-' }}</template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <span class="price">￥{{ Number(row.price).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column prop="sales" label="销量" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag class="status-tag" :type="row.status === 'ON' ? 'success' : 'info'">
              {{ row.status === 'ON' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button text :type="row.status === 'ON' ? 'warning' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 'ON' ? '下架' : '上架' }}
            </el-button>
            <el-button text type="danger" @click="remove(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑商品' : '新增商品'" width="620px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" maxlength="80" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" class="form-wide">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" class="form-wide" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :step="1" class="form-wide" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button label="ON">上架</el-radio-button>
            <el-radio-button label="OFF">下架</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图片地址">
          <el-input v-model="form.coverImage" maxlength="255" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="form.description" type="textarea" :rows="4" maxlength="500" show-word-limit />
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

.admin-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.filter-input,
.filter-select {
  width: 220px;
}

.product-cover {
  width: 64px;
  height: 52px;
  border-radius: 8px;
  background: #eef2f7;
}

.form-wide {
  width: 100%;
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
