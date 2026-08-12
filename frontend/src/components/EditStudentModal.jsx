import { useState } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Input from './Input'
import Button from './Button'
import Avatar from './Avatar'
import Modal from './Modal'
import { User, Phone, Mail, Trash2 } from 'lucide-react'
import { updateStudent, deleteStudent, linkStudentToMember, unlinkStudentFromMember, mergeStudentIntoMember } from '../services/api'
import useIsMobile from '../hooks/useIsMobile'

function EditStudentModal({ student, candidateMembers = [], onClose, onUpdated, onDeleted }) {
  const isMobile = useIsMobile()
  const isMember = !!student.is_member
  const isLinkedChild = isMember && !!student.parent_member_id
  const [name, setName] = useState(student.name || '')
  const [age, setAge] = useState(student.age ?? '')
  const [phone, setPhone] = useState(student.phone || '')
  const [email, setEmail] = useState(student.email || '')
  const [level, setLevel] = useState(student.level || 'beginner')
  const [notes, setNotes] = useState(student.notes || '')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [linkMemberId, setLinkMemberId] = useState('')
  const [linking, setLinking] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [mergeMemberId, setMergeMemberId] = useState('')
  const [merging, setMerging] = useState(false)

  const handleLink = async () => {
    if (!linkMemberId) return
    setError('')
    setLinking(true)
    try {
      const res = await linkStudentToMember(student.user_id, linkMemberId)
      onUpdated(res.data)
      onClose()
    } catch {
      setError('Could not link this student to a member. Please try again.')
    } finally {
      setLinking(false)
    }
  }

  const handleMerge = async () => {
    if (!mergeMemberId) return
    const target = candidateMembers.find(m => m.user_id === mergeMemberId)
    const msg = `Merge ${student.name}'s session history into ${target?.name}'s account?\n\n` +
      `This moves all past sessions and ratings onto ${target?.name}'s account and ` +
      `PERMANENTLY DELETES this "${student.name}" profile. This cannot be undone.`
    if (!window.confirm(msg)) return
    setError('')
    setMerging(true)
    try {
      const res = await mergeStudentIntoMember(student.user_id, mergeMemberId)
      onDeleted(student.user_id)
      onUpdated(res.data.merged_member)
      onClose()
    } catch {
      setError('Could not merge this student into a member account. Please try again.')
    } finally {
      setMerging(false)
    }
  }

  const handleUnlink = async () => {
    if (!window.confirm(`Unlink ${student.name} from ${student.parent_member_name}'s account? You'll be able to link them to the right parent afterward.`)) return
    setError('')
    setUnlinking(true)
    try {
      const res = await unlinkStudentFromMember(student.user_id)
      onUpdated(res.data)
    } catch {
      setError('Could not unlink this student. Please try again.')
    } finally {
      setUnlinking(false)
    }
  }

  const handleSave = async () => {
    if (!isMember && !name.trim()) return setError('Name is required')
    setError('')
    setLoading(true)
    try {
      const res = await updateStudent(student.user_id, { name, age: age ? parseInt(age) : null, phone, email, level, notes })
      onUpdated(res.data)
      onClose()
    } catch {
      setError('Could not update student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmMsg = isMember
      ? `Remove ${student.name} from your roster? They'll keep their account — you can just no longer see or book them.`
      : `Delete ${student.name}? This cannot be undone.`
    if (!window.confirm(confirmMsg)) return
    setDeleting(true)
    try {
      await deleteStudent(student.user_id)
      onDeleted(student.user_id)
      onClose()
    } catch {
      setError(isMember ? 'Could not remove this member from your roster.' : 'Could not delete student.')
    } finally {
      setDeleting(false)
    }
  }

  const lockedInputStyle = {
    width: '100%', padding: '12px 16px',
    border: `1.5px solid ${colors.gray[200]}`, borderRadius: radius.lg,
    fontSize: '15px', fontFamily: 'inherit', color: colors.gray[400],
    outline: 'none', boxSizing: 'border-box', backgroundColor: colors.gray[50],
    cursor: 'not-allowed'
  }

  return (
    <Modal
      title="Edit Student"
      subtitle={`Update ${student.name}'s profile`}
      onClose={onClose}
      maxWidth="520px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleDelete} disabled={deleting} style={{
            background: 'none', border: 'none', color: colors.error,
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: spacing[2]
          }}>
            <Trash2 size={14} />
            {isMember
              ? (deleting ? 'Removing...' : 'Remove from roster')
              : (deleting ? 'Deleting...' : 'Delete')}
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
      }
    >

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

      {isMember && (
        <div style={{
          backgroundColor: colors.gray[50], color: colors.gray[500],
          padding: spacing[3], borderRadius: radius.md,
          marginBottom: spacing[4], fontSize: '13px'
        }}>
          Name, email, and age were entered by the member who linked this person to you and can't be changed here.
          {isLinkedChild && (
            <div style={{ marginTop: spacing[2] }}>
              <button onClick={handleUnlink} disabled={unlinking} style={{
                background: 'none', border: 'none', color: colors.primary,
                fontWeight: '600', fontSize: '13px', cursor: unlinking ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', padding: 0
              }}>
                {unlinking ? 'Unlinking...' : 'Wrong parent? Unlink'}
              </button>
            </div>
          )}
        </div>
      )}

      {!isMember && candidateMembers.length > 0 && (
        <div style={{
          backgroundColor: colors.primaryLight, padding: spacing[4],
          borderRadius: radius.lg, marginBottom: spacing[5]
        }}>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>
            LINK TO A PARENT'S ACCOUNT
          </Typography>
          <div style={{ display: 'flex', gap: spacing[3] }}>
            <select
              value={linkMemberId}
              onChange={e => setLinkMemberId(e.target.value)}
              style={{
                flex: 1, padding: '10px 12px', border: `1.5px solid ${colors.gray[200]}`,
                borderRadius: radius.lg, fontSize: '14px', fontFamily: 'inherit',
                color: colors.black, backgroundColor: 'white'
              }}
            >
              <option value="">Select a parent...</option>
              {candidateMembers.map(m => (
                <option key={m.user_id} value={m.user_id}>{m.name}</option>
              ))}
            </select>
            <Button onClick={handleLink} disabled={!linkMemberId || linking} variant="outline">
              {linking ? 'Linking...' : 'Link'}
            </Button>
          </div>
        </div>
      )}

      {!isMember && candidateMembers.length > 0 && (
        <div style={{
          backgroundColor: colors.errorLight, padding: spacing[4],
          borderRadius: radius.lg, marginBottom: spacing[5],
          border: `1px solid ${colors.error}33`
        }}>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block', color: colors.error }}>
            THIS PERSON REGISTERED AS A MEMBER
          </Typography>
          <Typography variant="caption" color={colors.gray[500]} style={{ display: 'block', marginBottom: spacing[3] }}>
            If {name || student.name} signed up on the app themselves, merge their session history into their new account. This permanently deletes this old profile.
          </Typography>
          <div style={{ display: 'flex', gap: spacing[3] }}>
            <select
              value={mergeMemberId}
              onChange={e => setMergeMemberId(e.target.value)}
              style={{
                flex: 1, padding: '10px 12px', border: `1.5px solid ${colors.gray[200]}`,
                borderRadius: radius.lg, fontSize: '14px', fontFamily: 'inherit',
                color: colors.black, backgroundColor: 'white'
              }}
            >
              <option value="">Select their member account...</option>
              {candidateMembers.map(m => (
                <option key={m.user_id} value={m.user_id}>{m.name}</option>
              ))}
            </select>
            <Button
              onClick={handleMerge}
              disabled={!mergeMemberId || merging}
              variant="danger"
            >
              {merging ? 'Merging...' : 'Merge'}
            </Button>
          </div>
        </div>
      )}

      {/* Name + Age */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>FULL NAME</Typography>
          <Input icon={<User size={16} />} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} disabled={isMember} />
        </div>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>AGE (OPTIONAL)</Typography>
          <input
            type="number"
            min="1"
            max="120"
            placeholder="e.g. 34"
            value={age}
            onChange={e => setAge(e.target.value)}
            disabled={isMember}
            style={isMember ? lockedInputStyle : {
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

      {/* Phone + Email */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>PHONE</Typography>
          <Input icon={<Phone size={16} />} placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>EMAIL</Typography>
          <Input type="email" icon={<Mail size={16} />} placeholder="athlete@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isMember} />
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

    </Modal>
  )
}

export default EditStudentModal
