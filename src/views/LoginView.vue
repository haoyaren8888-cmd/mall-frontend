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
      <img src="/tyut-logo.svg" alt="太原理工大学" />
      <h1>太原理工大学校园闲置商城</h1>
      <p>明向、迎西、虎峪校区的教材、数码和宿舍小物在这里流转，同学之间就近沟通、当面交易。</p>
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
    linear-gradient(rgba(5, 34, 64, .44), rgba(5, 34, 64, .68)),
    url('/tyut-campus-lake.svg') center / cover;
}

.auth-visual img {
  width: 270px;
  max-width: 70%;
  margin-bottom: 28px;
  border-radius: 6px;
  box-shadow: 0 16px 34px rgba(0, 0, 0, .22);
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
