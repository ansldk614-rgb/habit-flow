import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

export default function AuthModal({ initialMode = 'login', onClose }) {
  const { signIn, signUp, resetPassword, isSupabaseConfigured } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function runAuthAction(action) {
    setIsSubmitting(true)
    try {
      return await action()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="auth-modal__head">
          <div>
            <span>Account</span>
            <h2 id="auth-modal-title">{mode === 'login' ? 'Log In' : 'Create Account'}</h2>
          </div>
          <button type="button" className="settings-icon-button" onClick={onClose} aria-label="Close account modal">
            <X size={18} />
          </button>
        </header>

        <p className="auth-help-text">
          Log in to prepare cloud sync between PC and mobile. Your current local data stays in this browser for now.
        </p>

        {!isSupabaseConfigured ? (
          <p className="auth-status auth-status--error">
            Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable account actions.
          </p>
        ) : null}

        <div className="auth-tabs" role="tablist" aria-label="Account mode">
          <button type="button" className={mode === 'login' ? 'auth-tab auth-tab--active' : 'auth-tab'} onClick={() => setMode('login')}>
            Log In
          </button>
          <button type="button" className={mode === 'signup' ? 'auth-tab auth-tab--active' : 'auth-tab'} onClick={() => setMode('signup')}>
            Sign Up
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm
            loading={isSubmitting}
            onSubmit={(email, password) => runAuthAction(() => signIn(email, password))}
            onResetPassword={(email) => runAuthAction(() => resetPassword(email))}
          />
        ) : (
          <SignupForm
            loading={isSubmitting}
            onSubmit={(email, password) => runAuthAction(() => signUp(email, password))}
          />
        )}
      </section>
    </div>
  )
}
