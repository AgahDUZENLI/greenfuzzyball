import { useState, useEffect, useRef } from 'react'
import {
  getSession, addRating, getDrills,
  addDrillToSession, removeDrillFromSession, updateSession
} from '../services/api'
import { formatTime12 } from '../utils/timeUtils'

function calcEndTime(startTime, durationMinutes) {
  if (!startTime) return null
  const [h, m] = String(startTime).split(':').map(Number)
  const total = h * 60 + m + (durationMinutes || 60)
  const eh = Math.floor(total / 60) % 24
  const em = total % 60
  return formatTime12(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`)
}

export function useSessionDetail(sessionId) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modals
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRepeatModal, setShowRepeatModal] = useState(false)

  // Drills
  const [allDrills, setAllDrills] = useState([])
  const [showDrillPicker, setShowDrillPicker] = useState(false)
  const [drillSearch, setDrillSearch] = useState('')
  const pickerRef = useRef(null)

  // Notes
  const [sessionNotes, setSessionNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  // Ratings
  const [ratings, setRatings] = useState({})
  const [savedRatings, setSavedRatings] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [savingRatings, setSavingRatings] = useState(false)
  const [ratingsSaved, setRatingsSaved] = useState(false)

  // ── Load session ──────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true)
    getSession(sessionId)
      .then(res => {
        const s = res.data
        setSession(s)
        setSessionNotes(s.notes || '')

        const initial = {}
        s.ratings?.forEach(r => {
          initial[`${r.student_id}-${r.drill_id}`] = { rating: r.rating, notes: r.notes || '' }
        })
        setRatings(initial)

        getDrills().then(d => setAllDrills(d.data)).catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  // ── Close drill picker on outside click ───────────────────────────────────

  useEffect(() => {
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowDrillPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().split('T')[0]
  const isPast = session ? session.date < todayStr : false

  const dateLabel = session
    ? new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      })
    : ''

  const startTime = session ? formatTime12(session.start_time) : null
  const endTime = session ? calcEndTime(session.start_time, session.duration_minutes) : null

  const allRatingValues = Object.values(ratings).map(r => r.rating).filter(Boolean)
  const computedAvg = allRatingValues.length > 0
    ? (allRatingValues.reduce((a, b) => a + b, 0) / allRatingValues.length).toFixed(1)
    : null

  const availableDrills = allDrills.filter(
    d => !session?.drills?.find(sd => String(sd.drill_id) === String(d.drill_id))
  )
  const filteredAvailable = availableDrills.filter(d =>
    d.name.toLowerCase().includes(drillSearch.toLowerCase())
  )

  // ── Drill handlers ────────────────────────────────────────────────────────

  async function handleAddDrill(drill) {
    const newDrill = { drill_id: drill.drill_id, name: drill.name, description: drill.description }
    setSession(prev => ({ ...prev, drills: [...(prev.drills || []), newDrill] }))
    setShowDrillPicker(false)
    setDrillSearch('')
    try {
      await addDrillToSession(sessionId, drill.drill_id)
    } catch {
      setSession(prev => ({
        ...prev,
        drills: prev.drills.filter(d => String(d.drill_id) !== String(drill.drill_id))
      }))
    }
  }

  async function handleRemoveDrill(drillId) {
    const removed = session.drills.find(d => String(d.drill_id) === String(drillId))
    setSession(prev => ({
      ...prev,
      drills: prev.drills.filter(d => String(d.drill_id) !== String(drillId))
    }))
    try {
      await removeDrillFromSession(sessionId, drillId)
    } catch {
      setSession(prev => ({ ...prev, drills: [...prev.drills, removed] }))
    }
  }

  // ── Notes handler ─────────────────────────────────────────────────────────

  async function handleSaveNotes() {
    setSavingNotes(true)
    try {
      await updateSession(sessionId, { notes: sessionNotes })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } finally {
      setSavingNotes(false)
    }
  }

  // ── Rating handlers ───────────────────────────────────────────────────────

  function setRating(studentId, drillId, value) {
    const key = `${studentId}-${drillId}`
    setRatings(prev => ({ ...prev, [key]: { ...(prev[key] || {}), rating: value } }))
  }

  function setRatingNote(studentId, drillId, notes) {
    const key = `${studentId}-${drillId}`
    setRatings(prev => ({ ...prev, [key]: { ...(prev[key] || {}), notes } }))
  }

  function enterEditMode() {
    setSavedRatings({ ...ratings })
    setEditMode(true)
  }

  function cancelEdit() {
    setRatings(savedRatings)
    setEditMode(false)
  }

  async function handleSaveRatings() {
    setSavingRatings(true)
    try {
      const tasks = []
      session.drills?.forEach(drill => {
        session.students?.forEach(student => {
          const key = `${student.user_id}-${drill.drill_id}`
          const r = ratings[key]
          if (r?.rating) {
            tasks.push(addRating(sessionId, {
              student_id: student.user_id,
              drill_id: drill.drill_id,
              rating: r.rating,
              notes: r.notes || null
            }))
          }
        })
      })
      await Promise.all(tasks)
      setRatingsSaved(true)
      setEditMode(false)
      setTimeout(() => setRatingsSaved(false), 2500)
    } finally {
      setSavingRatings(false)
    }
  }

  // ── Edit modal callback ───────────────────────────────────────────────────

  function handleSessionUpdated() {
    getSession(sessionId).then(res => {
      setSession(res.data)
      setSessionNotes(res.data.notes || '')
    })
  }

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    // Data
    session, loading, setSession,
    // Derived
    isPast, dateLabel, startTime, endTime, computedAvg,
    availableDrills, filteredAvailable,
    // Modals
    showEditModal, setShowEditModal,
    showRepeatModal, setShowRepeatModal,
    handleSessionUpdated,
    // Drills
    allDrills, showDrillPicker, setShowDrillPicker, drillSearch, setDrillSearch, pickerRef,
    handleAddDrill, handleRemoveDrill,
    // Notes
    sessionNotes, setSessionNotes, savingNotes, notesSaved, handleSaveNotes,
    // Ratings
    ratings, editMode, savingRatings, ratingsSaved,
    setRating, setRatingNote, enterEditMode, cancelEdit, handleSaveRatings,
  }
}
