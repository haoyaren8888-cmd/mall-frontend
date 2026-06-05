<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: 'user',
  password: '123456'
})

const submit = async () => {
  const user = await userStore.login(form)
  ElMessage.success('登录成功')
  if (route.query.redirect) {
    router.push(route.query.redirect)
  } else if (user.role === 'ADMIN') {
    router.push('/admin/dashboard')
  } else {
    router.push('/home')
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-visual">
      <h1>工大闲置商城</h1>
      <p>同校同学发布闲置商品，按商城流程完成意向清单、确认交易和模拟支付。</p>
    </div>
    <el-card class="auth-card" shadow="never">
      <h2>账号登录</h2>
      <el-form :model="form" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-button type="primary" class="full" @click="submit">登录</el-button>
      </el-form>
      <div class="auth-links">
        <span class="muted">学生用户 user / 123456，管理员 admin / 123456</span>
        <router-link to="/register">注册新账号</router-link>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 420px;
  background: #f4f7fb;
}

.auth-visual {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8vw;
  color: #fff;
  background:
    linear-gradient(rgba(22, 50, 42, .54), rgba(22, 50, 42, .64)),
    url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80') center / cover;
}

h1 {
  margin: 0 0 18px;
  font-size: 48px;
  letter-spacing: 0;
}

.auth-visual p {
  margin: 0;
  max-width: 520px;
  font-size: 20px;
  line-height: 1.8;
}

.auth-card {
  align-self: center;
  margin-right: 6vw;
  border-radius: 8px;
}

.auth-card h2 {
  margin: 0 0 24px;
}

.full {
  width: 100%;
}

.auth-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

@media (max-width: 860px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-visual {
    min-height: 260px;
  }

  .auth-card {
    margin: 24px;
  }
}
</style>
