import { useEffect, useRef } from 'react'

// Makes a locally-toggled "detail" view (open/close via useState, no route
// change) participate in browser history, so the phone's back button and
// the swipe-back gesture close it instead of skipping past it to the
// previous route.
function useBackNavigable(isOpen, close) {
  const closeRef = useRef(close)
  closeRef.current = close
  const openRef = useRef(false)
  const viaPopStateRef = useRef(false)

  useEffect(() => {
    if (isOpen && !openRef.current) {
      window.history.pushState({ backNavigable: true }, '')
    } else if (!isOpen && openRef.current && !viaPopStateRef.current) {
      window.history.back()
    }
    viaPopStateRef.current = false
    openRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const onPopState = () => {
      if (openRef.current) {
        viaPopStateRef.current = true
        closeRef.current()
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
}

export default useBackNavigable
