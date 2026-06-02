<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: ''
})

const submit = async () => {
  await userStore.register(form)
  ElMessage.success('注册成功，请登录')
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <el-card class="register-card" shadow="never">
      <h2>注册账号</h2>
      <el-form :model="form" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-button type="primary" class="full" @click="submit">注册</el-button>
      </el-form>
      <router-link to="/login">已有账号，去登录</router-link>
    </el-card>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(rgba(244, 247, 251, .9), rgba(244, 247, 251, .9)),
    url('https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1600&q=80') center / cover;
}

.register-card {
  width: min(420px, calc(100% - 32px));
  border-radius: 8px;
}

h2 {
  margin: 0 0 22px;
}

.full {
  width: 100%;
  margin-bottom: 16px;
}
</style>
