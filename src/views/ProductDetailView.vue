<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { useCartStore } from '@/stores/cartStore'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const product = ref(null)
const quantity = ref(1)
const loading = ref(false)

const normalizeNumber = value => {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

const stock = computed(() => normalizeNumber(product.value?.stock))
const sales = computed(() => normalizeNumber(product.value?.sales))
const canBuy = computed(() => product.value?.status === 'ON' && stock.value > 0)
const quantityMax = computed(() => Math.max(stock.value, 1))

const formatPrice = value => {
  const price = Number(value)
  return Number.isFinite(price) ? price.toFixed(2) : '0.00'
}

const load = async id => {
  loading.value = true
  product.value = null
  try {
    product.value = await getProductDetail(id)
    quantity.value = 1
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

const add = async goCart => {
  if (!canBuy.value) {
    ElMessage.warning('商品暂无库存')
    return
  }
  await cartStore.add(product.value, quantity.value)
  ElMessage.success('已加入购物车')
  if (goCart) {
    router.push('/cart')
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <div class="page" v-loading="loading">
    <section v-if="product" class="detail-panel panel">
      <img :src="product.coverImage" :alt="product.name" />
      <div class="detail-info">
        <el-tag v-if="product.status === 'ON'" type="success">在售</el-tag>
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <div class="price big">￥{{ formatPrice(product.price) }}</div>
        <div class="muted">销量 {{ sales }} · 库存 {{ stock }}</div>
        <div class="buy-line">
          <span>数量</span>
          <el-input-number v-model="quantity" :min="1" :max="quantityMax" :disabled="!canBuy" />
        </div>
        <div class="actions">
          <el-button :icon="ShoppingCart" :disabled="!canBuy" @click="add(false)">加入购物车</el-button>
          <el-button type="primary" :disabled="!canBuy" @click="add(true)">立即购买</el-button>
        </div>
      </div>
    </section>
    <el-empty v-else-if="!loading" description="商品不存在或已下架" />
  </div>
</template>

<style scoped>
.detail-panel {
  display: grid;
  grid-template-columns: 48% 1fr;
  overflow: hidden;
}

img {
  width: 100%;
  height: 520px;
  object-fit: cover;
  display: block;
}

.detail-info {
  padding: 42px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

h1 {
  margin: 0;
  font-size: 30px;
  letter-spacing: 0;
}

p {
  margin: 0;
  color: #4b5563;
  line-height: 1.8;
}

.big {
  font-size: 30px;
}

.buy-line,
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

@media (max-width: 860px) {
  .detail-panel {
    grid-template-columns: 1fr;
  }

  img {
    height: 320px;
  }
}
</style>
