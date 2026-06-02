import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'src/api/auth.js',
  'src/api/product.js',
  'src/api/category.js',
  'src/api/cart.js',
  'src/api/address.js',
  'src/api/order.js',
  'src/api/payment.js',
  'src/api/admin.js',
  'src/router/index.js',
  'src/views/HomeView.vue',
  'src/views/CategoryView.vue',
  'src/views/ProductDetailView.vue',
  'src/views/CartView.vue',
  'src/views/CheckoutView.vue',
  'src/views/AddressView.vue',
  'src/views/admin/ProductManageView.vue',
  'src/views/admin/CategoryManageView.vue',
  'src/views/admin/OrderManageView.vue'
]

const missingFiles = requiredFiles.filter(file => !existsSync(join(root, file)))

if (missingFiles.length > 0) {
  console.error(`Missing frontend files:\n${missingFiles.join('\n')}`)
  process.exit(1)
}

const router = readFileSync(join(root, 'src/router/index.js'), 'utf8')
const requiredRouteText = [
  'path: \'/login\'',
  'path: \'/register\'',
  'path: \'home\'',
  'path: \'category/:id?\'',
  'path: \'product/:id\'',
  'path: \'cart\'',
  'path: \'checkout\'',
  'path: \'address\'',
  'path: \'/admin\'',
  'path: \'products\'',
  'path: \'categories\'',
  'path: \'orders\''
]

const missingRoutes = requiredRouteText.filter(text => !router.includes(text))

if (missingRoutes.length > 0) {
  console.error(`Missing route definitions:\n${missingRoutes.join('\n')}`)
  process.exit(1)
}

const request = readFileSync(join(root, 'src/api/request.js'), 'utf8')
const requestChecks = ['withCredentials: true', 'baseURL:', 'interceptors.response.use']
const missingRequestChecks = requestChecks.filter(text => !request.includes(text))

if (missingRequestChecks.length > 0) {
  console.error(`Request wrapper check failed:\n${missingRequestChecks.join('\n')}`)
  process.exit(1)
}

console.log('Frontend check passed')
