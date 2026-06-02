<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

defineEmits(['add'])
</script>

<template>
  <div v-if="products.length" class="product-grid">
    <ProductCard v-for="product in products" :key="product.id" :product="product" @add="$emit('add', product)" />
  </div>
  <el-empty v-else description="暂时没有商品" />
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 1080px) {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
