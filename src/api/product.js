import request from './request'

const normalizeProductParams = (params = {}) => {
  const normalized = { ...params }

  if (typeof normalized.keyword === 'string') {
    const keyword = normalized.keyword.trim()
    if (keyword) {
      normalized.keyword = keyword
    } else {
      delete normalized.keyword
    }
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
