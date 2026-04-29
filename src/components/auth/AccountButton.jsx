import { useEffect, useRef, useState } from 'react'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function getShortEmail(email) {
  if (!email) return 'Account'
  const [name, domain] = email.split('@')
  if (!domain) return email.length > 18 ? `${email.slice(0, 16)}...` : email
  return name.length > 14 ? `${name.slice(0, 12)}...` : name
}

export default function AccountButton({ onOpenAuth }) {
  const { user, loading, isAuthenticated, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const email = user?.email ?? ''

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    setIsMenuOpen(false)
  }

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        className="account-button"
        onClick={() => onOpenAuth?.('login')}
        aria-label="Log in"
        title="Log in"
      >
        <LogIn size={16} />
        <span>로그인</span>
      </button>
    )
  }

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className="account-button account-button--signed-in"
        onClick={() => setIsMenuOpen((current) => !current)}
        aria-label="Open account menu"
        aria-expanded={isMenuOpen}
        title={email || 'Account'}
      >
        <UserRound size={16} />
        <span>{loading ? '계정' : getShortEmail(email)}</span>
      </button>

      {isMenuOpen ? (
        <div className="account-menu__popover" role="menu">
          <div className="account-menu__identity">
            <strong>{email || 'Signed in'}</strong>
            <small>Cloud account connected</small>
          </div>
          <button type="button" className="account-menu__action" onClick={handleSignOut} role="menuitem">
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      ) : null}
    </div>
  )
}
