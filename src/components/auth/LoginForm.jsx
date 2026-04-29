import { useState } from 'react'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginForm({ onSubmit, onResetPassword, loading = false }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    if (!password) {
      setError('Please enter your password.')
      return
    }

    const result = await onSubmit?.(email.trim(), password)
    if (result?.error) {
      setError(result.error.message || 'Could not sign in.')
    }
  }

  async function handleResetPassword() {
    setError('')
    setMessage('')

    if (!isValidEmail(email)) {
      setError('Enter your email first, then request a reset link.')
      return
    }

    const result = await onResetPassword?.(email.trim())
    if (result?.error) {
      setError(result.error.message || 'Could not send reset email.')
      return
    }

    setMessage('Password reset email sent if this account exists.')
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
        />
      </label>

      {error ? <p className="auth-status auth-status--error">{error}</p> : null}
      {message ? <p className="auth-status">{message}</p> : null}

      <button type="submit" className="auth-primary-button" disabled={loading}>
        {loading ? 'Signing in...' : 'Log In'}
      </button>

      <button type="button" className="auth-link-button" onClick={handleResetPassword} disabled={loading}>
        Reset password
      </button>
    </form>
  )
}
