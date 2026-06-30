import BookSessionModal from './BookSessionModal'

function EditSessionModal({ session, onClose, onUpdated }) {
  return <BookSessionModal session={session} onClose={onClose} onUpdated={onUpdated} />
}

export default EditSessionModal
