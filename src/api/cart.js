import request from './request'

export const getCart = () => request.get('/cart')
export const addCartItem = data => request.post('/cart/items', data)
export const updateCartItem = (id, data) => request.put(`/cart/items/${id}`, data)
export const deleteCartItem = id => request.delete(`/cart/items/${id}`)
export const mergeCart = data => request.post('/cart/merge', data)
