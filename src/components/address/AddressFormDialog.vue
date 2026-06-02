<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  address: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const form = reactive({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  defaultAddress: false
})

const rules = {
  receiverName: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  receiverPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入 11 位手机号', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const fillForm = address => {
  Object.assign(form, {
    receiverName: address?.receiverName || '',
    receiverPhone: address?.receiverPhone || '',
    province: address?.province || '',
    city: address?.city || '',
    district: address?.district || '',
    detail: address?.detail || '',
    defaultAddress: !!address?.defaultAddress
  })
  formRef.value?.clearValidate()
}

watch(
  () => [props.modelValue, props.address],
  ([visible, address]) => {
    if (visible) {
      fillForm(address)
    }
  },
  { immediate: true }
)

const submit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      emit('submit', { ...form })
    }
  })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="address ? '编辑地址' : '新增地址'"
    width="520px"
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="收货人" prop="receiverName">
        <el-input v-model="form.receiverName" />
      </el-form-item>
      <el-form-item label="手机号" prop="receiverPhone">
        <el-input v-model="form.receiverPhone" />
      </el-form-item>
      <el-form-item label="省份" prop="province">
        <el-input v-model="form.province" />
      </el-form-item>
      <el-form-item label="城市" prop="city">
        <el-input v-model="form.city" />
      </el-form-item>
      <el-form-item label="区县" prop="district">
        <el-input v-model="form.district" />
      </el-form-item>
      <el-form-item label="详细地址" prop="detail">
        <el-input v-model="form.detail" type="textarea" />
      </el-form-item>
      <el-form-item label="默认地址">
        <el-switch v-model="form.defaultAddress" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>
