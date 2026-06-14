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
export const getSessions = () => api.get('/sessions/')
export const getSession = (id) => api.get(`/sessions/${id}`)
export const createSession = (data) => api.post('/sessions/', data)
export const deleteSession = (id) => api.delete(`/sessions/${id}`)
export const addRating = (sessionId, data) => api.post(`/sessions/${sessionId}/ratings`, data)
export const getStudentProgress = (studentId) => api.get(`/sessions/progress/${studentId}`)

// Coach
export const getProfile = () => api.get('/coaches/profile')
export const updateProfile = (data) => api.put('/coaches/profile', data)