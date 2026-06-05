import request from './request'

export const mockPay = orderNo => request.post(`/payments/mock/${orderNo}`)
export const getPaymentRecord = orderNo => request.get(`/payments/${orderNo}`)
