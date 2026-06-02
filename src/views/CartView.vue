<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CartItemRow from '@/components/cart/CartItemRow.vue'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const selectedItems = computed(() => cartStore.displayItems.filter(item => item.checked))
const total = computed(() => selectedItems.value.reduce((sum, item) => sum + Number(item.subtotal || item.price * item.quantity), 0))

const checkout = () => {
  if (!cartStore.displayItems.length) {
    ElMessage.warning('购物车还是空的')
    return
  }
  if (!selectedItems.value.length) {
    ElMessage.warning('请先勾选商品')
    return
  }
  if (!userStore.isLogin) {
    router.push({ path: '/login', query: { redirect: '/checkout' } })
    return
  }
  router.push('/checkout')
}

onMounted(cartStore.load)
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2 class="section-title">购物车</h2>
      <span class="muted" v-if="!userStore.isLogin">未登录商品保存在本地，登录后会自动合并。</span>
    </div>
    <section class="panel cart-panel">
      <CartItemRow
        v-for="item in cartStore.displayItems"
        :key="item.id || item.productId"
        :item="item"
        @update="cartStore.update"
        @remove="cartStore.remove"
      />
      <el-empty v-if="!cartStore.displayItems.length" description="购物车为空" />
    </section>
    <section class="cart-summary panel">
      <span>已选 {{ selectedItems.length }} 件</span>
      <strong>合计：<span class="price">￥{{ total.toFixed(2) }}</span></strong>
      <el-button type="primary" size="large" @click="checkout">去结算</el-button>
    </section>
  </div>
</template>

<style scoped>
.cart-panel {
  overflow: hidden;
}

.cart-summary {
  margin-top: 16px;
  padding: 18px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 22px;
}

@media (max-width: 720px) {
  .cart-summary {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
