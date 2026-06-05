<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['update', 'remove'])

const detailPath = computed(() => `/product/${props.item.productId}`)
</script>

<template>
  <div class="cart-row">
    <el-checkbox :model-value="item.checked" @update:model-value="checked => $emit('update', item, { checked })" />
    <RouterLink class="cover-link" :to="detailPath" :aria-label="`查看${item.productName}详情`">
      <img :src="item.productImage" :alt="item.productName" />
    </RouterLink>
    <div class="info">
      <RouterLink class="name-link" :to="detailPath">{{ item.productName }}</RouterLink>
      <span class="muted">可交易 {{ item.stock }} 件</span>
    </div>
    <span class="price">¥{{ Number(item.price).toFixed(2) }}</span>
    <el-input-number
      :model-value="item.quantity"
      :min="1"
      :max="item.stock || 999"
      @change="quantity => $emit('update', item, { quantity })"
    />
    <span class="price">¥{{ Number(item.subtotal || item.price * item.quantity).toFixed(2) }}</span>
    <el-button text type="danger" @click="$emit('remove', item)">移除</el-button>
  </div>
</template>

<style scoped>
.cart-row {
  display: grid;
  grid-template-columns: 36px 86px 1fr 110px 150px 120px 70px;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid #edf0f5;
}

.cover-link {
  display: block;
  width: 86px;
  height: 70px;
  overflow: hidden;
  border-radius: 8px;
}

.cover-link img {
  width: 86px;
  height: 70px;
  object-fit: cover;
  transition: transform 0.18s ease;
}

.cover-link:hover img {
  transform: scale(1.04);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name-link {
  color: #1f2937;
  font-weight: 700;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.name-link:hover {
  color: #2563eb;
}

@media (max-width: 860px) {
  .cart-row {
    grid-template-columns: 28px 72px 1fr;
  }

  .price,
  .cart-row :deep(.el-input-number),
  .cart-row .el-button {
    grid-column: 3;
  }
}
</style>
