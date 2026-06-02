<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAddresses } from '@/api/address'
import { createOrder } from '@/api/order'
import { useCartStore } from '@/stores/cartStore'

const router = useRouter()
const cartStore = useCartStore()
const addresses = ref([])
const selectedAddressId = ref(null)

const items = computed(() => cartStore.items.filter(item => item.checked))
const total = computed(() => items.value.reduce((sum, item) => {
  const subtotal = item.subtotal ?? Number(item.price || 0) * Number(item.quantity || 0)
  return sum + Number(subtotal || 0)
}, 0))
const selectedAddress = computed(() => addresses.value.find(item => item.id === selectedAddressId.value))

const load = async () => {
  await cartStore.load()
  if (!items.value.length) {
    ElMessage.warning('请先选择要结算的商品')
    router.replace('/cart')
    return
  }
  addresses.value = await getAddresses()
  selectedAddressId.value = addresses.value.find(item => item.defaultAddress)?.id || addresses.value[0]?.id
}

const submit = async () => {
  if (!items.value.length) {
    ElMessage.warning('请先选择要结算的商品')
    router.replace('/cart')
    return
  }
  if (!selectedAddressId.value) {
    ElMessage.warning('请先选择收货地址')
    return
  }
  const order = await createOrder({ addressId: selectedAddressId.value })
  ElMessage.success('订单已创建')
  await cartStore.load()
  router.push(`/pay/${order.orderNo}`)
}

onMounted(load)
</script>

<template>
  <div class="page checkout-page">
    <section class="panel block">
      <div class="toolbar">
        <h2 class="section-title">确认收货地址</h2>
        <el-button @click="router.push('/address')">管理地址</el-button>
      </div>
      <el-radio-group v-model="selectedAddressId" class="address-list">
        <el-radio
          v-for="address in addresses"
          :key="address.id"
          :value="address.id"
          class="address-radio"
          :class="{ active: selectedAddressId === address.id }"
        >
          <span class="receiver">
            {{ address.receiverName }} {{ address.receiverPhone }}
            <el-tag v-if="address.defaultAddress" size="small">默认</el-tag>
          </span>
          <span class="address-text">
            {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
          </span>
        </el-radio>
      </el-radio-group>
      <el-empty v-if="!addresses.length" description="还没有收货地址" />
      <div v-else-if="selectedAddress" class="address-note">
        将配送至：{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}
      </div>
    </section>

    <section class="panel block">
      <h2 class="section-title">确认商品</h2>
      <div v-for="item in items" :key="item.id" class="checkout-item">
        <img :src="item.productImage" :alt="item.productName" />
        <span>{{ item.productName }}</span>
        <span>x {{ item.quantity }}</span>
        <strong class="price">￥{{ Number(item.subtotal ?? item.price * item.quantity).toFixed(2) }}</strong>
      </div>
    </section>

    <section class="panel submit-bar">
      <strong>应付金额：<span class="price">￥{{ total.toFixed(2) }}</span></strong>
      <el-button type="primary" size="large" @click="submit">提交订单</el-button>
    </section>
  </div>
</template>

<style scoped>
.checkout-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block,
.submit-bar {
  padding: 18px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}

.address-radio {
  min-height: 62px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  align-items: flex-start;
  margin-right: 0;
}

.address-radio.active {
  border-color: #409eff;
  background: #f5f9ff;
}

.address-radio :deep(.el-radio__label) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.5;
}

.receiver {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-weight: 700;
}

.address-text,
.address-note {
  color: #4b5563;
}

.address-note {
  margin-top: 12px;
}

.checkout-item {
  display: grid;
  grid-template-columns: 76px 1fr 80px 120px;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #edf0f5;
}

img {
  width: 76px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.submit-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
}
</style>
