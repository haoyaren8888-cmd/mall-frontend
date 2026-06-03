<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { publishProduct } from '@/api/product'
import { useCategoryStore } from '@/stores/categoryStore'

const router = useRouter()
const categoryStore = useCategoryStore()
const formRef = ref()
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

const submit = async () => {
  await formRef.value?.validate()
  saving.value = true
  try {
    await publishProduct({
      ...form,
      coverImage: form.coverImage || defaultCover,
      stock: form.stock || 1
    })
    ElMessage.success('发布成功，等待管理员审核')
    router.push('/category')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!categoryStore.tree.length) {
    await categoryStore.load()
  }
})
</script>

<template>
  <div class="page publish-page">
    <div class="toolbar">
      <div>
        <h2 class="section-title">发布闲置商品</h2>
        <p class="muted">保留商城商品信息，补充校区、成色和面交地点，审核通过后进入商品列表。</p>
      </div>
      <el-button @click="router.push('/category')">返回列表</el-button>
    </div>

    <section class="publish-grid">
      <div class="panel form-panel">
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
            <el-button @click="router.push('/category')">取消</el-button>
            <el-button type="primary" :loading="saving" @click="submit">提交审核</el-button>
          </div>
        </el-form>
      </div>

      <aside class="panel side-panel">
        <h3>发布前检查</h3>
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
  grid-template-columns: minmax(0, 1fr) 280px;
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
