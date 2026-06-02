<script setup>
import { ShoppingCart } from '@element-plus/icons-vue'

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
const hasStock = product => stockCount(product) > 0
</script>

<template>
  <article class="product-card panel">
    <router-link :to="`/product/${product.id}`" class="image-wrap">
      <img :src="product.coverImage" :alt="product.name" />
    </router-link>
    <div class="product-body">
      <router-link :to="`/product/${product.id}`" class="name">{{ product.name }}</router-link>
      <p class="desc">{{ product.description }}</p>
      <div class="meta">
        <span class="price">￥{{ formatPrice(product.price) }}</span>
        <span class="muted">库存 {{ stockCount(product) }}</span>
      </div>
      <el-button type="primary" :icon="ShoppingCart" :disabled="!hasStock(product)" @click="$emit('add', product)">
        {{ hasStock(product) ? '加入购物车' : '暂无库存' }}
      </el-button>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 360px;
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

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}
</style>
