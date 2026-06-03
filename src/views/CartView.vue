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
const selectedInvalidItems = computed(() => selectedItems.value.filter(item => Number(item.quantity || 0) > Number(item.stock || 0)))
const allChecked = computed(() => cartStore.displayItems.length > 0 && cartStore.displayItems.every(item => item.checked))
const partialChecked = computed(() => selectedItems.value.length > 0 && !allChecked.value)
const total = computed(() => selectedItems.value.reduce((sum, item) => sum + Number(item.subtotal || item.price * item.quantity), 0))

const toggleAll = async checked => {
  await cartStore.checkAll(checked)
}

const checkout = () => {
  if (!cartStore.displayItems.length) {
    ElMessage.warning('意向清单还是空的')
    return
  }
  if (!selectedItems.value.length) {
    ElMessage.warning('请先勾选想交易的闲置商品')
    return
  }
  if (selectedInvalidItems.value.length) {
    ElMessage.warning('已选闲置数量不足，请调整数量')
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
      <h2 class="section-title">意向清单</h2>
      <span class="muted" v-if="!userStore.isLogin">未登录时会先保存在本地，登录后自动合并到账号。</span>
    </div>
    <section class="panel cart-panel">
      <CartItemRow
        v-for="item in cartStore.displayItems"
        :key="item.id || item.productId"
        :item="item"
        @update="cartStore.update"
        @remove="cartStore.remove"
      />
      <el-empty v-if="!cartStore.displayItems.length" description="还没有加入意向清单" />
    </section>
    <section class="cart-summary panel">
      <div class="summary-left">
        <el-checkbox
          :model-value="allChecked"
          :indeterminate="partialChecked"
          :disabled="!cartStore.displayItems.length"
          @change="toggleAll"
        >
          全选
        </el-checkbox>
        <span>已选 {{ selectedItems.length }} 件闲置</span>
      </div>
      <strong>预估合计：<span class="price">¥{{ total.toFixed(2) }}</span></strong>
      <el-button type="primary" size="large" @click="checkout">确认交易</el-button>
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
  justify-content: space-between;
  align-items: center;
  gap: 22px;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

@media (max-width: 720px) {
  .cart-summary {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
