import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Typography from '../components/Typography'
import Button from '../components/Button'
import Input from '../components/Input'
import Avatar from '../components/Avatar'
import { getCoachProfile, updateCoachProfile } from '../services/api'
import { colors, spacing, radius } from '../styles/tokens'
import {
  User, Mail, Phone, MapPin, Clock, Calendar,
  Bell, Shield, CreditCard, LogOut, ChevronRight, Save
} from 'lucide-react'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [availStart, setAvailStart] = useState('00:00')
  const [availEnd, setAvailEnd] = useState('23:59')
  const [sessionDuration, setSessionDuration] = useState([60, 90, 120])
  const [coachingDays, setCoachingDays] = useState([])

  useEffect(() => {
    getCoachProfile()
      .then(res => {
        const p = res.data
        setProfile(p)
        setName(p.name || '')
        setEmail(p.email || '')
        setPhone(p.phone || '')
        setLocation(p.location || '')
        setNotes(p.notes || '')
        setAvailStart(p.availability_start?.slice(0, 5) || '00:00')
        setAvailEnd(p.availability_end?.slice(0, 5) || '23:59')
        setSessionDuration(p.session_duration || [60, 90, 120])
        setCoachingDays(p.coaching_days || DAYS)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateCoachProfile({
        name, email, phone, location, notes,
        availability_start: availStart,
        availability_end: availEnd,
        session_duration: sessionDuration,
        coaching_days: coachingDays
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day) => {
    setCoachingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const toggleDuration = (d) => {
    setSessionDuration(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a, b) => a - b)
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: `${spacing[5]} ${spacing[8]}`,
          borderBottom: `1px solid ${colors.gray[200]}`,
          backgroundColor: 'white', flexShrink: 0
        }}>
          <div>
            <Typography variant="h3">Settings</Typography>
            <Typography variant="caption" color={colors.gray[400]}>
              Manage your profile and preferences
            </Typography>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left sidebar */}
          <div style={{
            width: '220px', flexShrink: 0,
            borderRight: `1px solid ${colors.gray[200]}`,
            backgroundColor: 'white', padding: spacing[4],
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: spacing[3],
                    padding: `${spacing[3]} ${spacing[3]}`,
                    borderRadius: radius.lg, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '14px', fontWeight: activeTab === id ? '600' : '400',
                    backgroundColor: activeTab === id ? colors.primaryLight : 'transparent',
                    color: activeTab === id ? colors.primary : colors.gray[600],
                    textAlign: 'left'
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing[3],
                padding: `${spacing[3]} ${spacing[3]}`,
                borderRadius: radius.lg, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '14px', fontWeight: '500',
                backgroundColor: 'transparent',
                color: colors.error, textAlign: 'left'
              }}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: spacing[8], backgroundColor: colors.gray[50] }}>

            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && (
              <div style={{ maxWidth: '760px' }}>

                {/* Avatar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: spacing[5],
                  marginBottom: spacing[8]
                }}>
                  <Avatar name={name} size="xl" />
                  <div>
                    <Typography variant="h3">{name}</Typography>
                    <Typography variant="bodySmall" color={colors.gray[400]}>
                      {location || 'No location set'}
                    </Typography>
                  </div>
                </div>

                {/* Personal info */}
                <Typography variant="h4" mb={spacing[4]}>Personal info</Typography>
                <div style={{
                  backgroundColor: 'white', borderRadius: radius.xl,
                  border: `1px solid ${colors.gray[200]}`,
                  padding: spacing[6], marginBottom: spacing[6]
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>FULL NAME</Typography>
                      <Input icon={<User size={16} />} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>LOCATION</Typography>
                      <Input icon={<MapPin size={16} />} value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>EMAIL</Typography>
                      <Input icon={<Mail size={16} />} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
                    </div>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>PHONE</Typography>
                      <Input icon={<Phone size={16} />} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
                    </div>
                  </div>
                  <div>
                    <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>NOTES / BIO</Typography>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="A little about your coaching style..."
                      rows={3}
                      style={{
                        width: '100%', padding: '12px 16px',
                        border: `1.5px solid ${colors.gray[200]}`,
                        borderRadius: radius.lg, fontSize: '15px',
                        fontFamily: 'inherit', resize: 'vertical',
                        outline: 'none', boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = colors.primary}
                      onBlur={e => e.target.style.borderColor = colors.gray[200]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── PREFERENCES TAB ── */}
            {activeTab === 'preferences' && (
              <div style={{ maxWidth: '760px' }}>

                <Typography variant="h4" mb={spacing[4]}>Coaching preferences</Typography>
                <div style={{
                  backgroundColor: 'white', borderRadius: radius.xl,
                  border: `1px solid ${colors.gray[200]}`,
                  padding: spacing[6], marginBottom: spacing[6]
                }}>

                  {/* Availability */}
                  <div style={{ marginBottom: spacing[6] }}>
                    <Typography variant="label" mb={spacing[3]} style={{ display: 'block' }}>
                      AVAILABILITY HOURS
                    </Typography>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
                      <div>
                        <Typography variant="caption" color={colors.gray[400]} mb={spacing[2]} style={{ display: 'block' }}>
                          Start time
                        </Typography>
                        <div style={{
                          padding: '12px 16px',
                          border: `1.5px solid ${colors.gray[200]}`,
                          borderRadius: radius.lg
                        }}>
                          <input
                            type="time"
                            value={availStart}
                            onChange={e => setAvailStart(e.target.value)}
                            style={{
                              border: 'none', outline: 'none',
                              fontSize: '15px', fontFamily: 'inherit',
                              width: '100%', backgroundColor: 'transparent'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Typography variant="caption" color={colors.gray[400]} mb={spacing[2]} style={{ display: 'block' }}>
                          End time
                        </Typography>
                        <div style={{
                          padding: '12px 16px',
                          border: `1.5px solid ${colors.gray[200]}`,
                          borderRadius: radius.lg
                        }}>
                          <input
                            type="time"
                            value={availEnd}
                            onChange={e => setAvailEnd(e.target.value)}
                            style={{
                              border: 'none', outline: 'none',
                              fontSize: '15px', fontFamily: 'inherit',
                              width: '100%', backgroundColor: 'transparent'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session durations */}
                  <div style={{ marginBottom: spacing[6] }}>
                    <Typography variant="label" mb={spacing[3]} style={{ display: 'block' }}>
                      SESSION DURATIONS
                    </Typography>
                    <div style={{ display: 'flex', gap: spacing[2] }}>
                      {[30, 60, 90, 120].map(d => (
                        <button
                          key={d}
                          onClick={() => toggleDuration(d)}
                          style={{
                            padding: '8px 20px',
                            borderRadius: radius.full,
                            border: `1.5px solid ${sessionDuration.includes(d) ? colors.primary : colors.gray[200]}`,
                            backgroundColor: sessionDuration.includes(d) ? colors.primaryLight : 'white',
                            color: sessionDuration.includes(d) ? colors.primary : colors.gray[600],
                            fontFamily: 'inherit', fontSize: '14px', fontWeight: '500',
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >
                          {d === 30 ? '30 min' : d === 60 ? '1 hour' : d === 90 ? '1.5 hours' : '2 hours'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coaching days */}
                  <div>
                    <Typography variant="label" mb={spacing[3]} style={{ display: 'block' }}>
                      COACHING DAYS
                    </Typography>
                    <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                      {DAYS.map(day => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: radius.full,
                            border: `1.5px solid ${coachingDays.includes(day) ? colors.primary : colors.gray[200]}`,
                            backgroundColor: coachingDays.includes(day) ? colors.primaryLight : 'white',
                            color: coachingDays.includes(day) ? colors.primary : colors.gray[600],
                            fontFamily: 'inherit', fontSize: '14px', fontWeight: '500',
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === 'notifications' && (
              <div style={{ maxWidth: '760px' }}>
                <Typography variant="h4" mb={spacing[4]}>Notifications</Typography>
                <div style={{
                  backgroundColor: 'white', borderRadius: radius.xl,
                  border: `1px solid ${colors.gray[200]}`,
                  overflow: 'hidden'
                }}>
                  {[
                    { label: 'Session reminders', desc: 'Get notified before sessions start' },
                    { label: 'New student requests', desc: 'When a student requests to join' },
                    { label: 'Weekly summary', desc: 'Weekly recap every Monday' },
                  ].map((item, i, arr) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: `${spacing[4]} ${spacing[6]}`,
                        borderBottom: i < arr.length - 1 ? `1px solid ${colors.gray[100]}` : 'none'
                      }}
                    >
                      <div>
                        <Typography variant="body" style={{ fontWeight: '500' }}>{item.label}</Typography>
                        <Typography variant="caption" color={colors.gray[400]}>{item.desc}</Typography>
                      </div>
                      <Toggle />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === 'security' && (
              <div style={{ maxWidth: '760px' }}>
                <Typography variant="h4" mb={spacing[4]}>Security</Typography>
                <div style={{
                  backgroundColor: 'white', borderRadius: radius.xl,
                  border: `1px solid ${colors.gray[200]}`,
                  overflow: 'hidden'
                }}>
                  {[
                    { label: 'Change password', desc: 'Update your password' },
                    { label: 'Two-factor authentication', desc: 'Add an extra layer of security' },
                  ].map((item, i, arr) => (
                    <div
                      key={item.label}
                      onClick={() => {}}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: `${spacing[4]} ${spacing[6]}`,
                        borderBottom: i < arr.length - 1 ? `1px solid ${colors.gray[100]}` : 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.gray[50]}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div>
                        <Typography variant="body" style={{ fontWeight: '500' }}>{item.label}</Typography>
                        <Typography variant="caption" color={colors.gray[400]}>{item.desc}</Typography>
                      </div>
                      <ChevronRight size={16} color={colors.gray[400]} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  )
}

// Toggle component
function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div
      onClick={() => setOn(!on)}
      style={{
        width: '44px', height: '24px',
        borderRadius: '12px',
        backgroundColor: on ? colors.primary : colors.gray[200],
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px',
        left: on ? '22px' : '2px',
        width: '20px', height: '20px',
        borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s'
      }} />
    </div>
  )
}

export default Settings