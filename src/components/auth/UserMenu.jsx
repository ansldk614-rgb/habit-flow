import { Cloud, LogIn, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function UserMenu({ onOpenAuth }) {
  const { user, loading, isAuthenticated, isSupabaseConfigured, signOut } = useAuth()
  const email = user?.email ?? ''

  async function handleSignOut() {
    await signOut()
  }

  if (loading) {
    return (
      <div className="user-menu-card">
        <span className="user-menu-card__icon"><Cloud size={17} /></span>
        <div>
          <strong>Checking account...</strong>
          <small>Local data remains available.</small>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="user-menu-card user-menu-card--signed-in">
        <span className="user-menu-card__icon"><UserRound size={17} /></span>
        <div>
          <strong>{email || 'Signed in'}</strong>
          <small>Cloud sync connection is ready. Data sync will be connected next.</small>
        </div>
        <button type="button" className="auth-secondary-button" onClick={handleSignOut}>
          <LogOut size={15} />
          Log Out
        </button>
      </div>
    )
  }

  return (
    <div className="user-menu-card">
      <span className="user-menu-card__icon"><Cloud size={17} /></span>
      <div>
        <strong>Local mode</strong>
        <small>
          {isSupabaseConfigured
            ? 'Log in to prepare PC and mobile cloud sync.'
            : 'Set Supabase environment variables to enable accounts.'}
        </small>
      </div>
      <button type="button" className="auth-secondary-button" onClick={() => onOpenAuth?.('login')}>
        <LogIn size={15} />
        Log In
      </button>
    </div>
  )
}
