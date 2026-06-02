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
