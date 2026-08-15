import { useState } from 'react'
import { colors, spacing, radius } from '../styles/tokens'
import Typography from './Typography'
import Input from './Input'
import Button from './Button'
import Modal from './Modal'
import { MapPin, Building2, Link as LinkIcon, Check } from 'lucide-react'
import { createCourt, updateCourt } from '../services/api'

function LocationFormModal({ court = null, onClose, onSaved }) {
  const isEditMode = !!court
  const [name, setName] = useState(court?.name || '')
  const [city, setCity] = useState(court?.city || '')
  const [area, setArea] = useState(court?.area || '')
  const [address, setAddress] = useState(court?.address || '')
  const [mapUrl, setMapUrl] = useState(court?.map_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Name is required')
    if (!city.trim()) return setError('City is required')
    if (mapUrl.trim() && !/^https?:\/\//i.test(mapUrl.trim())) {
      return setError('Map link must start with http:// or https://')
    }
    setError('')
    setLoading(true)
    try {
      const data = {
        name: name.trim(),
        city: city.trim(),
        area: area.trim() || null,
        address: address.trim() || null,
        map_url: mapUrl.trim() || null
      }
      const res = isEditMode
        ? await updateCourt(court.court_id, data)
        : await createCourt(data)
      onSaved(res.data)
      onClose()
    } catch {
      setError('Could not save location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={isEditMode ? 'Edit Location' : 'Add Location'}
      subtitle={isEditMode ? 'Update this location\'s details' : 'Save a new location for booking sessions'}
      onClose={onClose}
      maxWidth="520px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: colors.gray[500],
            fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Cancel
          </button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Check size={16} />
            {loading ? 'Saving...' : 'Save Location'}
          </Button>
        </div>
      }
    >

      {error && (
        <div style={{
          backgroundColor: colors.errorLight, color: colors.error,
          padding: spacing[3], borderRadius: radius.md,
          marginBottom: spacing[4], fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>NAME</Typography>
          <Input icon={<MapPin size={16} />} placeholder="Court 4" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>AREA</Typography>
          <Input icon={<Building2 size={16} />} placeholder="Downtown" value={area} onChange={e => setArea(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: spacing[4] }}>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>CITY</Typography>
        <Input placeholder="San Francisco" value={city} onChange={e => setCity(e.target.value)} />
      </div>

      <div style={{ marginBottom: spacing[4] }}>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>ADDRESS (OPTIONAL)</Typography>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Street address or directions..."
          rows={2}
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

      <div style={{ marginBottom: spacing[2] }}>
        <Typography variant="label" mb={spacing[2]} style={{ display: 'block' }}>MAP LINK (OPTIONAL)</Typography>
        <Input icon={<LinkIcon size={16} />} placeholder="https://maps.google.com/..." value={mapUrl} onChange={e => setMapUrl(e.target.value)} />
      </div>

    </Modal>
  )
}

export default LocationFormModal
