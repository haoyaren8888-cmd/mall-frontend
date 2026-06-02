import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { guestOnly: true } },
  { path: '/register', component: () => import('@/views/RegisterView.vue'), meta: { guestOnly: true } },
  {
    path: '/',
    component: UserLayout,
    children: [
      { path: 'home', component: () => import('@/views/HomeView.vue') },
      { path: 'category/:id?', component: () => import('@/views/CategoryView.vue') },
      { path: 'product/:id', component: () => import('@/views/ProductDetailView.vue') },
      { path: 'cart', component: () => import('@/views/CartView.vue') },
      { path: 'checkout', component: () => import('@/views/CheckoutView.vue'), meta: { requiresAuth: true } },
      { path: 'pay/:orderNo', component: () => import('@/views/PayView.vue'), meta: { requiresAuth: true } },
      { path: 'orders', component: () => import('@/views/OrdersView.vue'), meta: { requiresAuth: true } },
      { path: 'orders/:orderNo', component: () => import('@/views/OrderDetailView.vue'), meta: { requiresAuth: true } },
      { path: 'address', component: () => import('@/views/AddressView.vue'), meta: { requiresAuth: true } }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'products', component: () => import('@/views/admin/ProductManageView.vue') },
      { path: 'categories', component: () => import('@/views/admin/CategoryManageView.vue') },
      { path: 'orders', component: () => import('@/views/admin/OrderManageView.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const safeRedirect = redirect => {
  if (typeof redirect !== 'string') {
    return null
  }
  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return null
  }
  return redirect
}

const homeByRole = userStore => (userStore.isAdmin ? '/admin/dashboard' : '/home')

router.beforeEach(async to => {
  const userStore = useUserStore()

  await userStore.ensureLoaded()

  if (to.meta.guestOnly && userStore.isLogin) {
    return {
      path: safeRedirect(to.query.redirect) || homeByRole(userStore),
      replace: true
    }
  }

  if (to.meta.requiresAuth && !userStore.isLogin) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
      replace: true
    }
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return {
      path: '/home',
      replace: true
    }
  }
})

export default router
