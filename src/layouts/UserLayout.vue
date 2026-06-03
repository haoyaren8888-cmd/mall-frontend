<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Goods, ShoppingCart, User, SwitchButton, Management, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useCategoryStore } from '@/stores/categoryStore'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const categoryStore = useCategoryStore()
const cartCount = computed(() => cartStore.totalQuantity)

onMounted(async () => {
  if (!categoryStore.tree.length) {
    categoryStore.load()
  }
  cartStore.load()
})

const logout = async () => {
  await userStore.logout()
  await cartStore.load()
  router.push('/home')
}
</script>

<template>
  <el-header class="shop-header">
    <div class="page header-inner">
      <router-link class="brand" to="/home">
        <el-icon><Goods /></el-icon>
        <span>工大闲置商城</span>
      </router-link>
      <el-menu mode="horizontal" :ellipsis="false" class="top-menu" router>
        <el-menu-item index="/home">首页</el-menu-item>
        <el-menu-item index="/category">闲置商品</el-menu-item>
        <el-menu-item index="/publish">发布闲置</el-menu-item>
        <el-menu-item index="/my-products">我的发布</el-menu-item>
        <el-menu-item index="/orders">交易记录</el-menu-item>
        <el-menu-item index="/address">收货地址</el-menu-item>
      </el-menu>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="router.push('/publish')">发布闲置</el-button>
        <el-button :icon="ShoppingCart" @click="router.push('/cart')">
          意向清单 {{ cartCount }}
        </el-button>
        <el-dropdown v-if="userStore.isLogin">
          <el-button :icon="User">
            {{ userStore.user.nickname || userStore.user.username }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="userStore.isAdmin" :icon="Management" @click="router.push('/admin/dashboard')">
                后台管理
              </el-dropdown-item>
              <el-dropdown-item :icon="SwitchButton" @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-else type="primary" @click="router.push('/login')">登录</el-button>
      </div>
    </div>
  </el-header>
  <main class="shop-main">
    <router-view />
  </main>
  <footer class="shop-footer">太原理工大学校园跳蚤市场 · 保留商城交易主流程</footer>
</template>

<style scoped>
.shop-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 64px;
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.header-inner {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 130px;
  color: #166534;
  font-size: 20px;
  font-weight: 800;
}

.top-menu {
  flex: 1;
  border-bottom: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shop-main {
  min-height: calc(100vh - 112px);
  padding: 24px 0 36px;
}

.shop-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 860px) {
  .top-menu {
    display: none;
  }

  .header-inner {
    justify-content: space-between;
  }
}
</style>
