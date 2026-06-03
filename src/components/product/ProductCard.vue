<script setup>
import { Star } from '@element-plus/icons-vue'

defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['add'])

const formatPrice = value => {
  const price = Number(value)
  return Number.isFinite(price) ? price.toFixed(2) : '0.00'
}

const stockCount = product => {
  const stock = Number(product.stock || 0)
  return Number.isFinite(stock) ? stock : 0
}
const hasStock = product => stockCount(product) > 0 && product.itemStatus !== 'OFF_SHELF'
</script>

<template>
  <article class="product-card panel">
    <router-link :to="`/product/${product.id}`" class="image-wrap">
      <img :src="product.coverImage" :alt="product.name" />
    </router-link>
    <div class="product-body">
      <div class="tags">
        <el-tag size="small" type="success">{{ product.campus || '校内' }}</el-tag>
        <el-tag size="small">{{ product.conditionLevel || '成色未填' }}</el-tag>
      </div>
      <router-link :to="`/product/${product.id}`" class="name">{{ product.name }}</router-link>
      <p class="desc">{{ product.description }}</p>
      <div class="place">{{ product.tradePlace || '面交地点待沟通' }}</div>
      <div class="meta">
        <span class="price">¥{{ formatPrice(product.price) }}</span>
        <span v-if="product.originalPrice" class="original">原价 ¥{{ formatPrice(product.originalPrice) }}</span>
      </div>
      <el-button type="primary" :icon="Star" :disabled="!hasStock(product)" @click="$emit('add', product)">
        {{ hasStock(product) ? '加入意向清单' : '已下架' }}
      </el-button>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 390px;
}

.image-wrap {
  display: block;
  aspect-ratio: 4 / 3;
  background: #eef2f7;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.name {
  font-size: 16px;
  font-weight: 700;
}

.desc {
  min-height: 42px;
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
  font-size: 14px;
}

.place {
  color: #475569;
  font-size: 13px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
}

.original {
  color: #9ca3af;
  font-size: 12px;
  text-decoration: line-through;
}
</style>
