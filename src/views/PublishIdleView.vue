<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyProductDetail, publishProduct, updateProduct } from '@/api/product'
import { useCategoryStore } from '@/stores/categoryStore'

const router = useRouter()
const route = useRoute()
const categoryStore = useCategoryStore()
const formRef = ref()
const loading = ref(false)
const saving = ref(false)

const campusOptions = ['明向校区', '迎西校区', '虎峪校区']
const conditionOptions = ['全新', '九成新', '八成新', '七成新', '轻微使用痕迹']
const tradeTypeOptions = ['线下面交', '校内自提', '送到宿舍楼下']

const defaultCover =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'

const form = reactive({
  categoryId: null,
  name: '',
  description: '',
  price: 0,
  originalPrice: null,
  stock: 1,
  coverImage: '',
  conditionLevel: '九成新',
  campus: '明向校区',
  tradePlace: '图书馆门口',
  tradeType: '线下面交'
})

const rules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入闲置名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入转让价', trigger: 'blur' }],
  conditionLevel: [{ required: true, message: '请选择成色', trigger: 'change' }],
  campus: [{ required: true, message: '请选择校区', trigger: 'change' }],
  tradePlace: [{ required: true, message: '请输入面交地点', trigger: 'blur' }]
}

const categories = computed(() => categoryStore.flat)
const editingId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) && id > 0 ? id : null
})
const isEdit = computed(() => Boolean(editingId.value))
const pageTitle = computed(() => (isEdit.value ? '编辑闲置商品' : '发布闲置商品'))
const pageTips = computed(() =>
  isEdit.value
    ? '修改后会重新提交管理员审核，审核通过后再进入商品列表。'
    : '保留商城商品信息，补充校区、成色和面交地点，审核通过后进入商品列表。'
)
const submitText = computed(() => (isEdit.value ? '保存并提交审核' : '提交审核'))
const backPath = computed(() => (isEdit.value ? '/my-products' : '/category'))
const previewImage = computed(() => String(form.coverImage || '').trim() || defaultCover)
const previewName = computed(() => form.name.trim() || '待填写商品名称')
const previewDescription = computed(() => form.description.trim() || '补充使用情况、配件和交易时间')
const previewCategoryName = computed(() => categories.value.find(item => item.id === form.categoryId)?.name || '未选分类')
const previewPrice = computed(() => Number(form.price || 0).toFixed(2))
const previewOriginalPrice = computed(() => {
  const value = Number(form.originalPrice || 0)
  return value > 0 ? value.toFixed(2) : ''
})
const discountText = computed(() => {
  const price = Number(form.price || 0)
  const original = Number(form.originalPrice || 0)
  if (price <= 0 || original <= 0 || price >= original) {
    return ''
  }
  return `${Math.round((price / original) * 10)}折`
})

const fillForm = product => {
  Object.assign(form, {
    categoryId: product.categoryId ?? null,
    name: product.name ?? '',
    description: product.description ?? '',
    price: Number(product.price ?? 0),
    originalPrice: product.originalPrice === null || product.originalPrice === undefined
      ? null
      : Number(product.originalPrice),
    stock: product.stock || 1,
    coverImage: product.coverImage ?? '',
    conditionLevel: product.conditionLevel ?? '九成新',
    campus: product.campus ?? '明向校区',
    tradePlace: product.tradePlace ?? '图书馆门口',
    tradeType: product.tradeType ?? '线下面交'
  })
}

const submit = async () => {
  await formRef.value?.validate()
  saving.value = true
  try {
    const payload = {
      ...form,
      coverImage: form.coverImage || defaultCover,
      stock: form.stock || 1
    }
    if (isEdit.value) {
      await updateProduct(editingId.value, payload)
      ElMessage.success('修改已提交，等待管理员重新审核')
    } else {
      await publishProduct(payload)
      ElMessage.success('发布成功，等待管理员审核')
    }
    router.push('/my-products')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!categoryStore.tree.length) {
    await categoryStore.load()
  }
  if (!isEdit.value) {
    return
  }
  loading.value = true
  try {
    const product = await getMyProductDetail(editingId.value)
    fillForm(product)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page publish-page">
    <div class="toolbar">
      <div>
        <h2 class="section-title">{{ pageTitle }}</h2>
        <p class="muted">{{ pageTips }}</p>
      </div>
      <el-button @click="router.push(backPath)">{{ isEdit ? '返回我的发布' : '返回列表' }}</el-button>
    </div>

    <section class="publish-grid">
      <div v-loading="loading" class="panel form-panel">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
          <el-form-item label="商品分类" prop="categoryId">
            <el-select v-model="form.categoryId" filterable placeholder="请选择分类" class="form-wide">
              <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="form.name" maxlength="80" placeholder="例如 高数教材、显示器、宿舍置物架" />
          </el-form-item>
          <el-form-item label="商品描述">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="写清楚使用时间、配件、瑕疵和适合的交易时间"
            />
          </el-form-item>
          <div class="form-row">
            <el-form-item label="转让价" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="5" class="form-wide" />
            </el-form-item>
            <el-form-item label="原价">
              <el-input-number v-model="form.originalPrice" :min="0" :precision="2" :step="5" class="form-wide" />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="数量">
              <el-input-number v-model="form.stock" :min="1" :step="1" class="form-wide" />
            </el-form-item>
            <el-form-item label="成色" prop="conditionLevel">
              <el-select v-model="form.conditionLevel" class="form-wide">
                <el-option v-for="item in conditionOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="校区" prop="campus">
              <el-select v-model="form.campus" class="form-wide">
                <el-option v-for="item in campusOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="交易方式">
              <el-select v-model="form.tradeType" class="form-wide">
                <el-option v-for="item in tradeTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="面交地点" prop="tradePlace">
            <el-input v-model="form.tradePlace" maxlength="80" placeholder="例如 明向图书馆门口、迎西清泽餐厅旁" />
          </el-form-item>
          <el-form-item label="图片地址">
            <el-input v-model="form.coverImage" maxlength="255" placeholder="不填则使用默认图片" />
          </el-form-item>
          <div class="form-actions">
            <el-button @click="router.push(backPath)">取消</el-button>
            <el-button type="primary" :loading="saving" @click="submit">{{ submitText }}</el-button>
          </div>
        </el-form>
      </div>

      <aside class="panel side-panel">
        <h3>发布预览</h3>
        <div class="preview-card">
          <img class="preview-cover" :src="previewImage" :alt="previewName" />
          <div class="preview-body">
            <div class="preview-tags">
              <el-tag size="small" effect="plain">{{ previewCategoryName }}</el-tag>
              <el-tag size="small" type="success" effect="plain">{{ form.conditionLevel }}</el-tag>
            </div>
            <strong class="preview-name">{{ previewName }}</strong>
            <p class="preview-description">{{ previewDescription }}</p>
            <div class="preview-price">
              <span>¥{{ previewPrice }}</span>
              <del v-if="previewOriginalPrice">¥{{ previewOriginalPrice }}</del>
              <em v-if="discountText">{{ discountText }}</em>
            </div>
            <div class="preview-meta">
              <span>{{ form.campus }}</span>
              <span>{{ form.tradeType }}</span>
              <span>{{ form.tradePlace || '待填写面交地点' }}</span>
            </div>
          </div>
        </div>

        <h3 class="check-title">{{ isEdit ? '重新提交前检查' : '发布前检查' }}</h3>
        <ul>
          <li>商品名称和分类要准确，方便同学搜索。</li>
          <li>转让价按实际成色填写，原价可作为参考。</li>
          <li>面交地点建议选校内公共区域。</li>
          <li>有明显瑕疵的物品要在描述里写清楚。</li>
        </ul>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.publish-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar p {
  margin: 4px 0 0;
}

.publish-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
}

.form-panel,
.side-panel {
  padding: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
}

.form-wide {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.side-panel h3 {
  margin: 0 0 12px;
}

.preview-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.preview-cover {
  width: 100%;
  aspect-ratio: 4 / 3;
  display: block;
  object-fit: cover;
  background: #eef2f7;
}

.preview-body {
  padding: 12px;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.preview-name {
  display: block;
  color: #111827;
  font-size: 16px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.preview-description {
  margin: 8px 0 10px;
  color: #64748b;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.preview-price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.preview-price span {
  color: #dc2626;
  font-size: 20px;
  font-weight: 800;
}

.preview-price del {
  color: #94a3b8;
}

.preview-price em {
  color: #047857;
  font-style: normal;
  font-size: 12px;
}

.preview-meta {
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 13px;
}

.preview-meta span {
  padding: 6px 8px;
  border-radius: 6px;
  background: #f8fafc;
  overflow-wrap: anywhere;
}

.check-title {
  margin-top: 18px !important;
}

.side-panel ul {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.9;
}

@media (max-width: 860px) {
  .publish-grid,
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
