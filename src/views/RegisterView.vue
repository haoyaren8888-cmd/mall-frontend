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
  phone: '',
  studentNo: '',
  campus: '明向校区',
  college: '',
  dormitory: ''
})

const campusOptions = ['明向校区', '迎西校区', '虎峪校区']

const submit = async () => {
  await userStore.register(form)
  ElMessage.success('注册成功，请登录')
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <el-card class="register-card" shadow="never">
      <img class="register-logo" src="/tyut-logo.svg" alt="太原理工大学" />
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
        <el-form-item label="学号">
          <el-input v-model="form.studentNo" />
        </el-form-item>
        <el-form-item label="校区">
          <el-select v-model="form.campus" class="full-select">
            <el-option v-for="item in campusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="form.college" />
        </el-form-item>
        <el-form-item label="宿舍">
          <el-input v-model="form.dormitory" placeholder="例如 行知楼 3 号楼" />
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
    linear-gradient(rgba(244, 247, 251, .84), rgba(244, 247, 251, .9)),
    url('/tyut-campus-gate.svg') center / cover;
}

.register-card {
  width: min(460px, calc(100% - 32px));
  border-radius: 8px;
}

.register-logo {
  width: 210px;
  height: 52px;
  display: block;
  margin-bottom: 18px;
  border-radius: 5px;
  object-fit: cover;
}

h2 {
  margin: 0 0 22px;
}

.full {
  width: 100%;
  margin-bottom: 16px;
}

.full-select {
  width: 100%;
}
</style>
