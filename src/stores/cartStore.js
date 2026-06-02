import { defineStore } from 'pinia'
import { addCartItem, deleteCartItem, getCart, mergeCart, updateCartItem } from '@/api/cart'
import { useUserStore } from './userStore'

const LOCAL_KEY = 'mall-local-cart'

const toNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const normalizeQuantity = (quantity, stock) => {
  const max = toNumber(stock) > 0 ? toNumber(stock) : 999
  return Math.min(Math.max(Number.parseInt(quantity, 10) || 1, 1), max)
}

const normalizeLocalItem = item => {
  const quantity = normalizeQuantity(item.quantity, item.stock)
  const price = toNumber(item.price)
  return {
    ...item,
    price,
    quantity,
    checked: item.checked !== false,
    subtotal: price * quantity
  }
}

const normalizeLocalItems = items => items
  .filter(item => item?.productId)
  .map(normalizeLocalItem)

const readLocal = () => {
  try {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    return Array.isArray(items) ? normalizeLocalItems(items) : []
  } catch {
    return []
  }
}

const writeLocal = items => localStorage.setItem(LOCAL_KEY, JSON.stringify(normalizeLocalItems(items)))

export const useCartStore = defineStore('cartStore', {
  state: () => ({
    items: [],
    localItems: readLocal()
  }),
  getters: {
    displayItems: state => {
      const userStore = useUserStore()
      return userStore.isLogin ? state.items : state.localItems
    },
    totalQuantity: state => {
      const userStore = useUserStore()
      const source = userStore.isLogin ? state.items : state.localItems
      return source.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    }
  },
  actions: {
    async load() {
      const userStore = useUserStore()
      if (userStore.isLogin) {
        this.items = await getCart()
      } else {
        this.localItems = readLocal()
      }
    },
    async add(product, quantity = 1) {
      const userStore = useUserStore()
      if (userStore.isLogin) {
        await addCartItem({ productId: product.id, quantity, checked: true })
        await this.load()
        return
      }
      const existed = this.localItems.find(item => item.productId === product.id)
      if (existed) {
        existed.quantity = normalizeQuantity(existed.quantity + quantity, existed.stock)
        existed.checked = true
      } else {
        this.localItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.coverImage,
          price: toNumber(product.price),
          stock: product.stock,
          quantity: normalizeQuantity(quantity, product.stock),
          checked: true
        })
      }
      this.localItems = normalizeLocalItems(this.localItems)
      writeLocal(this.localItems)
    },
    async update(item, data) {
      const userStore = useUserStore()
      if (userStore.isLogin) {
        await updateCartItem(item.id, data)
        await this.load()
        return
      }
      Object.assign(item, {
        ...data,
        quantity: data.quantity == null ? item.quantity : normalizeQuantity(data.quantity, item.stock)
      })
      this.localItems = normalizeLocalItems(this.localItems)
      writeLocal(this.localItems)
    },
    async remove(item) {
      const userStore = useUserStore()
      if (userStore.isLogin) {
        await deleteCartItem(item.id)
        await this.load()
        return
      }
      this.localItems = this.localItems.filter(row => row.productId !== item.productId)
      writeLocal(this.localItems)
    },
    async mergeLocalCart() {
      this.localItems = readLocal()
      if (!this.localItems.length) {
        await this.load()
        return
      }
      await mergeCart({
        items: this.localItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          checked: item.checked
        }))
      })
      this.localItems = []
      writeLocal([])
      await this.load()
    }
  }
})
