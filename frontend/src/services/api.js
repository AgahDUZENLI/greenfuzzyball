import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
  formData.append('role', data.role)
  return axios.post(`${API_URL}/auth/login`, formData)
}
export const getMe = () => api.get('/auth/me')
export const changePassword = (data) => api.post('/auth/change-password', data)

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
export const getDrillCategories = () => api.get('/drills/categories')
export const createDrill = (data) => api.post('/drills/', data)
export const updateDrill = (id, data) => api.put(`/drills/${id}`, data)
export const deleteDrill = (id) => api.delete(`/drills/${id}`)
export const removeDrillFromLibrary = (id) => api.delete(`/drills/${id}/remove`)
export const getSharedDrill = (token) => api.get(`/drills/share/${token}`)
export const createDrillCategory = (data) => api.post('/drills/categories', data)
export const deleteDrillCategory = (id) => api.delete(`/drills/categories/${id}`)

// Sessions
export const getSessions = (date, studentId) => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  if (studentId) params.append('student_id', studentId)
  const qs = params.toString()
  return api.get(`/sessions/${qs ? `?${qs}` : ''}`)
}
export const getSession = (id) => api.get(`/sessions/${id}`)
export const createSession = (data) => api.post('/sessions/', data)
export const deleteSession = (id) => api.delete(`/sessions/${id}`)
export const cancelSessionAsCoach = (sessionId, note) => api.post(`/sessions/${sessionId}/cancel`, { note: note || null })
export const addRating = (sessionId, data) => api.post(`/sessions/${sessionId}/ratings`, data)
export const getStudentProgress = (studentId) => api.get(`/sessions/progress/${studentId}`)
export const getSessionByDate = (date) => api.get(`/sessions/?date=${date}`)
export const addDrillToSession = (sessionId, drillId) => api.post(`/sessions/${sessionId}/drills`, { drill_id: drillId })
export const removeDrillFromSession = (sessionId, drillId) => api.delete(`/sessions/${sessionId}/drills/${drillId}`)
export const updateSession = (sessionId, data) => api.patch(`/sessions/${sessionId}`, data)
export const importSharedDrill = (token, force = false) => api.post(`/drills/share/${token}/import${force ? '?force=true' : ''}`)

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

// Members
export const getMemberSessions = (studentId) => api.get(`/members/sessions${studentId ? `?student_id=${studentId}` : ''}`)
export const getMemberProgress = (studentId) => api.get(`/members/progress${studentId ? `?student_id=${studentId}` : ''}`)
export const getMemberProfile = () => api.get('/members/me')
export const updateMemberProfile = (data) => api.put('/members/me', data)
export const getChildren = () => api.get('/members/children')
export const addChild = (data) => api.post('/members/children', data)
export const updateChild = (childId, data) => api.put(`/members/children/${childId}`, data)
export const deleteChild = (childId) => api.delete(`/members/children/${childId}`)
export const getMyJoinRequests = () => api.get('/members/join-requests')
export const joinCoachByCode = (code) => api.post('/members/join-by-code', { code })
export const removeCoach = (requestId) => api.delete(`/members/join-requests/${requestId}`)
export const requestSession = (data) => api.post('/members/session-requests', data)
export const getMySessionRequests = () => api.get('/members/session-requests')
export const deleteSessionRequest = (requestId) => api.delete(`/members/session-requests/${requestId}`)
export const cancelSession = (sessionId, reason) => api.post(`/members/sessions/${sessionId}/cancel`, { reason: reason || null })
export const getMemberSessionDetail = (sessionId) => api.get(`/members/sessions/${sessionId}`)

// Coaches (join requests)
export const getCoachJoinRequests = () => api.get('/coaches/join-requests')
export const respondToJoinRequest = (requestId, status) => api.patch(`/coaches/join-requests/${requestId}`, { status })

// Coaches (session requests)
export const getCoachSessionRequests = () => api.get('/coaches/session-requests')
export const respondToSessionRequest = (requestId, status) => api.patch(`/coaches/session-requests/${requestId}`, { status })

// Coaches (cancellation requests)
export const getCoachCancellationRequests = () => api.get('/coaches/session-cancellations')
export const respondToCancellation = (sessionId, status) => api.patch(`/coaches/session-cancellations/${sessionId}`, { status })

// Notifications
export const getNotifications = () => api.get('/notifications/')
export const markAllNotificationsRead = () => api.patch('/notifications/read-all')