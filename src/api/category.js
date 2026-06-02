import request from './request'

export const getCategoryTree = () => request.get('/categories/tree')
