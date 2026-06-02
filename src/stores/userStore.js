import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import { useCartStore } from './cartStore'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null,
    loaded: false
  }),
  getters: {
    isLogin: state => !!state.user,
    isAdmin: state => state.user?.role === 'ADMIN'
  },
  actions: {
    async register(data) {
      return authApi.register(data)
    },
    async login(data) {
      this.user = await authApi.login(data)
      this.loaded = true
      const cartStore = useCartStore()
      await cartStore.mergeLocalCart()
      return this.user
    },
    async fetchMe() {
      try {
        this.user = await authApi.me()
      } catch {
        this.user = null
      } finally {
        this.loaded = true
      }
      return this.user
    },
    async logout() {
      await authApi.logout()
      this.user = null
      this.loaded = true
    }
  }
})
