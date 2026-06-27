import axios from 'axios'

const API_URL = 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Automatically add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => {
  const formData = new FormData()
  formData.append('username', data.email)
  formData.append('password', data.password)
  return axios.post(`${API_URL}/auth/login`, formData)
}
export const getMe = () => api.get('/auth/me')

//User
export const getUserLocation = () => api.get('/user/location')

// Students
export const getStudents = () => api.get('/students/')
export const getStudent = (id) => api.get(`/students/${id}`)
export const createStudent = (data) => api.post('/students/', data)
export const updateStudent = (id, data) => api.put(`/students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/students/${id}`)

// Drills
export const getDrills = () => api.get('/drills/')
export const getDrill = (id) => api.get(`/drills/${id}`)
export const createDrill = (data) => api.post('/drills/', data)
export const updateDrill = (id, data) => api.put(`/drills/${id}`, data)
export const deleteDrill = (id) => api.delete(`/drills/${id}`)
export const getCategories = () => api.get('/drills/categories')
export const createCategory = (data) => api.post('/drills/categories', data)

// Sessions
export const getSessions = (date) => api.get(date ? `/sessions/?date=${date}` : '/sessions/')
export const getSession = (id) => api.get(`/sessions/${id}`)
export const createSession = (data) => api.post('/sessions/', data)
export const deleteSession = (id) => api.delete(`/sessions/${id}`)
export const addRating = (sessionId, data) => api.post(`/sessions/${sessionId}/ratings`, data)
export const getStudentProgress = (studentId) => api.get(`/sessions/progress/${studentId}`)
export const getSessionByDate = (date) => api.get(`/sessions/?date=${date}`)
export const addDrillToSession = (sessionId, drillId) => api.post(`/sessions/${sessionId}/drills`, { drill_id: drillId })
export const removeDrillFromSession = (sessionId, drillId) => api.delete(`/sessions/${sessionId}/drills/${drillId}`)
export const updateSession = (sessionId, data) => api.patch(`/sessions/${sessionId}`, data)

//Courts
export const getCourts = (city) => api.get(`/courts/${city ? `?city=${city}` : ''}`)
export const getCoachCourts = () => api.get('/courts/mine')

// Password reset
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })
export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, new_password: newPassword })

// Coach
export const getCoachProfile = () => api.get('/coaches/profile')
export const updateCoachProfile = (data) => api.put('/coaches/profile', data)
