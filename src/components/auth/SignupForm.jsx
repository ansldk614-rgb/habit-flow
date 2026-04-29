import { useState } from 'react'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function SignupForm({ onSubmit, loading = false }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password should be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const result = await onSubmit?.(email.trim(), password)
    if (result?.error) {
      setError(result.error.message || 'Could not create account.')
      return
    }

    setMessage('Account created. Check your email if confirmation is required.')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
        />
      </label>

      <label className="auth-field">
        <span>Confirm Password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat password"
        />
      </label>

      {error ? <p className="auth-status auth-status--error">{error}</p> : null}
      {message ? <p className="auth-status">{message}</p> : null}

      <button type="submit" className="auth-primary-button" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}
