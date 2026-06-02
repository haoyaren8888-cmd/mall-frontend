import { defineStore } from 'pinia'
import { getCategoryTree } from '@/api/category'

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    tree: []
  }),
  getters: {
    flat: state => {
      const result = []
      const walk = items => {
        const rows = items || []
        rows.forEach(item => {
          result.push(item)
          if (item.children?.length) {
            walk(item.children)
          }
        })
      }
      walk(state.tree)
      return result
    }
  },
  actions: {
    async load() {
      this.tree = await getCategoryTree() || []
      return this.tree
    }
  }
})
