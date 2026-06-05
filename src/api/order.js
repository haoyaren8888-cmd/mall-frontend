import request from './request'

export const createOrder = data => request.post('/orders', data)
export const getOrders = params => request.get('/orders', { params })
export const getSalesOrders = params => request.get('/orders/sales', { params })
export const getOrderDetail = orderNo => request.get(`/orders/${orderNo}`)
export const cancelOrder = orderNo => request.put(`/orders/${orderNo}/cancel`)
export const finishOrder = orderNo => request.put(`/orders/${orderNo}/finish`)
