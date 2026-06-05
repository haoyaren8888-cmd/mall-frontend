import request from './request'

const normalizeProductParams = (params = {}) => {
  const normalized = { ...params }

  Object.keys(normalized).forEach(key => {
    if (typeof normalized[key] !== 'string') {
      return
    }
    const value = normalized[key].trim()
    if (value) {
      normalized[key] = value
    } else {
      delete normalized[key]
    }
  })

  if (!normalized.sort) {
    delete normalized.sort
  }

  if (
    normalized.categoryId === null ||
    normalized.categoryId === undefined ||
    Number.isNaN(normalized.categoryId)
  ) {
    delete normalized.categoryId
  }

  return normalized
}

export const getProducts = params => request.get('/products', { params: normalizeProductParams(params) })
export const getProductDetail = id => request.get(`/products/${id}`)
export const publishProduct = data => request.post('/products', data)
export const getMyProducts = params => request.get('/products/mine', { params: normalizeProductParams(params) })
export const getMyProductDetail = id => request.get(`/products/mine/${id}`)
export const updateProduct = (id, data) => request.put(`/products/${id}`, data)
export const offShelfProduct = id => request.put(`/products/${id}/off-shelf`)
export const getFavoriteProducts = params => request.get('/products/favorites', { params: normalizeProductParams(params) })
export const getFavoriteStatus = id => request.get(`/products/${id}/favorite`)
export const favoriteProduct = id => request.post(`/products/${id}/favorite`)
export const cancelFavoriteProduct = id => request.delete(`/products/${id}/favorite`)
export const getProductMessages = (id, params) => request.get(`/products/${id}/messages`, { params })
export const createProductMessage = (id, data) => request.post(`/products/${id}/messages`, data)
