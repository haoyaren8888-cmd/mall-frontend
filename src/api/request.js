import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true
})

request.interceptors.response.use(
  response => {
    const body = response.data
    if (body.code === 200) {
      return body.data
    }
    ElMessage.error(body.message || '服务异常')
    if (body.code === 401) {
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    }
    return Promise.reject(body)
  },
  error => {
    const message = error.response?.data?.message || '服务异常'
    ElMessage.error(message)
    if (error.response?.status === 401) {
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default request
