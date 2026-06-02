<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductList from '@/components/product/ProductList.vue'
import { getProducts } from '@/api/product'
import { useCartStore } from '@/stores/cartStore'
import { useCategoryStore } from '@/stores/categoryStore'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const cartStore = useCartStore()
const products = ref([])
const keyword = ref('')
const sort = ref('newest')
const page = ref(1)
const pageSize = 8
const total = ref(0)
const loading = ref(false)

const sortOptions = [
  { label: '最新上架', value: 'newest' },
  { label: '价格从低到高', value: 'priceAsc' },
  { label: '价格从高到低', value: 'priceDesc' },
  { label: '销量优先', value: 'salesDesc' }
]

const activeMenu = computed(() => route.params.id || 'all')

const activeCategory = () => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
}

const loadProducts = async () => {
  loading.value = true
  try {
    const result = await getProducts({
      page: page.value,
      size: pageSize,
      categoryId: activeCategory(),
      keyword: keyword.value,
      sort: sort.value
    })
    products.value = result?.records || []
    total.value = Number(result?.total || 0)
  } catch {
    products.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const searchProducts = () => {
  page.value = 1
  loadProducts()
}

const changeSort = () => {
  page.value = 1
  loadProducts()
}

const add = async product => {
  await cartStore.add(product, 1)
  ElMessage.success('已加入购物车')
}

watch(() => route.params.id, () => {
  page.value = 1
  loadProducts()
})

onMounted(async () => {
  if (!categoryStore.tree.length) {
    await categoryStore.load()
  }
  await loadProducts()
})
</script>

<template>
  <div class="page catalog-page">
    <aside class="panel category-panel">
      <h3>商品分类</h3>
      <el-menu :default-active="activeMenu">
        <el-menu-item index="all" @click="router.push('/category')">全部商品</el-menu-item>
        <template v-for="category in categoryStore.tree" :key="category.id">
          <el-menu-item :index="String(category.id)" @click="router.push(`/category/${category.id}`)">
            {{ category.name }}
          </el-menu-item>
          <el-menu-item
            v-for="child in category.children"
            :key="child.id"
            class="child-item"
            :index="String(child.id)"
            @click="router.push(`/category/${child.id}`)"
          >
            {{ child.name }}
          </el-menu-item>
        </template>
      </el-menu>
    </aside>
    <section class="catalog-main" v-loading="loading">
      <div class="toolbar">
        <h2 class="section-title">商品列表</h2>
        <div class="search-box">
          <el-select v-model="sort" class="sort-select" @change="changeSort">
            <el-option v-for="option in sortOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
          <el-input v-model="keyword" placeholder="输入商品名称" clearable @clear="searchProducts" @keyup.enter="searchProducts" />
          <el-button type="primary" @click="searchProducts">查询</el-button>
        </div>
      </div>
      <ProductList :products="products" @add="add" />
      <el-pagination
        class="pagination"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="page"
        @current-change="loadProducts"
      />
    </section>
  </div>
</template>

<style scoped>
.catalog-page {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 22px;
}

.category-panel {
  padding: 16px 0;
  align-self: start;
}

.category-panel h3 {
  margin: 0 16px 12px;
}

.category-panel :deep(.el-menu) {
  border-right: 0;
}

.child-item {
  padding-left: 42px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.sort-select {
  width: 142px;
  flex: 0 0 142px;
}

.pagination {
  margin-top: 24px;
  justify-content: center;
}

@media (max-width: 860px) {
  .catalog-page {
    grid-template-columns: 1fr;
  }
}
</style>
