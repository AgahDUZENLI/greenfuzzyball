import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Typography from '../components/Typography'
import Button from '../components/Button'
import Input from '../components/Input'
import Avatar from '../components/Avatar'
import { getCoachProfile, updateCoachProfile, changePassword } from '../services/api'
import { colors, spacing, radius } from '../styles/tokens'
import {
  User, Mail, Phone, MapPin, Clock,
  Bell, Shield, LogOut, ChevronRight, Save
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [availStart, setAvailStart] = useState('00:00')
  const [availEnd, setAvailEnd] = useState('23:59')
  const [sessionDuration, setSessionDuration] = useState([60, 90, 120])
  const [coachingDays, setCoachingDays] = useState([])

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [notificationPrefs, setNotificationPrefs] = useState({
    session_booked: true,
    session_reminder: true,
    weekly_summary: false
  })

  useEffect(() => {
    getCoachProfile()
      .then(res => {
        const p = res.data
        setName(p.name || '')
        setEmail(p.email || '')
        setPhone(p.phone || '')
        setLocation(p.location || '')
        setNotes(p.notes || '')
        setAvailStart(p.availability_start?.slice(0, 5) || '00:00')
        setAvailEnd(p.availability_end?.slice(0, 5) || '23:59')
        setSessionDuration(p.session_duration || [60, 90, 120])
        setCoachingDays(p.coaching_days || DAYS)
        setNotificationPrefs(p.notification_preferences || {
          session_booked: true,
          session_reminder: true,
          weekly_summary: false
        })
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
        coaching_days: coachingDays,
        notification_preferences: notificationPrefs
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    if (!currentPassword) return setPasswordError('Enter your current password')
    if (!newPassword) return setPasswordError('Enter a new password')
    if (newPassword.length < 6) return setPasswordError('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return setPasswordError('Passwords do not match')
    setChangingPassword(true)
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPasswordSuccess(false)
        setShowChangePassword(false)
      }, 2000)
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Could not change password')
    } finally {
      setChangingPassword(false)
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
                      <select
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 16px',
                          border: `1.5px solid ${colors.gray[200]}`,
                          borderRadius: radius.lg, fontSize: '15px',
                          fontFamily: 'inherit', color: colors.black,
                          backgroundColor: 'white', cursor: 'pointer',
                          outline: 'none', boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select location</option>
                        <optgroup label="TX">
                          <option value="Houston, TX">Houston, TX</option>
                        </optgroup>
                      </select>
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
                  <div style={{ marginBottom: spacing[6] }}>
                    <Typography variant="label" mb={spacing[3]} style={{ display: 'block' }}>AVAILABILITY HOURS</Typography>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
                      <div>
                        <Typography variant="caption" color={colors.gray[400]} mb={spacing[2]} style={{ display: 'block' }}>Start time</Typography>
                        <div style={{ padding: '12px 16px', border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg }}>
                          <input type="time" value={availStart} onChange={e => setAvailStart(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '15px', fontFamily: 'inherit', width: '100%', backgroundColor: 'transparent' }}
                          />
                        </div>
                      </div>
                      <div>
                        <Typography variant="caption" color={colors.gray[400]} mb={spacing[2]} style={{ display: 'block' }}>End time</Typography>
                        <div style={{ padding: '12px 16px', border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg }}>
                          <input type="time" value={availEnd} onChange={e => setAvailEnd(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '15px', fontFamily: 'inherit', width: '100%', backgroundColor: 'transparent' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: spacing[6] }}>
                    <Typography variant="label" mb={spacing[3]} style={{ display: 'block' }}>SESSION DURATIONS</Typography>
                    <div style={{ display: 'flex', gap: spacing[2] }}>
                      {[30, 60, 90, 120].map(d => (
                        <button key={d} onClick={() => toggleDuration(d)} style={{
                          padding: '8px 20px', borderRadius: radius.full,
                          border: `1.5px solid ${sessionDuration.includes(d) ? colors.primary : colors.gray[200]}`,
                          backgroundColor: sessionDuration.includes(d) ? colors.primaryLight : 'white',
                          color: sessionDuration.includes(d) ? colors.primary : colors.gray[600],
                          fontFamily: 'inherit', fontSize: '14px', fontWeight: '500',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}>
                          {d === 30 ? '30 min' : d === 60 ? '1 hour' : d === 90 ? '1.5 hours' : '2 hours'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Typography variant="label" mb={spacing[3]} style={{ display: 'block' }}>COACHING DAYS</Typography>
                    <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                      {DAYS.map(day => (
                        <button key={day} onClick={() => toggleDay(day)} style={{
                          padding: '8px 16px', borderRadius: radius.full,
                          border: `1.5px solid ${coachingDays.includes(day) ? colors.primary : colors.gray[200]}`,
                          backgroundColor: coachingDays.includes(day) ? colors.primaryLight : 'white',
                          color: coachingDays.includes(day) ? colors.primary : colors.gray[600],
                          fontFamily: 'inherit', fontSize: '14px', fontWeight: '500',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}>
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
                  border: `1px solid ${colors.gray[200]}`, overflow: 'hidden'
                }}>
                  {[
                    { 
                      key: 'session_booked',
                      label: 'Session confirmation', 
                      desc: 'Email when you book a new session'
                    },
                    { 
                      key: 'session_reminder',
                      label: 'Session reminders', 
                      desc: 'Email reminder the day before a session'
                    },
                    { 
                      key: 'weekly_summary',
                      label: 'Weekly summary', 
                      desc: 'Weekly recap every Monday'
                    },
                  ].map((item, i, arr) => (
                    <div key={item.key} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: `${spacing[4]} ${spacing[6]}`,
                      borderBottom: i < arr.length - 1 ? `1px solid ${colors.gray[100]}` : 'none'
                    }}>
                      <div>
                        <Typography variant="body" style={{ fontWeight: '500' }}>{item.label}</Typography>
                        <Typography variant="caption" color={colors.gray[400]}>{item.desc}</Typography>
                      </div>
                      <Toggle
                        on={notificationPrefs[item.key] || false}
                        onChange={val => setNotificationPrefs(prev => ({ ...prev, [item.key]: val }))}
                      />
                    </div>
                  ))}
                </div>
                <Typography variant="caption" color={colors.gray[400]} style={{ display: 'block', marginTop: spacing[3] }}>
                  Emails sent to {email}. Click Save changes to apply.
                </Typography>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === 'security' && (
              <div style={{ maxWidth: '760px' }}>
                <Typography variant="h4" mb={spacing[4]}>Security</Typography>
                <div style={{
                  backgroundColor: 'white', borderRadius: radius.xl,
                  border: `1px solid ${colors.gray[200]}`, overflow: 'hidden'
                }}>

                  {/* Change password */}
                  <div style={{
                    padding: `${spacing[4]} ${spacing[6]}`,
                    borderBottom: `1px solid ${colors.gray[100]}`
                  }}>
                    <div
                      onClick={() => {
                        setShowChangePassword(!showChangePassword)
                        setPasswordError('')
                        setPasswordSuccess(false)
                      }}
                      style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', cursor: 'pointer'
                      }}
                    >
                      <div>
                        <Typography variant="body" style={{ fontWeight: '500' }}>Change password</Typography>
                        <Typography variant="caption" color={colors.gray[400]}>Update your password</Typography>
                      </div>
                      <ChevronRight size={16} color={colors.gray[400]} style={{
                        transform: showChangePassword ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s'
                      }} />
                    </div>

                    {showChangePassword && (
                      <div style={{ marginTop: spacing[5] }}>
                        {passwordError && (
                          <div style={{
                            backgroundColor: colors.errorLight, color: colors.error,
                            padding: spacing[3], borderRadius: radius.md,
                            marginBottom: spacing[3], fontSize: '13px'
                          }}>
                            {passwordError}
                          </div>
                        )}
                        {passwordSuccess && (
                          <div style={{
                            backgroundColor: colors.primaryLight, color: colors.primary,
                            padding: spacing[3], borderRadius: radius.md,
                            marginBottom: spacing[3], fontSize: '13px', fontWeight: '600'
                          }}>
                            Password changed successfully!
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                          <div>
                            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>CURRENT PASSWORD</Typography>
                            <Input
                              type="password"
                              placeholder="Enter current password"
                              value={currentPassword}
                              onChange={e => setCurrentPassword(e.target.value)}
                            />
                          </div>
                          <div>
                            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>NEW PASSWORD</Typography>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                            />
                          </div>
                          <div>
                            <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>CONFIRM NEW PASSWORD</Typography>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing[3] }}>
                            <button
                              onClick={() => {
                                setShowChangePassword(false)
                                setCurrentPassword('')
                                setNewPassword('')
                                setConfirmPassword('')
                                setPasswordError('')
                                setPasswordSuccess(false)
                              }}
                              style={{
                                background: 'none', border: 'none',
                                color: colors.gray[500], fontSize: '14px',
                                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                              }}
                            >
                              Cancel
                            </button>
                            <Button onClick={handleChangePassword} disabled={changingPassword}>
                              {changingPassword ? 'Changing...' : 'Change password'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        backgroundColor: on ? colors.primary : colors.gray[200],
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: on ? '22px' : '2px',
        width: '20px', height: '20px', borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s'
      }} />
    </div>
  )
}

export default Settings