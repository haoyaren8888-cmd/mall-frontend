import request from './request'

export const register = data => request.post('/auth/register', data)
export const login = data => request.post('/auth/login', data)
export const logout = () => request.post('/auth/logout')
export const me = () => request.get('/auth/me')
export const updateProfile = data => request.put('/auth/profile', data)
export const updatePassword = data => request.put('/auth/password', data)
