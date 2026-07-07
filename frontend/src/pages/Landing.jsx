import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Landing() {
    const navigate = useNavigate()

    return (
        <div className="landing-container">
            <h1>Welcome to Green Fuzzy Ball</h1>
            <p>Your ultimate coaching companion.</p>
        </div>
    )
}

export default Landing
