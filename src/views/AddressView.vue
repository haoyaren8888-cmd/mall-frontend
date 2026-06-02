<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AddressFormDialog from '@/components/address/AddressFormDialog.vue'
import { createAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from '@/api/address'

const addresses = ref([])
const dialogVisible = ref(false)
const editing = ref(null)

const load = async () => {
  addresses.value = await getAddresses()
}

const openCreate = () => {
  editing.value = null
  dialogVisible.value = true
}

const openEdit = address => {
  editing.value = address
  dialogVisible.value = true
}

const save = async form => {
  if (editing.value) {
    await updateAddress(editing.value.id, form)
  } else {
    await createAddress(form)
  }
  dialogVisible.value = false
  ElMessage.success('保存成功')
  await load()
}

const remove = async address => {
  await ElMessageBox.confirm('确认删除这个地址吗？', '提示')
  await deleteAddress(address.id)
  await load()
}

const setDefault = async address => {
  await setDefaultAddress(address.id)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2 class="section-title">收货地址</h2>
      <el-button type="primary" @click="openCreate">新增地址</el-button>
    </div>
    <section class="address-grid">
      <article v-for="address in addresses" :key="address.id" class="panel address-card">
        <div class="address-title">
          <strong>{{ address.receiverName }}</strong>
          <el-tag v-if="address.defaultAddress" size="small">默认</el-tag>
        </div>
        <p>{{ address.receiverPhone }}</p>
        <p>{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</p>
        <div class="card-actions">
          <el-button text type="primary" @click="openEdit(address)">编辑</el-button>
          <el-button v-if="!address.defaultAddress" text @click="setDefault(address)">设为默认</el-button>
          <el-button text type="danger" @click="remove(address)">删除</el-button>
        </div>
      </article>
    </section>
    <el-empty v-if="!addresses.length" description="还没有收货地址" />
    <AddressFormDialog v-model="dialogVisible" :address="editing" @submit="save" />
  </div>
</template>

<style scoped>
.address-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.address-card {
  padding: 18px;
}

.address-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.address-card p {
  color: #4b5563;
  line-height: 1.7;
}

.card-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 860px) {
  .address-grid {
    grid-template-columns: 1fr;
  }
}
</style>
