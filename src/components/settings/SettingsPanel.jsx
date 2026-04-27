import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { THEMES } from '../../constants/themeConstants'

export default function SettingsPanel({ selectedThemeId, onSelectTheme, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="settings-overlay" role="presentation" onMouseDown={onClose}>
      <aside
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="settings-panel__head">
          <div>
            <span>Settings</span>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button type="button" className="settings-icon-button" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </header>

        <section className="settings-section">
          <div className="settings-section__head">
            <span>Appearance</span>
            <strong>Theme</strong>
          </div>

          <div className="theme-card-list">
            {THEMES.map((theme) => {
              const isSelected = selectedThemeId === theme.id

              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-card ${isSelected ? 'theme-card--selected' : ''}`}
                  onClick={() => onSelectTheme(theme)}
                  aria-pressed={isSelected}
                >
                  <span className="theme-card__check" aria-hidden="true">
                    {isSelected ? <Check size={15} /> : null}
                  </span>
                  <span className="theme-card__body">
                    <strong>{theme.name}</strong>
                    <small>{theme.description}</small>
                    <span className="theme-swatches" aria-hidden="true">
                      <i style={{ background: theme.colors.bg }} />
                      <i style={{ background: theme.colors.surface }} />
                      <i style={{ background: theme.colors.accent }} />
                      <i style={{ background: theme.colors.danger }} />
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </aside>
    </div>
  )
}
