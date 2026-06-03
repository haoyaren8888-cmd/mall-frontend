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
const campus = ref('')
const conditionLevel = ref('')
const cartStore = useCartStore()
const categoryStore = useCategoryStore()

const campusOptions = ['明向校区', '迎西校区', '虎峪校区']
const conditionOptions = ['全新', '九成新', '八成新', '七成新']

const loadProducts = async () => {
  loading.value = true
  try {
    const page = await getProducts({
      page: 1,
      size: 8,
      keyword: keyword.value,
      campus: campus.value,
      conditionLevel: conditionLevel.value,
      sort: 'newest'
    })
    products.value = page?.records || []
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

const add = async product => {
  await cartStore.add(product, 1)
  ElMessage.success('已加入意向清单')
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
      <div class="hero-copy">
        <p class="eyebrow">太原理工大学校园跳蚤市场</p>
        <h1>同校同学的闲置好物，在校区里当面交易</h1>
        <p class="intro">教材、数码、宿舍小物和运动装备都在这里流转，先看成色和面交地点，再加入意向清单。</p>
        <div class="hero-search">
          <el-input v-model="keyword" placeholder="搜教材、电脑、宿舍用品" :prefix-icon="Search" @keyup.enter="loadProducts" />
          <el-select v-model="campus" clearable placeholder="校区">
            <el-option v-for="item in campusOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="conditionLevel" clearable placeholder="成色">
            <el-option v-for="item in conditionOptions" :key="item" :label="item" :value="item" />
          </el-select>
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
        <h2 class="section-title">最近上新</h2>
        <router-link to="/category">查看全部</router-link>
      </div>
      <ProductList :products="products" @add="add" />
    </section>
  </div>
</template>

<style scoped>
.home-hero {
  min-height: 330px;
  display: flex;
  align-items: center;
  margin-bottom: 22px;
  padding: 42px;
  color: #fff;
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(22, 50, 42, .82), rgba(22, 50, 42, .24)),
    url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80') center / cover;
}

.hero-copy {
  width: min(850px, 100%);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

h1 {
  margin: 0 0 14px;
  max-width: 720px;
  font-size: 40px;
  line-height: 1.18;
  letter-spacing: 0;
}

.intro {
  margin: 0 0 24px;
  max-width: 620px;
  line-height: 1.7;
  font-size: 17px;
}

.hero-search {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 130px 120px auto;
  max-width: 820px;
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

@media (max-width: 860px) {
  .hero-search {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .home-hero {
    padding: 26px;
  }

  h1 {
    font-size: 30px;
  }

  .category-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .hero-search {
    grid-template-columns: 1fr;
  }
}
</style>
