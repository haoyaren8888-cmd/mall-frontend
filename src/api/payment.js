import request from './request'

export const mockPay = orderNo => request.post(`/payments/mock/${orderNo}`)
