<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  approveAdminProduct,
  createAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  getAdminProducts,
  offProduct,
  onProduct,
  rejectAdminProduct,
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
  categoryId: null,
  auditStatus: '',
  itemStatus: ''
})

const form = reactive({
  categoryId: null,
  name: '',
  description: '',
  price: 0,
  originalPrice: null,
  stock: 0,
  coverImage: '',
  status: 'ON',
  conditionLevel: '九成新',
  campus: '明向校区',
  tradePlace: '图书馆门口',
  tradeType: '线下面交',
  auditStatus: 'APPROVED',
  itemStatus: 'ON_SALE'
})

const campusOptions = ['明向校区', '迎西校区', '虎峪校区']
const conditionOptions = ['全新', '九成新', '八成新', '七成新', '轻微使用痕迹']
const tradeTypeOptions = ['线下面交', '校内自提', '送到宿舍楼下']

const auditOptions = [
  { label: '全部审核', value: '' },
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '未通过', value: 'REJECTED' }
]

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

const rules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const categoryMap = computed(() => new Map(categories.value.map(item => [item.id, item.name])))

const statusOf = (map, value) => map[value] || { text: value || '-', type: 'info' }

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
      categoryId: query.categoryId || undefined,
      auditStatus: query.auditStatus || undefined,
      itemStatus: query.itemStatus || undefined
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
    originalPrice: row?.originalPrice ?? null,
    stock: row?.stock ?? 0,
    coverImage: row?.coverImage ?? '',
    status: row?.status ?? 'ON',
    conditionLevel: row?.conditionLevel ?? '九成新',
    campus: row?.campus ?? '明向校区',
    tradePlace: row?.tradePlace ?? '图书馆门口',
    tradeType: row?.tradeType ?? '线下面交',
    auditStatus: row?.auditStatus ?? 'APPROVED',
    itemStatus: row?.itemStatus ?? 'ON_SALE'
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

const approve = async row => {
  await approveAdminProduct(row.id)
  ElMessage.success('已审核通过')
  await load()
}

const reject = async row => {
  let reason = '信息不完整，请修改后重新发布'
  try {
    const result = await ElMessageBox.prompt('填写驳回原因', `驳回「${row.name}」`, {
      inputValue: reason,
      inputPlaceholder: '例如 图片不清晰、描述不完整',
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      type: 'warning'
    })
    reason = result.value || reason
  } catch {
    return
  }
  await rejectAdminProduct(row.id, reason)
  ElMessage.success('已驳回')
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
        placeholder="搜索闲置商品"
        class="filter-input"
        @keyup.enter="search"
      />
      <el-select v-model="query.categoryId" clearable placeholder="全部分类" class="filter-select">
        <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="query.auditStatus" class="filter-select">
        <el-option v-for="item in auditOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="query.itemStatus" class="filter-select">
        <el-option v-for="item in itemStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="query.keyword = ''; query.categoryId = null; query.auditStatus = ''; query.itemStatus = ''; search()">
        重置
      </el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="products" empty-text="暂无闲置商品">
        <el-table-column label="图片" width="92">
          <template #default="{ row }">
            <el-image class="product-cover" :src="row.coverImage" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="闲置商品" min-width="190" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">{{ categoryMap.get(row.categoryId) || '-' }}</template>
        </el-table-column>
        <el-table-column label="转让价" width="110">
          <template #default="{ row }">
            <span class="price">¥{{ Number(row.price).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="conditionLevel" label="成色" width="96" />
        <el-table-column prop="campus" label="校区" width="110" />
        <el-table-column label="审核" width="100">
          <template #default="{ row }">
            <el-tag :type="statusOf(auditMap, row.auditStatus).type">
              {{ statusOf(auditMap, row.auditStatus).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="交易状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusOf(itemMap, row.itemStatus).type">
              {{ statusOf(itemMap, row.itemStatus).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag class="status-tag" :type="row.status === 'ON' ? 'success' : 'info'">
              {{ row.status === 'ON' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button text type="success" :disabled="row.auditStatus === 'APPROVED'" @click="approve(row)">
              通过
            </el-button>
            <el-button text type="warning" :disabled="row.auditStatus === 'REJECTED'" @click="reject(row)">
              驳回
            </el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑闲置商品' : '新增闲置商品'" width="680px">
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
        <el-form-item label="原价">
          <el-input-number v-model="form.originalPrice" :min="0" :precision="2" :step="1" class="form-wide" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :step="1" class="form-wide" />
        </el-form-item>
        <el-form-item label="成色">
          <el-select v-model="form.conditionLevel" class="form-wide">
            <el-option v-for="item in conditionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="校区">
          <el-select v-model="form.campus" class="form-wide">
            <el-option v-for="item in campusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易方式">
          <el-select v-model="form.tradeType" class="form-wide">
            <el-option v-for="item in tradeTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="面交地点">
          <el-input v-model="form.tradePlace" maxlength="80" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-radio-group v-model="form.auditStatus">
            <el-radio-button label="PENDING">待审核</el-radio-button>
            <el-radio-button label="APPROVED">通过</el-radio-button>
            <el-radio-button label="REJECTED">驳回</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="交易状态">
          <el-radio-group v-model="form.itemStatus">
            <el-radio-button label="ON_SALE">在售</el-radio-button>
            <el-radio-button label="OFF_SHELF">下架</el-radio-button>
            <el-radio-button label="SOLD">成交</el-radio-button>
          </el-radio-group>
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
