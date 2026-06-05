<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const submitting = ref(false)
const passwordSubmitting = ref(false)
const campusOptions = ['明向校区', '迎西校区', '虎峪校区']

const form = reactive({
  nickname: '',
  phone: '',
  studentNo: '',
  campus: '',
  college: '',
  dormitory: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const fillForm = user => {
  form.nickname = user?.nickname || ''
  form.phone = user?.phone || ''
  form.studentNo = user?.studentNo || ''
  form.campus = user?.campus || '明向校区'
  form.college = user?.college || ''
  form.dormitory = user?.dormitory || ''
}

const submit = async () => {
  submitting.value = true
  try {
    await userStore.updateProfile({ ...form })
    ElMessage.success('个人资料已保存')
  } finally {
    submitting.value = false
  }
}

const reset = () => {
  fillForm(userStore.user)
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const submitPassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    ElMessage.warning('请完整填写密码信息')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.warning('新密码至少需要6位')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }

  passwordSubmitting.value = true
  try {
    await userStore.updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码已修改')
    resetPasswordForm()
  } finally {
    passwordSubmitting.value = false
  }
}

onMounted(async () => {
  const user = await userStore.ensureLoaded()
  fillForm(user)
})
</script>

<template>
  <div class="page profile-page">
    <section class="panel profile-head">
      <div>
        <h2>个人资料</h2>
        <p class="muted">完善联系方式和校园信息，方便交易双方线下联系。</p>
      </div>
      <el-tag type="success">{{ userStore.user?.username }}</el-tag>
    </section>

    <section class="panel profile-panel">
      <el-form :model="form" label-position="top" class="profile-form">
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" maxlength="20" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="form.studentNo" maxlength="30" />
        </el-form-item>
        <el-form-item label="校区">
          <el-select v-model="form.campus" class="full-select">
            <el-option v-for="item in campusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="form.college" maxlength="60" />
        </el-form-item>
        <el-form-item label="宿舍">
          <el-input v-model="form.dormitory" maxlength="60" placeholder="例如 明向1号楼 502" />
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存资料</el-button>
      </div>
    </section>

    <section class="panel profile-panel">
      <div class="password-head">
        <div>
          <h3>修改密码</h3>
          <p class="muted">修改后请使用新密码重新登录其他设备。</p>
        </div>
      </div>
      <el-form :model="passwordForm" label-position="top" class="password-form">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password maxlength="30" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password maxlength="30" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password maxlength="30" />
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button @click="resetPasswordForm">清空</el-button>
        <el-button type="primary" :loading="passwordSubmitting" @click="submitPassword">修改密码</el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
}

h2 {
  margin: 0 0 8px;
}

h3 {
  margin: 0 0 8px;
}

.profile-panel {
  padding: 22px;
}

.profile-form,
.password-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 18px;
}

.password-head {
  margin-bottom: 14px;
}

.password-form {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.full-select {
  width: 100%;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

@media (max-width: 720px) {
  .profile-head,
  .actions {
    align-items: stretch;
    flex-direction: column;
  }

  .profile-form {
    grid-template-columns: 1fr;
  }

  .password-form {
    grid-template-columns: 1fr;
  }
}
</style>
