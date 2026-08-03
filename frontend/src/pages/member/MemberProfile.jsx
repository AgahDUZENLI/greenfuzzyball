import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import Typography from '../../components/Typography'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Avatar from '../../components/Avatar'
import Card from '../../components/Card'
import AddChildModal from '../../components/AddChildModal'
import EditChildModal from '../../components/EditChildModal'
import {
  getMemberProfile, updateMemberProfile, changePassword,
  getChildren, getMyJoinRequests, joinCoachByCode, removeCoach
} from '../../services/api'
import { colors, spacing, radius } from '../../styles/tokens'
import { User, Mail, Phone, MapPin, Shield, LogOut, ChevronRight, Save, Users, UserPlus, Plus, Pencil, KeyRound, Trash2, Bell } from 'lucide-react'
import useIsMobile from '../../hooks/useIsMobile'
import { isPushSupported, isStandalone, getPushSubscription, enablePush, disablePush } from '../../utils/push'
import { getPageCache, setPageCache } from '../../utils/pageCache'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'kids', label: 'My Kids', icon: Users },
  { id: 'coaches', label: 'Coaches', icon: UserPlus },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield }
]

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

function MemberProfile() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const cached = getPageCache('member-profile')
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(() => !cached?.profile)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile state
  const [name, setName] = useState(() => cached?.profile?.name || '')
  const [email, setEmail] = useState(() => cached?.profile?.email || '')
  const [phone, setPhone] = useState(() => cached?.profile?.phone || '')
  const [location, setLocation] = useState(() => cached?.profile?.location || '')
  const [age, setAge] = useState(() => cached?.profile?.age ?? '')
  const [notes, setNotes] = useState(() => cached?.profile?.notes || '')

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Push notifications state
  const [pushSupported, setPushSupported] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [pushError, setPushError] = useState('')

  useEffect(() => {
    if (!isPushSupported()) { setPushSupported(false); return }
    getPushSubscription().then(sub => {
      setPushEnabled(!!sub)
      if (!sub && Notification.permission === 'default') {
        handlePushToggle(true)
      }
    })
  }, [])

  const handlePushToggle = async (nextOn) => {
    setPushError('')
    setPushBusy(true)
    try {
      if (nextOn) await enablePush()
      else await disablePush()
      setPushEnabled(nextOn)
    } catch (err) {
      setPushError(err.message === 'Notification permission denied'
        ? 'Enable notifications in your browser/OS settings to turn this on.'
        : 'Something went wrong. Try again.')
    } finally {
      setPushBusy(false)
    }
  }

  // Kids state
  const [children, setChildren] = useState(() => cached?.children ?? [])
  const [childrenLoading, setChildrenLoading] = useState(() => !cached?.children)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [editingChild, setEditingChild] = useState(null)

  // Coaches state
  const [myRequests, setMyRequests] = useState(() => cached?.myRequests ?? [])
  const [coachesLoading, setCoachesLoading] = useState(() => !cached?.myRequests)
  const [coachCode, setCoachCode] = useState('')
  const [joiningCoach, setJoiningCoach] = useState(false)
  const [coachError, setCoachError] = useState('')

  useEffect(() => {
    getMemberProfile()
      .then(res => {
        const p = res.data
        setName(p.name || '')
        setEmail(p.email || '')
        setPhone(p.phone || '')
        setLocation(p.location || '')
        setAge(p.age ?? '')
        setNotes(p.notes || '')
        setPageCache('member-profile', { ...(getPageCache('member-profile') || {}), profile: p })
      })
      .finally(() => setLoading(false))

    getChildren()
      .then(res => {
        setChildren(res.data)
        setPageCache('member-profile', { ...(getPageCache('member-profile') || {}), children: res.data })
      })
      .catch(() => setChildren([]))
      .finally(() => setChildrenLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab !== 'coaches') return
    if (!getPageCache('member-profile')?.myRequests) setCoachesLoading(true)
    getMyJoinRequests()
      .then(res => {
        setMyRequests(res.data)
        setPageCache('member-profile', { ...(getPageCache('member-profile') || {}), myRequests: res.data })
      })
      .catch(() => setMyRequests([]))
      .finally(() => setCoachesLoading(false))
  }, [activeTab])

  const handleJoinByCode = async () => {
    if (!coachCode.trim()) return setCoachError('Enter a coach code')
    setCoachError('')
    setJoiningCoach(true)
    try {
      const res = await joinCoachByCode(coachCode.trim())
      setMyRequests(prev => [res.data, ...prev])
      setCoachCode('')
    } catch (err) {
      setCoachError(err.response?.data?.detail || 'Could not add coach')
    } finally {
      setJoiningCoach(false)
    }
  }

  const handleRemoveCoach = async (request) => {
    if (!window.confirm(`Remove ${request.coach_name}? This cannot be undone.`)) return
    try {
      await removeCoach(request.request_id)
      setMyRequests(prev => prev.filter(r => r.request_id !== request.request_id))
    } catch {}
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMemberProfile({ name, email, phone, location, age: age ? parseInt(age) : null, notes })
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: isMobile ? 'auto' : 'hidden' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? spacing[3] : 0,
          padding: isMobile ? `${spacing[4]} ${spacing[4]}` : `${spacing[5]} ${spacing[8]}`,
          borderBottom: `1px solid ${colors.gray[200]}`,
          backgroundColor: 'white', flexShrink: 0
        }}>
          <div>
            <Typography variant="h3">Profile</Typography>
            <Typography variant="caption" color={colors.gray[400]}>
              Manage your account details
            </Typography>
          </div>
          {activeTab === 'profile' && (
            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
            </Button>
          )}
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, overflow: isMobile ? 'visible' : 'hidden' }}>

          {/* Left sidebar */}
          <div style={{
            width: isMobile ? '100%' : '220px', flexShrink: 0,
            borderRight: isMobile ? 'none' : `1px solid ${colors.gray[200]}`,
            borderBottom: isMobile ? `1px solid ${colors.gray[200]}` : 'none',
            backgroundColor: 'white', padding: spacing[4],
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <nav style={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              gap: spacing[1],
              overflowX: isMobile ? 'auto' : 'visible'
            }}>
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
                    textAlign: 'left', whiteSpace: 'nowrap'
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
                color: colors.error, textAlign: 'left',
                marginTop: isMobile ? spacing[3] : 0
              }}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? spacing[4] : spacing[8], backgroundColor: colors.gray[50] }}>

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
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>FULL NAME</Typography>
                      <Input icon={<User size={16} />} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>LOCATION</Typography>
                      <Input icon={<MapPin size={16} />} value={location} onChange={e => setLocation(e.target.value)} placeholder="Your location" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>EMAIL</Typography>
                      <Input icon={<Mail size={16} />} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
                    </div>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>PHONE</Typography>
                      <Input icon={<Phone size={16} />} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
                    <div>
                      <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>AGE</Typography>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="Your age"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 16px',
                          border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg,
                          fontSize: '15px', fontFamily: 'inherit', color: colors.black,
                          outline: 'none', boxSizing: 'border-box'
                        }}
                        onFocus={e => e.target.style.borderColor = colors.primary}
                        onBlur={e => e.target.style.borderColor = colors.gray[200]}
                      />
                    </div>
                  </div>
                  <div>
                    <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>NOTES</Typography>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Anything your coach should know..."
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

            {/* ── KIDS TAB ── */}
            {activeTab === 'kids' && (
              <div style={{ maxWidth: '760px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                  <Typography variant="h4">My Kids</Typography>
                  <button
                    onClick={() => setShowAddChildModal(true)}
                    style={{
                      width: '32px', height: '32px',
                      backgroundColor: colors.primary, border: 'none',
                      borderRadius: radius.lg, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Plus size={16} color="white" />
                  </button>
                </div>

                {childrenLoading ? (
                  <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
                ) : children.length === 0 ? (
                  <Card style={{ padding: spacing[6], textAlign: 'center' }}>
                    <Typography variant="bodySmall" color={colors.gray[400]}>
                      No kids linked yet
                    </Typography>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                    {children.map(child => (
                      <div
                        key={child.user_id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: spacing[4],
                          padding: spacing[4], borderRadius: radius.xl,
                          backgroundColor: 'white', border: `1px solid ${colors.gray[200]}`
                        }}
                      >
                        <Avatar name={child.name} size="md" />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                            <Typography variant="body" style={{ fontWeight: '600' }}>{child.name}</Typography>
                            <span style={{
                              padding: `2px ${spacing[2]}`,
                              borderRadius: radius.full,
                              backgroundColor: child.coach_name ? colors.primaryLight : colors.gray[100],
                              color: child.coach_name ? colors.primary : colors.gray[500],
                              fontSize: '11px', fontWeight: '600'
                            }}>
                            </span>
                          </div>
                          <Typography variant="bodySmall" color={colors.gray[500]}>
                            {child.age ? `Age ${child.age}` : 'Age not set'} · {capitalize(child.level)}
                            {child.phone ? ` · ${child.phone}` : ''}
                          </Typography>
                        </div>
                        <button
                          onClick={() => setEditingChild(child)}
                          style={{
                            width: '32px', height: '32px', border: 'none', borderRadius: radius.md,
                            backgroundColor: colors.gray[100], color: colors.gray[600],
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── COACHES TAB ── */}
            {activeTab === 'coaches' && (
              <div style={{ maxWidth: '760px' }}>
                <Typography variant="h4" mb={spacing[2]}>Add a Coach</Typography>
                <Typography variant="bodySmall" color={colors.gray[400]} mb={spacing[4]} style={{ display: 'block' }}>
                  Ask your coach for their code and enter it below to connect instantly.
                </Typography>

                <div style={{
                  backgroundColor: 'white', borderRadius: radius.xl,
                  border: `1px solid ${colors.gray[200]}`,
                  padding: spacing[6], marginBottom: spacing[6]
                }}>
                  {coachError && (
                    <div style={{
                      backgroundColor: colors.errorLight, color: colors.error,
                      padding: spacing[3], borderRadius: radius.md,
                      marginBottom: spacing[4], fontSize: '13px'
                    }}>
                      {coachError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: spacing[3] }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        icon={<KeyRound size={16} />}
                        placeholder="Enter coach code"
                        value={coachCode}
                        onChange={e => setCoachCode(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleJoinByCode} disabled={joiningCoach}>
                      {joiningCoach ? 'Adding...' : 'Add Coach'}
                    </Button>
                  </div>
                </div>

                <Typography variant="h4" mb={spacing[4]}>My Coaches</Typography>
                {coachesLoading ? (
                  <Typography variant="bodySmall" color={colors.gray[400]}>Loading...</Typography>
                ) : myRequests.length === 0 ? (
                  <Card style={{ padding: spacing[6], textAlign: 'center' }}>
                    <Typography variant="bodySmall" color={colors.gray[400]}>
                      No coaches added yet
                    </Typography>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                    {myRequests.map(request => (
                      <div
                        key={request.request_id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: spacing[4],
                          padding: spacing[4], borderRadius: radius.xl,
                          backgroundColor: 'white', border: `1px solid ${colors.gray[200]}`
                        }}
                      >
                        <Avatar name={request.coach_name} size="md" />
                        <div style={{ flex: 1 }}>
                          <Typography variant="body" style={{ fontWeight: '600' }}>{request.coach_name}</Typography>
                        </div>
                        <div style={{
                          padding: `${spacing[1]} ${spacing[3]}`,
                          borderRadius: radius.full,
                          backgroundColor: request.status === 'approved' ? colors.primaryLight
                            : request.status === 'rejected' ? colors.errorLight : colors.gray[100],
                          color: request.status === 'approved' ? colors.primary
                            : request.status === 'rejected' ? colors.error : colors.gray[500],
                          fontSize: '13px', fontWeight: '600'
                        }}>
                          {capitalize(request.status)}
                        </div>
                        <button
                          onClick={() => handleRemoveCoach(request)}
                          style={{
                            width: '32px', height: '32px', border: 'none', borderRadius: radius.md,
                            backgroundColor: colors.errorLight, color: colors.error,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: `${spacing[4]} ${spacing[6]}`, gap: spacing[4]
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body" style={{ fontWeight: '500' }}>Push notifications</Typography>
                      <Typography variant="caption" color={colors.gray[400]}>
                        {!pushSupported
                          ? 'Not supported in this browser'
                          : (!isStandalone() && /iPhone|iPad|iPod/.test(navigator.userAgent))
                            ? 'Install this app to your Home Screen to enable push on iOS'
                            : 'Get an alert on this device when a coach responds or a session changes'}
                      </Typography>
                      {pushError && (
                        <Typography variant="caption" color={colors.error} style={{ display: 'block' }}>
                          {pushError}
                        </Typography>
                      )}
                    </div>
                    {pushSupported && (
                      <Toggle on={pushEnabled} onChange={handlePushToggle} disabled={pushBusy} />
                    )}
                  </div>
                </div>
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
                    padding: `${spacing[4]} ${spacing[6]}`
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

      {showAddChildModal && (
        <AddChildModal
          onClose={() => setShowAddChildModal(false)}
          onAdded={child => setChildren(prev => [...prev, child])}
        />
      )}

      {editingChild && (
        <EditChildModal
          child={editingChild}
          onClose={() => setEditingChild(null)}
          onUpdated={updated => setChildren(prev => prev.map(c => c.user_id === updated.user_id ? updated : c))}
          onDeleted={id => setChildren(prev => prev.filter(c => c.user_id !== id))}
        />
      )}
    </Layout>
  )
}

function Toggle({ on, onChange, disabled }) {
  return (
    <div
      onClick={() => !disabled && onChange(!on)}
      style={{
        width: '48px', height: '28px', borderRadius: '14px',
        backgroundColor: on ? colors.primary : colors.gray[200],
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
        position: 'relative', transition: 'background 0.2s', flexShrink: 0
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: on ? '22px' : '2px',
        width: '24px', height: '24px', borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s'
      }} />
    </div>
  )
}

export default MemberProfile
