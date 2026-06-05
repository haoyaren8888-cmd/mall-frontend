<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, User, SwitchButton, Management, Plus } from '@element-plus/icons-vue'
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
        <img class="brand-logo" src="/tyut-logo.svg" alt="太原理工大学" />
        <span class="brand-text">
          <strong>太原理工大学</strong>
          <small>校园闲置商城</small>
        </span>
      </router-link>
      <el-menu mode="horizontal" :ellipsis="false" class="top-menu" router>
        <el-menu-item index="/home">首页</el-menu-item>
        <el-menu-item index="/category">闲置商品</el-menu-item>
        <el-menu-item index="/publish">发布闲置</el-menu-item>
        <el-menu-item index="/my-products">我的发布</el-menu-item>
        <el-menu-item index="/orders">交易记录</el-menu-item>
        <el-menu-item index="/address">联系地址</el-menu-item>
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
  <footer class="shop-footer">
    <div class="page footer-inner">
      <img src="/tyut-logo.svg" alt="太原理工大学" />
      <span>太原理工大学校园跳蚤市场 · 明向、迎西、虎峪校区闲置交易</span>
    </div>
  </footer>
</template>

<style scoped>
.shop-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 72px;
  padding: 0;
  background: rgba(255, 255, 255, .96);
  border-top: 4px solid #063d70;
  border-bottom: 1px solid #d7e1eb;
  backdrop-filter: blur(10px);
}

.header-inner {
  display: flex;
  align-items: center;
  height: 68px;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 244px;
  color: #063d70;
}

.brand-logo {
  width: 92px;
  height: 42px;
  border-radius: 4px;
  object-fit: cover;
  box-shadow: 0 5px 14px rgba(6, 61, 112, .16);
}

.brand-text {
  display: grid;
  gap: 1px;
  line-height: 1.1;
}

.brand-text strong {
  font-size: 18px;
  font-weight: 800;
}

.brand-text small {
  color: #7b2d24;
  font-size: 12px;
  font-weight: 700;
}

.top-menu {
  flex: 1;
  border-bottom: 0;
  background: transparent;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shop-main {
  min-height: calc(100vh - 132px);
  padding: 24px 0 36px;
}

.shop-footer {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  background: #fff;
  border-top: 1px solid #d7e1eb;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.footer-inner img {
  width: 118px;
  height: 30px;
  border-radius: 3px;
  object-fit: cover;
}

@media (max-width: 860px) {
  .top-menu {
    display: none;
  }

  .header-inner {
    justify-content: space-between;
  }

  .brand {
    min-width: auto;
  }
}

@media (max-width: 620px) {
  .brand-logo {
    width: 64px;
    height: 34px;
  }

  .brand-text strong {
    font-size: 15px;
  }

  .brand-text small,
  .footer-inner img {
    display: none;
  }

  .footer-inner {
    text-align: center;
  }
}
</style>
