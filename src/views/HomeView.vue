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
const campusQuickOptions = [
  { label: '全部校区', value: '' },
  { label: '明向校区', value: '明向校区' },
  { label: '迎西校区', value: '迎西校区' },
  { label: '虎峪校区', value: '虎峪校区' }
]
const conditionOptions = ['全新', '九成新', '八成新', '七成新']
const campusScenes = [
  {
    title: '明向湖畔',
    text: '湖水、长廊和教学楼串起熟悉的校园动线，同学之间约面交更方便。',
    image: '/tyut-campus-lake.svg'
  },
  {
    title: '校门广场',
    text: '校门广场连接校内外生活，教材、数码和宿舍小物都能在这里找到买家。',
    image: '/tyut-campus-gate.svg'
  },
  {
    title: '太工标识',
    text: '以太工学生为主要用户，交易信息围绕校区、成色和面交地点展开。',
    image: '/tyut-logo.svg'
  }
]

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

const pickCampus = async value => {
  campus.value = value
  await loadProducts()
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
      <img class="hero-school-logo" src="/tyut-logo.svg" alt="太原理工大学" />
      <div class="hero-copy">
        <p class="eyebrow">太原理工大学校园跳蚤市场</p>
        <h1>同校同学的闲置好物，在校区里当面交易</h1>
        <p class="intro">教材、数码、宿舍小物和运动装备都在这里流转，先看成色和面交地点，再加入意向清单。</p>
        <div class="hero-tags" aria-label="校区范围">
          <span>明向校区</span>
          <span>迎西校区</span>
          <span>虎峪校区</span>
        </div>
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

    <section class="campus-showcase" aria-label="太原理工大学校园印象">
      <article v-for="scene in campusScenes" :key="scene.title" class="campus-card">
        <img :src="scene.image" :alt="scene.title" loading="lazy" />
        <div>
          <h2>{{ scene.title }}</h2>
          <p>{{ scene.text }}</p>
        </div>
      </article>
    </section>

    <section class="category-strip">
      <router-link v-for="category in categoryStore.tree" :key="category.id" :to="`/category/${category.id}`">
        {{ category.name }}
      </router-link>
    </section>

    <section class="campus-strip">
      <button
        v-for="item in campusQuickOptions"
        :key="item.label"
        type="button"
        :class="{ active: campus === item.value }"
        @click="pickCampus(item.value)"
      >
        {{ item.label }}
      </button>
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
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-bottom: 22px;
  padding: 42px;
  color: #fff;
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(5, 34, 64, .88), rgba(5, 34, 64, .54) 48%, rgba(5, 34, 64, .1)),
    url('/tyut-campus-lake.svg') center / cover;
  box-shadow: 0 20px 40px rgba(6, 61, 112, .18);
}

.home-hero::after {
  content: "";
  position: absolute;
  inset: auto -12% -38% 46%;
  height: 220px;
  background: rgba(255, 255, 255, .16);
  transform: rotate(-8deg);
}

.hero-copy {
  position: relative;
  z-index: 1;
  width: min(850px, 100%);
}

.hero-school-logo {
  position: absolute;
  z-index: 1;
  top: 28px;
  right: 30px;
  width: 260px;
  max-width: 28%;
  border-radius: 6px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, .24);
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

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.hero-tags span {
  padding: 6px 12px;
  color: #e7f2ff;
  background: rgba(255, 255, 255, .14);
  border: 1px solid rgba(255, 255, 255, .28);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
}

.hero-search {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 130px 120px auto;
  max-width: 820px;
  gap: 10px;
}

.campus-showcase {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 28px;
}

.campus-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #d9e3ec;
  border-radius: 8px;
  box-shadow: 0 12px 26px rgba(6, 61, 112, .08);
}

.campus-card img {
  width: 100%;
  height: 162px;
  display: block;
  object-fit: cover;
  background: #063d70;
}

.campus-card:first-child img {
  height: 190px;
}

.campus-card div {
  padding: 14px 16px 16px;
}

.campus-card h2 {
  margin: 0 0 8px;
  color: #063d70;
  font-size: 18px;
}

.campus-card p {
  margin: 0;
  color: #4b5563;
  line-height: 1.65;
  font-size: 14px;
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
  border: 1px solid #d9e3ec;
  border-radius: 8px;
  color: #063d70;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(6, 61, 112, .05);
}

.campus-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: -12px 0 28px;
}

.campus-strip button {
  height: 36px;
  padding: 0 16px;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 18px;
  cursor: pointer;
}

.campus-strip button.active {
  color: #fff;
  background: #063d70;
  border-color: #063d70;
}

@media (max-width: 860px) {
  .hero-school-logo {
    display: none;
  }

  .hero-search {
    grid-template-columns: 1fr 1fr;
  }

  .campus-showcase {
    grid-template-columns: 1fr;
  }

  .campus-card:first-child img,
  .campus-card img {
    height: 170px;
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
