import { useState, useEffect } from 'react'
import { breakpoints } from '../styles/tokens'

function useIsMobile(breakpoint = breakpoints.mobile) {
  const query = `(max-width: ${breakpoint - 1}px)`
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = e => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return isMobile
}

export default useIsMobile
