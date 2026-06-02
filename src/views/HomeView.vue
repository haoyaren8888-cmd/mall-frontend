<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import ProductList from '@/components/product/ProductList.vue'
import { getProducts } from '@/api/product'
import { useCartStore } from '@/stores/cartStore'
import { useCategoryStore } from '@/stores/categoryStore'

const products = ref([])
const loading = ref(false)
const keyword = ref('')
const cartStore = useCartStore()
const categoryStore = useCategoryStore()

const loadProducts = async () => {
  loading.value = true
  try {
    const page = await getProducts({ page: 1, size: 8, keyword: keyword.value })
    products.value = page?.records || []
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

const add = async product => {
  await cartStore.add(product, 1)
  ElMessage.success('已加入购物车')
}

onMounted(async () => {
  if (!categoryStore.tree.length) {
    await categoryStore.load()
  }
  await loadProducts()
})
</script>

<template>
  <div class="page">
    <section class="home-hero">
      <div>
        <h1>综合网上购物商城</h1>
        <p>核心商城流程：商品浏览、购物车、收货地址、下单、模拟支付。</p>
        <div class="hero-search">
          <el-input v-model="keyword" placeholder="搜索商品" :prefix-icon="Search" @keyup.enter="loadProducts" />
          <el-button type="primary" @click="loadProducts">搜索</el-button>
        </div>
      </div>
    </section>

    <section class="category-strip">
      <router-link v-for="category in categoryStore.tree" :key="category.id" :to="`/category/${category.id}`">
        {{ category.name }}
      </router-link>
    </section>

    <section v-loading="loading">
      <div class="toolbar">
        <h2 class="section-title">精选商品</h2>
        <router-link to="/category">查看全部</router-link>
      </div>
      <ProductList :products="products" @add="add" />
    </section>
  </div>
</template>

<style scoped>
.home-hero {
  min-height: 310px;
  display: flex;
  align-items: center;
  margin-bottom: 22px;
  padding: 42px;
  color: #fff;
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(17, 24, 39, .72), rgba(17, 24, 39, .18)),
    url('https://images.unsplash.com/photo-1607082352121-fa243f3dde32?auto=format&fit=crop&w=1600&q=80') center / cover;
}

h1 {
  margin: 0 0 14px;
  font-size: 42px;
  letter-spacing: 0;
}

.home-hero p {
  margin: 0 0 24px;
  max-width: 560px;
  line-height: 1.7;
  font-size: 18px;
}

.hero-search {
  display: flex;
  max-width: 520px;
  gap: 10px;
}

.category-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}

.category-strip a {
  padding: 16px;
  text-align: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 700;
}

@media (max-width: 760px) {
  .home-hero {
    padding: 26px;
  }

  h1 {
    font-size: 32px;
  }

  .category-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
