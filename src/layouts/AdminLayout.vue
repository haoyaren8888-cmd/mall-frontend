<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Box, ChatLineRound, FolderOpened, List, SwitchButton, Tickets, User as UserIcon } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-aside">
      <div class="admin-logo">闲置商城后台</div>
      <el-menu
        router
        :default-active="route.path"
        background-color="#111827"
        text-color="#d1d5db"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Tickets /></el-icon>
          <span>后台首页</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <el-icon><Box /></el-icon>
          <span>闲置商品</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><FolderOpened /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><List /></el-icon>
          <span>交易订单</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><UserIcon /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reviews">
          <el-icon><ChatLineRound /></el-icon>
          <span>评价管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <span>{{ userStore.user?.nickname || '管理员' }}</span>
        <div>
          <el-button @click="router.push('/home')">返回前台</el-button>
          <el-button :icon="SwitchButton" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.admin-aside {
  background: #111827;
}

.admin-logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding-left: 22px;
  color: #fff;
  font-size: 20px;
  font-weight: 800;
}

.admin-aside :deep(.el-menu) {
  border-right: 0;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.admin-main {
  background: #f4f7fb;
}
</style>
