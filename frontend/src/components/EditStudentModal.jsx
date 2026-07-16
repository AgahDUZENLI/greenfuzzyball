import { useState } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Input from './Input'
import Button from './Button'
import Avatar from './Avatar'
import Modal from './Modal'
import { User, Phone, Mail, Trash2 } from 'lucide-react'
import { updateStudent, deleteStudent } from '../services/api'
import useIsMobile from '../hooks/useIsMobile'

function EditStudentModal({ student, onClose, onUpdated, onDeleted }) {
  const isMobile = useIsMobile()
  const [name, setName] = useState(student.name || '')
  const [ageGroup, setAgeGroup] = useState(student.age_group || 'adults')
  const [phone, setPhone] = useState(student.phone || '')
  const [email, setEmail] = useState(student.email || '')
  const [level, setLevel] = useState(student.level || 'beginner')
  const [notes, setNotes] = useState(student.notes || '')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) return setError('Name is required')
    setError('')
    setLoading(true)
    try {
      const res = await updateStudent(student.user_id, { name, age_group: ageGroup, phone, email, level, notes })
      onUpdated(res.data)
      onClose()
    } catch {
      setError('Could not update student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${student.name}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteStudent(student.user_id)
      onDeleted(student.user_id)
      onClose()
    } catch {
      setError('Could not delete student.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal title="Edit Student" subtitle={`Update ${student.name}'s profile`} onClose={onClose} maxWidth="520px">

      {/* Avatar preview */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: spacing[4],
        padding: spacing[4], backgroundColor: colors.gray[50],
        borderRadius: radius.xl, marginBottom: spacing[5]
      }}>
        <Avatar name={name || student.name} size="lg" />
        <Typography variant="body" style={{ fontWeight: '600' }}>
          {name || student.name}
        </Typography>
      </div>

      {error && (
        <div style={{
          backgroundColor: colors.errorLight, color: colors.error,
          padding: spacing[3], borderRadius: radius.md,
          marginBottom: spacing[4], fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {/* Name + Age Group */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>FULL NAME</Typography>
          <Input icon={<User size={16} />} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>AGE GROUP</Typography>
          <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} style={{
            width: '100%', padding: '12px 16px',
            border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg,
            fontSize: '15px', fontFamily: 'inherit', color: colors.black,
            backgroundColor: 'white', cursor: 'pointer', outline: 'none', boxSizing: 'border-box'
          }}>
            <option value="kids">Kids</option>
            <option value="adults">Adult</option>
            <option value="veterans">Veteran</option>
          </select>
        </div>
      </div>

      {/* Phone + Email */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>PHONE</Typography>
          <Input icon={<Phone size={16} />} placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>EMAIL</Typography>
          <Input type="email" icon={<Mail size={16} />} placeholder="athlete@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>

      {/* Level */}
      <div style={{ marginBottom: spacing[4] }}>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>LEVEL</Typography>
        <div style={{ display: 'flex', backgroundColor: colors.gray[100], borderRadius: radius.xl, padding: '4px' }}>
          {['beginner', 'intermediate', 'advanced'].map(l => (
            <button key={l} onClick={() => setLevel(l)} style={{
              flex: 1, padding: spacing[2], border: 'none', borderRadius: radius.lg,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
              fontWeight: level === l ? '600' : '400',
              backgroundColor: level === l ? 'white' : 'transparent',
              color: level === l ? colors.black : colors.gray[500],
              boxShadow: level === l ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s'
            }}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: spacing[6] }}>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>NOTES</Typography>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Goals, focus areas, anything to remember..."
          rows={3}
          style={{
            width: '100%', padding: '12px 16px',
            border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg,
            fontSize: '15px', fontFamily: 'inherit', color: colors.black,
            resize: 'vertical', outline: 'none', boxSizing: 'border-box'
          }}
          onFocus={e => e.target.style.borderColor = colors.primary}
          onBlur={e => e.target.style.borderColor = colors.gray[200]}
        />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={handleDelete} disabled={deleting} style={{
          background: 'none', border: 'none', color: colors.error,
          fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: spacing[2]
        }}>
          <Trash2 size={14} />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
        <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: colors.gray[500],
            fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Cancel
          </button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

    </Modal>
  )
}

export default EditStudentModal
