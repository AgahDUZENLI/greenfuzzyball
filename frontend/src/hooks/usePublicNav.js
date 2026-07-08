import { useNavigate, useLocation } from 'react-router-dom'

function usePublicNav() {
  const navigate = useNavigate()
  const location = useLocation()

  function goHome() {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  function goToSection(id) {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/#${id}`)
    }
  }

  return { navigate, goHome, goToSection }
}

export default usePublicNav
