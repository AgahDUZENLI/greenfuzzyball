import { useState } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Input from './Input'
import Button from './Button'
import Modal from './Modal'
import { User, Phone, Mail, Plus } from 'lucide-react'
import { createStudent } from '../services/api'
import useIsMobile from '../hooks/useIsMobile'

function AddStudentModal({ onClose, onAdded }) {
  const isMobile = useIsMobile()
  const [name, setName] = useState('')
  const [ageGroup, setAgeGroup] = useState('adults')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [level, setLevel] = useState('beginner')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Name is required')
    setError('')
    setLoading(true)
    try {
      const res = await createStudent({ name, age_group: ageGroup, phone, email, level, notes })
      onAdded(res.data)
      onClose()
    } catch {
      setError('Could not add student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add Student" subtitle="Create a new athlete profile" onClose={onClose} maxWidth="520px">

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
          <Input icon={<User size={16} />} placeholder="Jordan Blake" value={name} onChange={e => setName(e.target.value)} />
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
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: colors.gray[500],
          fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
        }}>
          Cancel
        </button>
        <Button onClick={handleSubmit} disabled={loading}>
          <Plus size={16} />
          {loading ? 'Adding...' : 'Add Student'}
        </Button>
      </div>

    </Modal>
  )
}

export default AddStudentModal
